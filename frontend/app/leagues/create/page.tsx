"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildCreateLeagueTx } from "@/lib/contracts";
import { TxButton } from "@/components/web3/TxButton";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const SPORTS = [
  { value: "NBA", icon: "sports_basketball" },
  { value: "SOCCER", icon: "sports_soccer" },
];

const PRIZE_SPLITS = [
  { label: "Winner Takes All", sublabel: "Standard", splits: [100] },
  { label: "Top 2 Split",      sublabel: "Recommended", splits: [70, 30] },
  { label: "Top 3 Split",      sublabel: "Wide", splits: [60, 25, 15] },
  { label: "Top 5 Split",      sublabel: "Community", splits: [50, 25, 15, 7, 3] },
];

const DURATIONS = [
  { label: "3 Hours", value: 10800 },
  { label: "1 Day",   value: 86400 },
  { label: "1 Week",  value: 604800 },
];

export default function CreateLeaguePage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [form, setForm] = useState({
    name: "",
    sport: "NBA",
    entryFee: "25",
    maxEntrants: "100",
    prizeStructure: 1,
    duration: 86400,
  });

  const update = (key: string, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const estimatedPool = Number(form.entryFee) * Number(form.maxEntrants);
  const platformFee   = estimatedPool * 0.05;
  const netPayout     = estimatedPool - platformFee;

  const buildCreate = () =>
    buildCreateLeagueTx({
      name: form.name,
      sport: form.sport,
      entryFee: Math.floor(Number(form.entryFee) * 1_000_000_000),
      maxEntrants: Number(form.maxEntrants),
      startTimeMs: Date.now() + 3_600_000,
      durationMs: form.duration * 1000,
      prizeSplits: PRIZE_SPLITS[form.prizeStructure].splits,
    });

  if (!adminLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col items-center justify-center gap-6">
        <span className="material-symbols-outlined text-6xl text-white/20">lock</span>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Only
        </h2>
        <p className="text-white/40 text-sm">Only the platform admin can create leagues.</p>
        <Link href="/leagues">
          <button
            className="mt-4 px-8 py-3 font-black uppercase tracking-tight text-[#171e00]"
            style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ← Back to Leagues
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#e2e2e2]"
      style={{ backgroundColor: "#131313", fontFamily: "'Inter', sans-serif" }}
    >
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16" style={{ backgroundColor: "#131313" }}>
        <span className="text-2xl font-black italic text-[#D2FF00] tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          VELOCITY NEON
        </span>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 text-gray-400 text-sm font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Link href="/" className="hover:text-[#D2FF00] transition-colors">Lobby</Link>
            <Link href="/leagues" className="text-[#D2FF00] border-b-2 border-[#D2FF00] transition-colors">Leagues</Link>
            <Link href="/dashboard" className="hover:text-[#D2FF00] transition-colors">Draft</Link>
            <Link href="/portfolio" className="hover:text-[#D2FF00] transition-colors">Profile</Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400 hover:text-[#D2FF00] cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-gray-400 hover:text-[#D2FF00] cursor-pointer">account_circle</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <span className="text-[#c8f300] text-sm tracking-[0.2em] uppercase mb-4 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Engine Room
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create <br />
              <span className="text-[#c8f300]">League</span>
            </h1>
          </div>
          <div className="p-8 border-l-4 border-[#c8f300] max-w-sm" style={{ backgroundColor: "#1b1b1b" }}>
            <p className="text-[#c6c6c7] text-sm leading-relaxed">
              Configure your high-stakes fantasy contest. Define the parameters, set the stakes, and broadcast to the Velocity network.
            </p>
          </div>
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-12">

            {/* Section 01: Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1" style={{ backgroundColor: "rgba(68,73,51,0.2)" }} />
                <h2 className="font-bold text-xs tracking-widest text-[#c6c6c7] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  01. Identity
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#c6c6c7] uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  League Name
                </label>
                <input
                  type="text"
                  placeholder="ENTER TOURNAMENT NAME..."
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full border-none p-4 font-bold text-xl text-white focus:outline-none focus:border-b-2 focus:border-[#c8f300] transition-all placeholder:text-[#353535]"
                  style={{ backgroundColor: "#353535", fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update("sport", s.value)}
                    className={cn(
                      "group flex flex-col items-center justify-center p-8 transition-all active:scale-95",
                      form.sport === s.value
                        ? "border-b-4 border-[#c8f300]"
                        : "border-b-4 border-transparent hover:border-[#c8f300]"
                    )}
                    style={{ backgroundColor: form.sport === s.value ? "#2a2a2a" : "#1b1b1b" }}
                  >
                    <span
                      className="material-symbols-outlined text-4xl mb-4 transition-colors"
                      style={{ color: form.sport === s.value ? "#c8f300" : undefined }}
                    >
                      {s.icon}
                    </span>
                    <span className="font-bold tracking-widest uppercase text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {s.value}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section 02: Parameters */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1" style={{ backgroundColor: "rgba(68,73,51,0.2)" }} />
                <h2 className="font-bold text-xs tracking-widest text-[#c6c6c7] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  02. Parameters
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm text-[#c6c6c7] uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Entry Fee (OCT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.entryFee}
                    onChange={(e) => update("entryFee", e.target.value)}
                    className="w-full border-none p-4 font-bold text-2xl text-white focus:outline-none focus:border-b-2 focus:border-[#c8f300] transition-all"
                    style={{ backgroundColor: "#353535", fontFamily: "'Space Grotesk', sans-serif" }}
                  />
                  <p className="text-xs text-[#c6c6c7]">0 = Free to enter</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#c6c6c7] uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Max Entrants
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="200"
                    value={form.maxEntrants}
                    onChange={(e) => update("maxEntrants", e.target.value)}
                    className="w-full border-none p-4 font-bold text-2xl text-white focus:outline-none focus:border-b-2 focus:border-[#c8f300] transition-all"
                    style={{ backgroundColor: "#353535", fontFamily: "'Space Grotesk', sans-serif" }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm text-[#c6c6c7] uppercase tracking-tight block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => update("duration", d.value)}
                      className="px-6 py-3 font-bold text-xs tracking-widest uppercase transition-colors"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        backgroundColor: form.duration === d.value ? "#c8f300" : "#2a2a2a",
                        color: form.duration === d.value ? "#2a3500" : "#e2e2e2",
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 03: Rewards */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1" style={{ backgroundColor: "rgba(68,73,51,0.2)" }} />
                <h2 className="font-bold text-xs tracking-widest text-[#c6c6c7] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  03. Rewards
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRIZE_SPLITS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => update("prizeStructure", i)}
                    className="p-4 border-b-2 transition-all text-left"
                    style={{
                      backgroundColor: form.prizeStructure === i ? "#2a2a2a" : "#1b1b1b",
                      borderColor: form.prizeStructure === i ? "#c8f300" : "transparent",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase block mb-1"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: form.prizeStructure === i ? "#c8f300" : "#c6c6c7",
                      }}
                    >
                      {p.sublabel}
                    </span>
                    <span className="font-bold text-xs text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8">
              {/* Stats Card */}
              <div className="p-1 relative overflow-hidden" style={{ backgroundColor: "#1b1b1b" }}>
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl" style={{ backgroundColor: "rgba(200,243,0,0.1)" }} />
                <div className="p-10 relative z-10 space-y-12" style={{ backgroundColor: "#131313" }}>
                  <div className="flex justify-between items-start">
                    <span
                      className="material-symbols-outlined text-4xl text-[#c8f300]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      monetization_on
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-[#c6c6c7] tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Status
                      </span>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-2 h-2 rounded-full bg-[#c8f300] animate-pulse" />
                        <span className="font-bold text-xs uppercase italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Calculating...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-[#c6c6c7] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Estimated Prize Pool
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black tracking-tighter text-[#c8f300]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {estimatedPool.toLocaleString()}
                      </span>
                      <span className="font-bold text-xl uppercase italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        OCT
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-[#444933]/10">
                    <div className="flex justify-between text-xs uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-[#c6c6c7]">Platform Fee (5%)</span>
                      <span>{platformFee.toLocaleString()} OCT</span>
                    </div>
                    <div className="flex justify-between text-xs uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-[#c6c6c7]">Net Payout</span>
                      <span>{netPayout.toLocaleString()} OCT</span>
                    </div>
                    <div className="flex justify-between text-xs uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-[#c6c6c7]">Duration</span>
                      <span>{DURATIONS.find((d) => d.value === form.duration)?.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deploy Button */}
              <TxButton
                buildTx={buildCreate}
                label="⚡  Deploy League"
                loadingLabel="Deploying on-chain..."
                disabled={!form.name}
                onSuccess={() => router.push("/leagues")}
                className="w-full py-8 px-10 transition-all active:scale-[0.98] bg-[#c8f300] hover:bg-[#afd500] text-[#2a3500] rounded-none font-black italic text-2xl uppercase tracking-tighter"
                style={{ fontFamily: "'Space Grotesk', sans-serif" } as any}
              />

              {/* Stadium image */}
              <div className="h-64 overflow-hidden" style={{ backgroundColor: "#0e0e0e" }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDnC-J8ol8ASrgJpp5r_TW6WA3ags9nXtoVPe1P0hMpJV-oA7LGwjSHVDLKIjPHg8OOjEe6iYj4VLzOFw4LoRBHDiFOFOlYA4qVsyoDS27DWxdUMV77k-b_uHh5trhd5EFTNES4uQk6QgSE9RbDu-Qwm_K7QiJ6PxlAJ1DKWffZwKhlbDfczshXrAWokxFx_eAyjkBqDM9-98TEg7JJqjLYphlG5KPB1QJ8_iEcwAtg2HVXY8UxrI_Snc29ILBV71TllmQtaA1w9_y"
                  alt="Stadium crowd at night"
                  className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-4 z-50" style={{ backgroundColor: "rgba(27,27,27,0.95)", backdropFilter: "blur(12px)" }}>
        {[
          { icon: "sports_score", label: "Lobby", href: "/" },
          { icon: "emoji_events", label: "Leagues", href: "/leagues" },
          { icon: "query_stats", label: "Draft", href: "/dashboard" },
          { icon: "person", label: "Profile", href: "/portfolio" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center text-gray-500 py-1 px-4 active:scale-90 transition-all duration-300">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
