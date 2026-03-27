"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Navbar } from "@/components/layout/Navbar";
import { type Athlete, RARITY_NAMES } from "@/lib/athletes";
import { useOwnedAthletes } from "@/hooks/useAthletes";
import { useExistingTeam } from "@/hooks/useExistingTeam";
import { getMultiplier, formatScore } from "@/lib/utils";
import { buildSubmitTeamAndJoinFreeTx, buildSubmitTeamAndJoinTx, buildSubmitTeamTx } from "@/lib/contracts";
import { toast } from "sonner";
import Link from "next/link";


// Slot definitions per sport
const SLOT_DEFS: Record<string, { pos: string; label: string }[]> = {
  NBA: [
    { pos: "PG", label: "Point Guard" },
    { pos: "SG", label: "Shooting Guard" },
    { pos: "SF", label: "Small Forward" },
    { pos: "PF", label: "Power Forward" },
    { pos: "C",  label: "Center" },
  ],
  SOCCER: [
    { pos: "GK",  label: "Goalkeeper" },
    { pos: "DEF", label: "Defender" },
    { pos: "MID", label: "Midfielder" },
    { pos: "MID", label: "Midfielder" },
    { pos: "FWD", label: "Forward" },
  ],
};

// Detect sport and entry fee from query params (passed by league detail page)
function useLeagueParams(_leagueId: string): { sport: "NBA" | "SOCCER"; entryFeeMist: number } {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("sport");
    const fee = parseInt(p.get("entryFee") ?? "0", 10);
    return {
      sport: s === "SOCCER" ? "SOCCER" : "NBA",
      entryFeeMist: isNaN(fee) ? 0 : fee,
    };
  }
  return { sport: "NBA", entryFeeMist: 0 };
}

const POSITION_FILTERS: Record<string, string[]> = {
  NBA: ["All", "Guards", "Forwards", "Centers"],
  SOCCER: ["All", "GK", "DEF", "MID", "FWD"],
};

const POSITION_MAP: Record<string, string[]> = {
  Guards:   ["PG", "SG"],
  Forwards: ["SF", "PF"],
  Centers:  ["C"],
};

