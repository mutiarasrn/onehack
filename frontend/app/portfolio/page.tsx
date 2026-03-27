"use client";

import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useOwnedAthletes } from "@/hooks/useAthletes";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const RARITY_BADGE: Record<number, { label: string; style: string }> = {
  0: { label: "Common",    style: "bg-white/20 backdrop-blur text-white" },
  1: { label: "Rare",      style: "bg-blue-500/80 text-white" },
  2: { label: "Gold",      style: "bg-[#FFD700] text-black" },
  3: { label: "Legendary", style: "bg-[#D2FF00] text-[#171e00]" },
};

interface JoinedLeague {
  leagueId: string;
  name: string;
  sport: string;
  status: number;
  entryFee: string;
  prizePool: string;
  prizeSplits: number[];
  entrants: string[];
}

export default function PortfolioPage() {
  const account = useCurrentAccount();
  const { athletes, loading: athletesLoading } = useOwnedAthletes();
  const [joinedLeagues, setJoinedLeagues] = useState<JoinedLeague[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  useEffect(() => {
    if (!account?.address) { setLoadingLeagues(false); return; }
    async function fetchLeagues() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/leagues`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const all: JoinedLeague[] = data.leagues ?? [];
        setJoinedLeagues(all.filter((l) => l.entrants.includes(account!.address)));
      } catch (e) {
        console.error("Failed to fetch leagues:", e);
      } finally {
        setLoadingLeagues(false);
      }
    }
    fetchLeagues();
  }, [account?.address]);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col items-center justify-center gap-6 pt-20" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Connect Your Wallet
        </h2>
        <ConnectButton />
      </div>
    );
  }

  if (athletesLoading) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex items-center justify-center pt-20">
        <Navbar />
        <p className="text-white/40 text-lg">Loading your portfolio from chain...</p>
      </div>
    );
  }

  const totalValueMist = athletes.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const totalValueOCT = (totalValueMist / 1_000_000_000).toFixed(2);

  const activeLeagues = joinedLeagues.filter((l) => l.status === 0 || l.status === 1);
  const finishedLeagues = joinedLeagues.filter((l) => l.status === 2);

  function getStatusLabel(status: number) {
    if (status === 0) return { label: "Open", color: "text-[#D2FF00]" };
    if (status === 1) return { label: "Live", color: "text-blue-400" };
    return { label: "Finished", color: "text-white/40" };
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[#D2FF00] uppercase tracking-[0.2em] text-xs font-bold mb-2 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                On-Chain Portfolio
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                MY PORTFOLIO
              </h1>
            </div>
            <div className="bg-[#1b1b1b] px-6 py-4 border-l-4 border-[#D2FF00]">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Wallet</p>
              <p className="text-sm font-mono text-[#D2FF00]">
                {account.address.slice(0, 10)}...{account.address.slice(-8)}
              </p>
            </div>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Collection Value */}
            <div className="md:col-span-2 bg-[#1b1b1b] p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total Collection Value</p>
                <h2 className="text-6xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {totalValueOCT} <span className="text-2xl text-white/40">OCT</span>
                </h2>
                <p className="mt-4 text-white/30 text-sm">{athletes.length} athlete NFTs owned</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 700" }}>account_balance_wallet</span>
              </div>
            </div>

            {/* Active Leagues */}
            <div className="bg-[#2a2a2a] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Active Leagues</p>
                <h3 className="text-5xl font-bold text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {loadingLeagues ? "—" : activeLeagues.length}
                </h3>
              </div>
              <p className="text-[10px] text-white/40 mt-4 uppercase tracking-widest">
                {loadingLeagues ? "Loading..." : `${finishedLeagues.length} completed`}
              </p>
            </div>

            {/* Athletes count */}
            <div className="bg-[#2a2a2a] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Athletes Owned</p>
                <h3 className="text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athletes.length}</h3>
              </div>
              <div className="flex -space-x-3 mt-4">
                {athletes.slice(0, 4).map((a) => (
                  <div key={a.id} className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] overflow-hidden bg-[#353535]">
                    <img
                      src={a.imageUrl}
                      alt={a.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(a.name)}&backgroundColor=353535&textColor=D2FF00`;
                      }}
                    />
                  </div>
                ))}
                {athletes.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-[#353535] border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-white/60">
                    +{athletes.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Athletes Grid */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              My Athletes
            </h2>
            <Link href="/marketplace">
              <button className="bg-[#D2FF00] text-[#171e00] px-6 py-2 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Browse Marketplace →
              </button>
            </Link>
          </div>

          {athletes.length === 0 ? (
            <div className="py-24 text-center bg-[#1b1b1b]">
              <span className="material-symbols-outlined text-6xl text-white/10 block mb-4">sports_basketball</span>
              <p className="text-white/40 text-sm uppercase tracking-widest mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                No athletes in your collection yet
              </p>
              <Link href="/marketplace">
                <button className="bg-[#D2FF00] text-[#171e00] px-8 py-3 font-black uppercase tracking-widest text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Buy Athletes
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {athletes.map((athlete) => {
                const badge = RARITY_BADGE[athlete.rarity];
                const priceOCT = athlete.price ? (athlete.price / 1_000_000_000).toFixed(2) : "—";
                return (
                  <div key={athlete.id} className="bg-[#1b1b1b] group hover:bg-[#2a2a2a] transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={athlete.imageUrl}
                        alt={athlete.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                        }}
                      />
                      <div className={`absolute top-4 right-4 px-2 py-1 text-[10px] font-black uppercase italic ${badge.style}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {badge.label}
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] text-[#D2FF00] uppercase tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {athlete.sport} · {athlete.position}
                      </p>
                      <h4 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {athlete.name.toUpperCase()}
                      </h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 uppercase">Base Score</span>
                        <span className="text-white font-mono font-bold">{athlete.baseScore} pts</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-white/40 uppercase">Value</span>
                        <span className="text-[#D2FF00] font-mono font-bold">{priceOCT} OCT</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* League Activity */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Leagues</h2>
            <Link href="/leagues">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-[#D2FF00] transition-colors">Browse All →</span>
            </Link>
          </div>

          {loadingLeagues ? (
            <div className="py-16 text-center text-white/30 text-sm">Loading leagues...</div>
          ) : joinedLeagues.length === 0 ? (
            <div className="py-24 text-center bg-[#1b1b1b]">
              <span className="material-symbols-outlined text-6xl text-white/10 block mb-4">emoji_events</span>
              <p className="text-white/40 text-sm uppercase tracking-widest mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                You haven't joined any leagues yet
              </p>
              <Link href="/leagues">
                <button className="bg-[#D2FF00] text-[#171e00] px-8 py-3 font-black uppercase tracking-widest text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Join a League
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {joinedLeagues.map((l) => {
                const { label, color } = getStatusLabel(l.status);
                const prizePoolOCT = (Number(l.prizePool) / 1_000_000_000).toFixed(2);
                const entryFeeOCT = Number(l.entryFee) === 0 ? "Free" : `${(Number(l.entryFee) / 1_000_000_000).toFixed(2)} OCT`;
                const sportEmoji = l.sport === "NBA" ? "🏀" : l.sport === "SOCCER" ? "⚽" : "🏆";
                return (
                  <div key={l.leagueId} className="bg-[#1b1b1b] flex flex-col md:flex-row items-center gap-6 p-6">
                    <div className="w-16 h-16 flex-shrink-0 bg-[#2a2a2a] flex items-center justify-center text-3xl">
                      {sportEmoji}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                      <p className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {label} · {l.sport}
                      </p>
                      <h4 className="text-xl font-bold text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {l.name}
                      </h4>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1">
                      <span className="text-[10px] text-white/40 uppercase">Entry Fee</span>
                      <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{entryFeeOCT}</span>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 border-x border-white/5 px-8">
                      <span className="text-[10px] text-white/40 uppercase">Prize Pool</span>
                      <span className="text-lg font-bold text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{prizePoolOCT} OCT</span>
                    </div>

                    <Link href={`/leagues/${l.leagueId}`}>
                      <button
                        className="w-full md:w-auto bg-white/10 text-white px-8 py-3 font-bold uppercase tracking-tighter hover:bg-[#D2FF00] hover:text-[#171e00] transition-colors text-sm"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        View League →
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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
