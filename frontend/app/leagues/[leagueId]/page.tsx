"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { TxButton } from "@/components/web3/TxButton";
import type { League, LeaderboardEntry } from "@/types";
import { buildJoinLeagueFreeTx, buildJoinLeagueTx } from "@/lib/contracts";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import React from "react";
import { toast } from "sonner";

// Mock data for the demo
const MOCK_LEAGUE: League = {
  id: 1, name: "OneChain Hoops Classic", sport: "NBA", entryFee: BigInt("10000000000"),
  maxEntrants: 20, currentEntrants: 14, startTime: Math.floor(Date.now() / 1000) - 1800,
  duration: 86400, status: 1, prizePool: BigInt("140000000000"), creator: "0x1234",
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: "0xabc1" as `0x${string}`, teamName: "Crypto Kings", score: 312, change: "up" },
  { rank: 2, address: "0xabc2" as `0x${string}`, teamName: "Diamond Hands FC", score: 298, change: "same" },
  { rank: 3, address: "0xabc3" as `0x${string}`, teamName: "Web3 Warriors", score: 281, change: "down" },
  { rank: 4, address: "0xabc4" as `0x${string}`, teamName: "Blockchain Ballers", score: 267, change: "up" },
  { rank: 5, address: "0xabc5" as `0x${string}`, teamName: "DeFi Dolphins", score: 254, change: "down" },
];

const TABS = ["Overview", "Bets", "Rosters"];

// Map URL leagueId → on-chain object ID
const LEAGUE_OBJECT_IDS: Record<string, string> = {
  "1": process.env.NEXT_PUBLIC_DEMO_LEAGUE_ID || "",
};