// Countdown hook
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export default function TeamBuilderPage() {
  const { leagueId } = useParams();
  const router = useRouter();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { sport, entryFeeMist } = useLeagueParams(String(leagueId));
  const slots = SLOT_DEFS[sport] || SLOT_DEFS.NBA;

  const [selectedAthletes, setSelectedAthletes] = useState<(Athlete | null)[]>(
    () => slots.map(() => null)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [posFilter, setPosFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);

  const countdown = useCountdown(4 * 3600 + 22 * 60 + 15);

  const { athletes: allOwned, loading: loadingAthletes } = useOwnedAthletes();
  const ownedAthletes = allOwned.filter((a) => a.sport === sport);

  const { tokenIds: existingTokenIds, loading: loadingExisting } = useExistingTeam(
    typeof leagueId === "string" ? leagueId : ""
  );

  // Pre-populate slots when existing team is loaded
  useEffect(() => {
    if (loadingExisting || !existingTokenIds || ownedAthletes.length === 0) return;
    const pre = slots.map((_, i) => {
      const tokenId = existingTokenIds[i];
      return ownedAthletes.find((a) => a.tokenId === tokenId) ?? null;
    });
    setSelectedAthletes(pre);
  }, [loadingExisting, existingTokenIds, ownedAthletes.length]);

  const filteredAthletes = ownedAthletes.filter((a) => {
    if (posFilter === "All") return true;
    if (sport === "SOCCER") return a.position === posFilter;
    const mapped = POSITION_MAP[posFilter];
    return mapped ? mapped.includes(a.position) : true;
  });

  // When a slot is active, show only compatible athletes
  const displayAthletes = activeSlot !== null
    ? filteredAthletes.filter((a) => a.position === slots[activeSlot].pos)
    : filteredAthletes;

  const selectedIds = new Set(selectedAthletes.filter(Boolean).map((a) => a!.id));

  const totalProjected = selectedAthletes
    .filter(Boolean)
    .reduce((sum, a) => sum + a!.baseScore * getMultiplier(a!.rarity), 0);

  const filledCount = selectedAthletes.filter(Boolean).length;

  function handleSlotClick(idx: number) {
    setActiveSlot((prev) => (prev === idx ? null : idx));
  }

  function handleRemove(idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedAthletes((prev) => prev.map((a, i) => (i === idx ? null : a)));
  }

  function handleAthleteSelect(athlete: Athlete) {
    if (activeSlot === null) return;
    const required = slots[activeSlot].pos;
    if (athlete.position !== required) {
      toast.error(`${athlete.name} plays ${athlete.position} — need ${required}`);
      return;
    }
    if (selectedIds.has(athlete.id)) {
      toast.error("Athlete already in roster");
      return;
    }
    setSelectedAthletes((prev) => prev.map((a, i) => (i === activeSlot ? athlete : a)));
    setActiveSlot(null);
  }

  async function handleSubmit() {
    if (filledCount < slots.length) {
      toast.error(`Fill all ${slots.length} roster slots first`);
      return;
    }
    setSubmitting(true);
    const leagueObjectId = typeof leagueId === "string" ? leagueId : "";
    const tokenIds = selectedAthletes.filter(Boolean).map((a) => a!.tokenId);
    const isEdit = !!existingTokenIds;
    const tx = isEdit
      ? buildSubmitTeamTx(leagueObjectId, tokenIds)
      : entryFeeMist === 0
      ? buildSubmitTeamAndJoinFreeTx(leagueObjectId, tokenIds)
      : buildSubmitTeamAndJoinTx(leagueObjectId, tokenIds, entryFeeMist);
    try {
      if (!tx) {
        await new Promise((r) => setTimeout(r, 1200));
        toast.success(isEdit ? "Team updated! (demo mode)" : "Team submitted & joined! (demo mode)");
        router.push(`/leagues/${leagueId}`);
        return;
      }
      const result = await signAndExecute({ transaction: tx });
      toast.success(isEdit ? "Team updated on-chain!" : "Team submitted & joined on-chain!", {
        action: {
          label: "Explorer",
          onClick: () => window.open(`https://explorer-testnet.onelabs.cc/txblock/${result.digest}`, "_blank"),
        },
      });
      router.push(`/leagues/${leagueId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit team");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">

        {/* Hero */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link href={`/leagues/${leagueId}`} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 hover:text-[#D2FF00] transition-colors mb-4 font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to League
              </Link>
              <span className="block text-xs font-bold tracking-[0.2em] text-[#D2FF00] mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {sport} · Championship Season 24/25
              </span>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Build your<br />
                <span className="text-[#D2FF00]">Team.</span>
              </h1>
            </div>

            {/* Stats bar */}
            <div className="bg-[#1b1b1b] p-8 border-l-4 border-[#D2FF00] flex items-center gap-8 flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Projected Score
                </span>
                <span className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatScore(totalProjected)}
                </span>
              </div>
              <div className="h-12 w-px bg-[#2a2a2a]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Slots Filled
                </span>
                <span className="text-4xl font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {filledCount}/{slots.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left: Roster ── */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic tracking-tight uppercase text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Your Roster
              </h2>
              <span className="text-xs font-bold tracking-widest text-white/50 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {filledCount} / {slots.length} Positions
              </span>
            </div>

            {/* Roster grid — 2 col for NBA, different layout for soccer */}
            <div className={`grid gap-4 ${sport === "NBA" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {slots.map((slot, i) => {
                const athlete = selectedAthletes[i];
                const isActive = activeSlot === i;
                const isFilled = !!athlete;

                return (
                  <div
                    key={i}
                    onClick={() => handleSlotClick(i)}
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${
                      i === 3 || i === 4 ? "aspect-auto min-h-[140px]" : "aspect-[4/5]"
                    } ${
                      isActive
                        ? "bg-[#1f2800] border border-[#D2FF00]/60"
                        : isFilled
                        ? "bg-[#1b1b1b] border border-[#D2FF00]/20 hover:border-[#D2FF00]/50"
                        : "bg-[#1b1b1b] border border-transparent hover:border-[#D2FF00]/30"
                    }`}
                    style={
                      // For PF and C (idx 3,4 in NBA), make them shorter
                      (i === 3 || i === 4) && sport === "NBA"
                        ? { aspectRatio: "unset", minHeight: "140px" }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                      {/* Top */}
                      <div>
                        <span className={`inline-block px-2 py-1 text-[10px] font-black uppercase ${
                          isFilled ? "bg-[#D2FF00] text-[#171e00]" : "bg-[#353535] text-white/50"
                        }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {slot.pos}
                        </span>
                        <p className="mt-3 text-white/40 text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {slot.label}
                        </p>
                      </div>

                      {/* Bottom */}
                      {isFilled ? (
                        <div className="relative z-10">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-black uppercase leading-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {athlete!.name}
                              </h3>
                              <p className="text-[#D2FF00] font-black italic text-sm mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {formatScore(athlete!.baseScore * getMultiplier(athlete!.rarity))} PTS PROJ.
                              </p>
                              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {RARITY_NAMES[athlete!.rarity]} · ×{getMultiplier(athlete!.rarity).toFixed(1)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleRemove(i, e)}
                              className="w-6 h-6 bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5"
                            >
                              <span className="material-symbols-outlined text-xs text-white/50 hover:text-red-300">close</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
                          <button className="w-12 h-12 rounded-full border border-dashed border-[#D2FF00]/40 flex items-center justify-center text-[#D2FF00]/60 group-hover:scale-110 group-hover:border-[#D2FF00] group-hover:text-[#D2FF00] transition-all">
                            <span className="material-symbols-outlined">add</span>
                          </button>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 group-hover:text-white/50 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {isActive ? "Select from collection →" : "Assign Athlete"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Athlete image bg */}
                    {isFilled && (
                      <img
                        src={athlete!.imageUrl}
                        alt={athlete!.name}
                        className="absolute right-[-15%] bottom-0 h-4/5 object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-30 group-hover:opacity-80 pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}

                    {/* Active glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-[#D2FF00]/5 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting || filledCount < slots.length}
                className="w-full py-6 text-[#171e00] font-black italic text-xl tracking-tighter uppercase transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: "linear-gradient(135deg, #c8f300 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {submitting ? "Submitting..." : existingTokenIds ? "Update Team" : "Submit Team & Join League"}
              </button>
              <p className="text-center mt-4 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Roster lock in: {countdown}
              </p>
            </div>
          </div>

          {/* ── Right: Collection ── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic tracking-tight uppercase text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Your Collection
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 bg-[#2a2a2a] flex items-center justify-center hover:bg-[#353535] transition-colors">
                  <span className="material-symbols-outlined text-sm text-white/60">filter_list</span>
                </button>
              </div>
            </div>

            {/* Sport badge + active slot hint */}
            {activeSlot !== null && (
              <div className="flex items-center gap-2 bg-[#D2FF00]/10 border border-[#D2FF00]/30 px-4 py-3">
                <span className="material-symbols-outlined text-[#D2FF00] text-sm">arrow_right_alt</span>
                <span className="text-[#D2FF00] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Selecting: {slots[activeSlot].pos} — {slots[activeSlot].label}
                </span>
              </div>
            )}

            {/* Position filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {POSITION_FILTERS[sport].map((f) => (
                <button
                  key={f}
                  onClick={() => setPosFilter(f)}
                  className={`px-4 py-2 font-black text-xs uppercase whitespace-nowrap transition-colors flex-shrink-0 ${
                    posFilter === f
                      ? "bg-[#D2FF00] text-[#171e00]"
                      : "bg-[#2a2a2a] text-white/50 hover:text-white hover:bg-[#353535]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Athlete list */}
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#353535 #131313" }}>
              {displayAthletes.length === 0 && (
                <div className="py-16 text-center text-white/30 text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  No athletes found
                </div>
              )}
              {displayAthletes.map((athlete) => {
                const isSelected = selectedIds.has(athlete.id);
                const isCompatible = activeSlot === null || athlete.position === slots[activeSlot].pos;

                return (
                  <div
                    key={athlete.id}
                    onClick={() => isCompatible && !isSelected && handleAthleteSelect(athlete)}
                    className={`group flex items-center gap-5 p-4 transition-all duration-200 ${
                      isSelected
                        ? "bg-[#D2FF00]/10 border border-[#D2FF00]/30 cursor-default"
                        : isCompatible
                        ? "bg-[#1b1b1b] hover:bg-[#2a2a2a] cursor-pointer border border-transparent hover:border-[#D2FF00]/20"
                        : "bg-[#161616] opacity-40 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-[#353535] overflow-hidden flex-shrink-0 relative">
                      <img
                        src={athlete.imageUrl}
                        alt={athlete.name}
                        className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? "grayscale-0" : "grayscale group-hover:grayscale-0"}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}&backgroundColor=353535&textColor=D2FF00`;
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#D2FF00]/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#D2FF00]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-black text-lg uppercase leading-none text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {athlete.name}
                          </h4>
                          <p className="text-[11px] text-white/40 mt-1 font-mono">
                            {athlete.sport} · {athlete.position} · {RARITY_NAMES[athlete.rarity]}
                          </p>
                        </div>
                        <span className="text-xl font-black text-white flex-shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {athlete.baseScore} <span className="text-[10px] text-[#D2FF00]">OVR</span>
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-5">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Proj. Pts</span>
                          <span className="text-xs font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {formatScore(athlete.baseScore * getMultiplier(athlete.rarity))}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Multiplier</span>
                          <span className="text-xs font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            ×{getMultiplier(athlete.rarity).toFixed(1)}
                          </span>
                        </div>
                        {!isSelected && isCompatible && (
                          <button className="ml-auto bg-[#D2FF00]/10 text-[#D2FF00] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#D2FF00] hover:text-[#171e00] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Select
                          </button>
                        )}
                        {isSelected && (
                          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            In Roster ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1b1b1b] mt-20 w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-7xl mx-auto">
          <div className="text-lg font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</div>
          <div className="flex flex-wrap justify-center gap-8">
            {["Terms of Service", "Privacy Policy", "Responsible Gaming", "Support"].map((item) => (
              <a key={item} href="#" className="text-[10px] tracking-widest uppercase font-medium text-white/30 hover:text-[#D2FF00] transition-colors">{item}</a>
            ))}
          </div>
          <p className="text-[10px] tracking-widest uppercase font-medium text-white/30">© 2024 ONEFANTASY. ENGINEERED FOR VELOCITY.</p>
        </div>
      </footer>
    </div>
  );
}
