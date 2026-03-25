"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

const OCT = (n: number) => BigInt(Math.floor(n * 1_000_000_000));

const MOCK_LEAGUES = [
  {
    id: 1, name: "OneChain Hoops Classic", sport: "Basketball", tag: "Basketball",
    entryFee: "Free Entry", prizePool: "500 ONE", slots: 32, maxSlots: 50,
    timeLeft: "04H 22M LEFT", status: 0, fillPct: 65,
  },
  {
    id: 2, name: "Grand Prix Sprint", sport: "F1", tag: "F1",
    entryFee: "10 ONE", prizePool: "1,000 ONE", slots: 15, maxSlots: 100,
    timeLeft: "1D 12H LEFT", status: 0, fillPct: 15,
  },
  {
    id: 3, name: "Midnight Derby", sport: "Soccer", tag: "Daily Challenge",
    entryFee: "Free Entry", prizePool: "500 ONE", slots: 0, maxSlots: 120,
    timeLeft: "Starting 12:00 AM", status: 0, fillPct: 0,
  },
  {
    id: 4, name: "Founders Series IV", sport: "Basketball", tag: "Invitational Pro",
    entryFee: "Whitelist", prizePool: "2,000 ONE", slots: 15, maxSlots: 15,
    timeLeft: "FULL", status: 0, fillPct: 100,
  },
  {
    id: 5, name: "Crypto Masters", sport: "F1", tag: "Flash Event",
    entryFee: "50 ONE", prizePool: "5,000 ONE", slots: 8, maxSlots: 64,
    timeLeft: "2D 4H LEFT", status: 0, fillPct: 12,
  },
  {
    id: 6, name: "NBA All-Stars Showdown", sport: "Basketball", tag: "Basketball",
    entryFee: "25 ONE", prizePool: "175 ONE", slots: 7, maxSlots: 10,
    timeLeft: "LIVE", status: 1, fillPct: 70,
  },
  {
    id: 7, name: "Champions League Fantasy", sport: "Soccer", tag: "Soccer",
    entryFee: "5 ONE", prizePool: "155 ONE", slots: 31, maxSlots: 50,
    timeLeft: "LIVE", status: 1, fillPct: 62,
  },
  {
    id: 8, name: "Crypto Cup", sport: "Soccer", tag: "Soccer",
    entryFee: "50 ONE", prizePool: "400 ONE", slots: 8, maxSlots: 8,
    timeLeft: "FINISHED", status: 2, fillPct: 100,
  },
];

const TABS = ["Open", "Active", "Completed"];
const STATUS_MAP: Record<string, number> = { Open: 0, Active: 1, Completed: 2 };
const SPORTS = ["All Sports", "Basketball", "F1", "Soccer"];

const INFO_ITEMS = [
  {
    icon: "security",
    title: "Secured on-chain",
    desc: "All prize pools are locked in smart contracts and distributed automatically upon league completion.",
  },
  {
    icon: "insights",
    title: "Live Telemetry",
    desc: "Real-time data feeds directly from the track and stadium ensure ultra-low latency fantasy scoring.",
  },
  {
    icon: "social_leaderboard",
    title: "Global Ranking",
    desc: "Climb the seasonal leaderboard to earn permanent NFT badges and exclusive invite-only entries.",
  },
];

