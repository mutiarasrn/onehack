"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface OnChainLeague {
  leagueId: string;
  name: string;
  sport: string;
  entryFee: string;
  maxEntrants: number;
  startTimeMs: string;
  endTimeMs: string;
  status: number;
  entrants: string[];
  prizePool: string;
  prizeSplits: number[];
  winners: string[];
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  tokenIds: number[];
  totalScore: number;
}

const TABS = ["Overview", "Bets", "Rosters"];

function formatTimeLeft(endTimeMs: number, status: number): string {
  if (status === 2) return "FINISHED";
  const diff = endTimeMs - Date.now();
  if (diff <= 0) return status === 1 ? "LIVE" : "STARTING";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 48) return `${Math.floor(h / 24)}D REMAINING`;
  return `${h}H ${m}M REMAINING`;
}

export default function LeagueDetailPage() {
  const { leagueId } = useParams();
  const router = useRouter();
  const account = useCurrentAccount();
  const [tab, setTab] = useState("Overview");
  const [league, setLeague] = useState<OnChainLeague | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeague, setLoadingLeague] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  // Fetch league data
  useEffect(() => {
    if (!leagueId) return;
    async function fetchLeague() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/leagues/${leagueId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLeague(data);
      } catch (e) {
        console.error("Failed to fetch league:", e);
      } finally {
        setLoadingLeague(false);
      }
    }
    fetchLeague();
  }, [leagueId]);

  // Fetch leaderboard data
  useEffect(() => {
    if (!leagueId) return;
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/leaderboard/${leagueId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLeaderboard(data.leaderboard ?? []);
      } catch (e) {
        console.error("Failed to fetch leaderboard:", e);
      } finally {
        setLoadingBoard(false);
      }
    }
    fetchLeaderboard();
    // Poll every 30s for live updates
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, [leagueId]);

  // Check if connected wallet has already joined
  useEffect(() => {
    if (account && league) {
      setHasJoined(league.entrants.includes(account.address));
    }
  }, [account, league]);

  if (loadingLeague) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <p className="text-white/40 text-sm uppercase tracking-widest">Loading league...</p>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <p className="text-white/40 text-sm uppercase tracking-widest">League not found</p>
      </div>
    );
  }

  const entryFeeMist = Number(league.entryFee);
  const prizePoolMist = Number(league.prizePool);
  const entryFeeOCT = entryFeeMist === 0 ? "Free" : `${(entryFeeMist / 1_000_000_000).toFixed(2)} OCT`;
  const prizePoolOCT = (prizePoolMist / 1_000_000_000).toFixed(2);
  const fillPct = league.maxEntrants > 0 ? Math.round((league.entrants.length / league.maxEntrants) * 100) : 0;

  // Prize distribution from on-chain prize_splits
  const prizeDistribution = league.prizeSplits.map((pct, i) => {
    const emojis = ["🥇", "🥈", "🥉"];
    const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
    const places = ["1st", "2nd", "3rd"];
    return {
      place: places[i] ?? `${i + 1}th`,
      emoji: emojis[i] ?? "🏅",
      color: colors[i] ?? "#888",
      pct,
      amount: ((prizePoolMist / 1_000_000_000) * pct / 100).toFixed(2),
    };
  });

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">

        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-[#1b1b1b] p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-[180px] opacity-5 select-none pointer-events-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900 }}>
              {league.sport === "NBA" ? "🏀" : league.sport === "SOCCER" ? "⚽" : "🏆"}
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#D2FF00] uppercase tracking-[0.2em] text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {league.sport}
                    </span>
                    {league.status === 0 && (
                      <span className="flex items-center gap-1 bg-[#D2FF00]/10 border border-[#D2FF00]/30 px-2 py-0.5 text-[10px] font-bold uppercase text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D2FF00] animate-pulse inline-block" />
                        Open
                      </span>
                    )}
                    {league.status === 1 && (
                      <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                        Live
                      </span>
                    )}
                    {league.status === 2 && (
                      <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Finished
                      </span>
                    )}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {league.name.toUpperCase()}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">group</span>
                      {league.entrants.length}/{league.maxEntrants} Participants
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {formatTimeLeft(Number(league.endTimeMs), league.status)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">payments</span>
                      Entry: {entryFeeOCT}
                    </span>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total Prize Pool</p>
                  <p className="text-5xl font-black text-[#D2FF00] leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {prizePoolOCT}
                  </p>
                  <p className="text-sm text-white/40 mt-1">OCT Tokens</p>
                </div>
              </div>

              {/* Participation bar */}
              <div className="mb-8">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span>Slots Filled</span>
                  <span>{fillPct}% ({league.entrants.length}/{league.maxEntrants})</span>
                </div>
                <div className="w-full h-1 bg-[#2a2a2a]">
                  <div className="h-full bg-[#D2FF00] transition-all duration-700" style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              {/* CTA Buttons */}
              {league.status === 0 && !hasJoined ? (
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => router.push(`/leagues/${leagueId}/team?sport=${league.sport}&entryFee=${entryFeeMist}`)}
                    className="px-10 py-4 font-black uppercase tracking-tight text-[#171e00] active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    ⚡ Build Team & Join
                  </button>
                </div>
              ) : hasJoined ? (
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 border border-[#D2FF00]/30 bg-[#D2FF00]/10 px-5 py-3">
                    <span className="material-symbols-outlined text-[#D2FF00] text-base">check_circle</span>
                    <span className="text-[#D2FF00] font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Joined
                    </span>
                  </div>
                  <Link href={`/leagues/${leagueId}/team?sport=${league.sport}&entryFee=${entryFeeMist}`}>
                    <button
                      className="px-8 py-3 font-bold uppercase tracking-tight text-sm text-white border border-white/20 hover:border-white transition-all"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Edit Team →
                    </button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Main Content: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">

            {/* Prize Distribution */}
            <div className="bg-[#1b1b1b] p-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Prize Distribution
              </h3>
              {prizeDistribution.length > 0 ? (
                <div className="space-y-4">
                  {prizeDistribution.map(({ place, emoji, color, pct, amount }) => (
                    <div key={place}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{emoji}</span>
                          <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{place} Place</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{amount} OCT</span>
                          <span className="text-[10px] text-white/40 ml-2">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-0.5 bg-[#2a2a2a]">
                        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm">No prize splits defined</p>
              )}
            </div>

            {/* League Rules */}
            <div className="bg-[#1b1b1b] p-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                League Rules
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "group", label: "Max Participants", value: `${league.maxEntrants} teams` },
                  { icon: "payments", label: "Entry Fee", value: entryFeeOCT },
                  { icon: "sports_basketball", label: "Sport", value: league.sport },
                  { icon: "inventory_2", label: "Roster Size", value: "5 athletes" },
                  { icon: "security", label: "Payout", value: "Auto on-chain" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3 text-white/50">
                      <span className="material-symbols-outlined text-base text-[#D2FF00]/60">{icon}</span>
                      <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    </div>
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard + Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#444933]/20 mb-8">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-4 font-black uppercase tracking-widest text-xs transition-colors ${
                    tab === t
                      ? "text-[#D2FF00] border-b-2 border-[#D2FF00]"
                      : "text-white/40 hover:text-white"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t}
                </button>
              ))}
              <div className="ml-auto flex items-center pr-1">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#D2FF00] font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2FF00] animate-pulse inline-block" />
                  Live Updates
                </span>
              </div>
            </div>

            {tab === "Overview" && (
              <div>
                <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-white/30 font-bold px-4 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="col-span-1">#</span>
                  <span className="col-span-7">Address</span>
                  <span className="col-span-4 text-right">Score</span>
                </div>

                {loadingBoard ? (
                  <div className="py-16 text-center text-white/30 text-sm">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-24 text-center text-white/30 text-sm">No entries yet — be the first to join!</div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry) => {
                      const isTop3 = entry.rank <= 3;
                      const rankColors = ["text-[#FFD700]", "text-[#C0C0C0]", "text-[#CD7F32]"];
                      const rankColor = isTop3 ? rankColors[entry.rank - 1] : "text-white/40";
                      const isMe = account?.address === entry.address;
                      return (
                        <div
                          key={entry.address}
                          className={`grid grid-cols-12 items-center p-4 transition-all ${
                            isMe
                              ? "bg-[#D2FF00]/10 border border-[#D2FF00]/20"
                              : isTop3
                              ? "bg-[#1b1b1b]"
                              : "bg-[#161616] hover:bg-[#1b1b1b]"
                          }`}
                        >
                          <span className={`col-span-1 text-xl font-black ${rankColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {String(entry.rank).padStart(2, "0")}
                          </span>
                          <div className="col-span-7">
                            <p className="font-mono text-xs text-white/60">
                              {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                              {isMe && <span className="ml-2 text-[#D2FF00] font-bold non-mono">(You)</span>}
                            </p>
                            {entry.tokenIds.length > 0 && (
                              <p className="text-[10px] text-white/30 mt-0.5">{entry.tokenIds.length} athletes</p>
                            )}
                          </div>
                          <div className="col-span-4 text-right">
                            <span className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {entry.totalScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-white/30 block uppercase tracking-widest">pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "Bets" && (
              <div className="bg-[#1b1b1b] p-8">
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-white/10 block mb-4">casino</span>
                  <p className="text-white/40 text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Betting coming soon
                  </p>
                </div>
              </div>
            )}

            {tab === "Rosters" && (
              <div className="bg-[#1b1b1b] p-8">
                {league.entrants.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-6xl text-white/10 block mb-4">groups</span>
                    <p className="text-white/40 text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      No participants yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {league.entrants.length} Participants
                    </h3>
                    {league.entrants.map((addr, i) => (
                      <div key={addr} className="flex items-center gap-4 p-3 bg-[#161616]">
                        <span className="text-white/30 text-xs font-mono w-6">{i + 1}</span>
                        <span className="font-mono text-xs text-white/60">{addr.slice(0, 10)}...{addr.slice(-8)}</span>
                        {addr === account?.address && (
                          <span className="ml-auto text-[10px] font-bold text-[#D2FF00] uppercase tracking-widest">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#131313] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</div>
          <div className="flex gap-8">
            {["Twitter", "Discord", "Terms of Service", "Privacy Policy", "Support"].map((item) => (
              <a key={item} href="#" className="text-sm tracking-wide text-white/40 hover:text-[#D2FF00] transition-colors">{item}</a>
            ))}
          </div>
          <div className="text-sm tracking-wide text-white/40">© 2024 OneFantasy. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