export default function LeagueDetailPage() {
  const { leagueId } = useParams();
  const account = useCurrentAccount();
  const [tab, setTab] = useState("Overview");
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD);
  const [hasTeam, setHasTeam] = useState(false);
  const league = MOCK_LEAGUE;

  const leagueObjectId = LEAGUE_OBJECT_IDS[String(leagueId)] || (typeof leagueId === "string" ? leagueId : "");
  const entryFeeMist = Number(league.entryFee);
  const buildJoin = () =>
    entryFeeMist === 0
      ? buildJoinLeagueFreeTx(leagueObjectId)
      : buildJoinLeagueTx(leagueObjectId, entryFeeMist);

  // Simulate live score updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev
          .map((e) => ({ ...e, score: e.score + Math.floor(Math.random() * 5) }))
          .sort((a, b) => b.score - a.score)
          .map((e, i) => ({
            ...e,
            rank: i + 1,
            change: e.rank === i + 1 ? "same" : e.rank > i + 1 ? "up" : "down",
          })) as LeaderboardEntry[]
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const prizePoolOCT = (Number(league.prizePool) / 1_000_000_000).toFixed(0);
  const entryFeeOCT = entryFeeMist === 0 ? "Free" : `${(entryFeeMist / 1_000_000_000).toFixed(0)} OCT`;
  const fillPct = league.maxEntrants > 0 ? Math.round((league.currentEntrants / league.maxEntrants) * 100) : 0;

  const prizeDistribution = [
    { place: "1st", emoji: "🥇", color: "#FFD700", pct: 60, amount: Math.floor((Number(prizePoolOCT) * 60) / 100) },
    { place: "2nd", emoji: "🥈", color: "#C0C0C0", pct: 25, amount: Math.floor((Number(prizePoolOCT) * 25) / 100) },
    { place: "3rd", emoji: "🥉", color: "#CD7F32", pct: 15, amount: Math.floor((Number(prizePoolOCT) * 15) / 100) },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">

        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-[#1b1b1b] p-10 relative overflow-hidden">
            {/* Background decoration */}
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
                    <span className="flex items-center gap-1 bg-[#D2FF00]/10 border border-[#D2FF00]/30 px-2 py-0.5 text-[10px] font-bold uppercase text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D2FF00] animate-pulse inline-block" />
                      Live
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {league.name.toUpperCase()}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">group</span>
                      {league.currentEntrants}/{league.maxEntrants} Participants
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      24H Remaining
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
                  <span>{fillPct}% ({league.currentEntrants}/{league.maxEntrants})</span>
                </div>
                <div className="w-full h-1 bg-[#2a2a2a]">
                  <div className="h-full bg-[#D2FF00] transition-all duration-700" style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              {/* CTA Buttons */}
              {!hasTeam ? (
                <div className="flex flex-wrap gap-4 items-center">
                  <TxButton
                    buildTx={buildJoin}
                    label="⚡ Join League"
                    loadingLabel="Joining..."
                    onSuccess={() => {
                      toast.success("Joined! Now build your team.");
                      setHasTeam(true);
                    }}
                    className="px-10 py-4 font-black uppercase tracking-tight text-[#171e00] active:scale-95 transition-all rounded-none border-0 h-auto"
                    style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)" } as React.CSSProperties}
                  />
                  <Link href={`/leagues/${leagueId}/team`}>
                    <button
                      className="px-10 py-4 font-black uppercase tracking-tight text-white border border-white/20 hover:border-[#D2FF00] hover:text-[#D2FF00] transition-all active:scale-95"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Build Team First →
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 border border-[#D2FF00]/30 bg-[#D2FF00]/10 px-5 py-3">
                    <span className="material-symbols-outlined text-[#D2FF00] text-base">check_circle</span>
                    <span className="text-[#D2FF00] font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Team Submitted
                    </span>
                  </div>
                  <Link href={`/leagues/${leagueId}/team`}>
                    <button
                      className="px-8 py-3 font-bold uppercase tracking-tight text-sm text-white border border-white/20 hover:border-white transition-all"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Edit Team →
                    </button>
                  </Link>
                </div>
              )}
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
                {/* Leaderboard Header */}
                <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-white/30 font-bold px-4 pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="col-span-1">#</span>
                  <span className="col-span-6">Team</span>
                  <span className="col-span-3 text-center">Score</span>
                  <span className="col-span-2 text-right">Change</span>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const isTop3 = entry.rank <= 3;
                    const rankColors = ["text-[#FFD700]", "text-[#C0C0C0]", "text-[#CD7F32]"];
                    const rankColor = isTop3 ? rankColors[entry.rank - 1] : "text-white/40";
                    const changeIcon = entry.change === "up" ? "arrow_upward" : entry.change === "down" ? "arrow_downward" : "remove";
                    const changeColor = entry.change === "up" ? "text-[#D2FF00]" : entry.change === "down" ? "text-red-400" : "text-white/30";
                    return (
                      <div
                        key={entry.address}
                        className={`grid grid-cols-12 items-center p-4 transition-all ${
                          isTop3 ? "bg-[#1b1b1b]" : "bg-[#161616] hover:bg-[#1b1b1b]"
                        }`}
                      >
                        <span className={`col-span-1 text-xl font-black ${rankColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {String(entry.rank).padStart(2, "0")}
                        </span>
                        <div className="col-span-6">
                          <p className="font-bold text-white text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {entry.teamName}
                          </p>
                          <p className="text-[10px] text-white/30 font-mono">
                            {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                          </p>
                        </div>
                        <div className="col-span-3 text-center">
                          <span className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {entry.score}
                          </span>
                          <span className="text-[10px] text-white/30 block uppercase tracking-widest">pts</span>
                        </div>
                        <div className={`col-span-2 flex justify-end items-center gap-1 ${changeColor}`}>
                          <span className="material-symbols-outlined text-base">{changeIcon}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {leaderboard.length === 0 && (
                  <div className="py-24 text-center text-white/30 text-sm">No entries yet</div>
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
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-white/10 block mb-4">groups</span>
                  <p className="text-white/40 text-sm uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Rosters visible after league starts
                  </p>
                </div>
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