export default function LeaguesPage() {
  const [tab, setTab] = useState("Open");
  const [sportFilter, setSportFilter] = useState("All Sports");

  const filtered = MOCK_LEAGUES.filter((l) => {
    const statusMatch = l.status === STATUS_MAP[tab];
    const sportMatch = sportFilter === "All Sports" || l.sport === sportFilter;
    return statusMatch && sportMatch;
  });

  const featured = filtered[0];
  const sideCards = filtered.slice(1, 3);
  const bottomCards = filtered.slice(3);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">

        {/* Hero */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <span className="text-[#D2FF00] uppercase tracking-[0.2em] text-sm mb-4 block font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Competitive Arena
              </span>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                FANTASY <br /><span className="text-[#D2FF00]">LEAGUES</span>
              </h1>
            </div>
            <Link href="/leagues/create">
              <button
                className="px-8 py-4 flex items-center gap-3 font-black uppercase tracking-tight hover:opacity-90 active:scale-95 transition-all text-[#171e00]"
                style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                + Create League
              </button>
            </Link>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-12 space-y-8">
          {/* Status Tabs */}
          <div className="flex gap-1 border-b border-[#444933]/20">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-8 py-4 font-black uppercase tracking-widest transition-colors ${
                  tab === t
                    ? "text-[#D2FF00] border-b-2 border-[#D2FF00]"
                    : "text-white/40 hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sport Sub-tabs */}
          <div className="flex flex-wrap gap-3">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all ${
                  sportFilter === s
                    ? "bg-[#D2FF00] text-[#171e00]"
                    : "bg-[#2a2a2a] text-white/60 hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Bento Grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-white/40 text-lg">
            No {tab.toLowerCase()} leagues found.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Featured Large Card */}
            {featured && (
              <div className="md:col-span-8 group relative overflow-hidden bg-[#1b1b1b] p-8 min-h-[400px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-8 z-10">
                  <span className="bg-[#ffb4ab] text-[#690005] px-4 py-1 font-black text-xs uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Closing Soon
                  </span>
                </div>

                <div className="relative z-10">
                  <span className="text-[#afd500] uppercase tracking-widest text-xs mb-2 block font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {featured.tag}
                  </span>
                  <h2 className="text-5xl font-black italic tracking-tighter mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {featured.name}
                  </h2>
                  <p className="text-[#c5c9ac] max-w-md mb-8">
                    Compete with top managers globally for a share of the {featured.prizePool} pool. Build your ultimate lineup and dominate the leaderboard.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-8 items-end justify-between">
                  <div className="flex gap-12">
                    <div>
                      <span className="block text-white/40 uppercase text-[10px] tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Entry Fee</span>
                      <span className="text-2xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{featured.entryFee}</span>
                    </div>
                    <div>
                      <span className="block text-white/40 uppercase text-[10px] tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Prize Pool</span>
                      <span className="text-2xl font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{featured.prizePool}</span>
                    </div>
                    <div>
                      <span className="block text-white/40 uppercase text-[10px] tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Participants</span>
                      <span className="text-2xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{featured.slots}/{featured.maxSlots}</span>
                    </div>
                  </div>
                  <Link href={`/leagues/${featured.id}`}>
                    <button
                      className="bg-white text-black px-10 py-4 font-black uppercase tracking-tighter group-hover:bg-[#D2FF00] transition-all"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Enter League
                    </button>
                  </Link>
                </div>

                <div className="absolute -bottom-20 -right-20 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <span className="text-[200px] font-black italic text-white select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {featured.sport === "Basketball" ? "🏀" : featured.sport === "Soccer" ? "⚽" : featured.sport === "F1" ? "🏎" : "🏆"}
                  </span>
                </div>
              </div>
            )}

            {/* Side Cards */}
            <div className="md:col-span-4 space-y-6">
              {sideCards.map((league) => (
                <div key={league.id} className="bg-[#2a2a2a] p-6 group hover:bg-[#353535] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-[#353535] text-white/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {league.tag}
                    </span>
                    <span className="text-[#D2FF00] font-bold text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {league.timeLeft}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {league.name}
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div className="w-full bg-[#0e0e0e] h-1">
                      <div className="bg-[#D2FF00] h-full" style={{ width: `${league.fillPct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-white/40">Joined: {league.slots}/{league.maxSlots}</span>
                      <span className="text-white">{league.entryFee}</span>
                    </div>
                  </div>
                  <Link href={`/leagues/${league.id}`}>
                    <button
                      className="w-full border border-[#444933]/30 py-3 font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Join Now
                    </button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Bottom Row Cards */}
            {bottomCards.map((league) => (
              <div key={league.id} className="md:col-span-4 bg-[#1b1b1b] p-6 relative overflow-hidden group border-l-4 border-[#D2FF00]/30 hover:border-[#D2FF00] transition-all">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#afd500] mb-2 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {league.tag}
                </span>
                <h3 className="text-2xl font-black italic tracking-tighter mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {league.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-6">
                  <span>{league.maxSlots} Slots</span>
                  <span>{league.timeLeft}</span>
                </div>
                <div className="bg-[#2a2a2a] p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase text-white/40 block">Prize Pool</span>
                    <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{league.prizePool}</span>
                  </div>
                  <Link href={`/leagues/${league.id}`}>
                    <button
                      className="bg-white text-black px-6 py-2 font-black text-xs uppercase italic active:scale-95 transition-all hover:bg-[#D2FF00]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Enter
                    </button>
                  </Link>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D2FF00]/5 to-transparent pointer-events-none" />
              </div>
            ))}
          </section>
        )}

        {/* Info Bar */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-t border-[#444933]/10">
          {INFO_ITEMS.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <span className="text-[#D2FF00] text-4xl material-symbols-outlined">{icon}</span>
              <div>
                <h4 className="text-xl font-black italic tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {title}
                </h4>
                <p className="text-sm text-[#c5c9ac] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131313] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col md:items-start items-center gap-2">
            <span className="text-lg font-bold text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</span>
            <p className="text-white/40 text-sm tracking-wide">© 2024 OneFantasy. All Rights Reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {["Twitter", "Discord", "Terms of Service", "Privacy Policy", "Support"].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-[#D2FF00] transition-colors text-sm tracking-wide">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
