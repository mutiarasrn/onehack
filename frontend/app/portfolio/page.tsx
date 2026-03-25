"use client";

import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Navbar } from "@/components/layout/Navbar";
import { MOCK_ATHLETES } from "@/lib/athletes";
import { formatAddress } from "@/lib/utils";

const MY_ATHLETES = MOCK_ATHLETES.filter((a) => a.rarity >= 1).slice(0, 8);

const RARITY_BADGE: Record<number, { label: string; style: string }> = {
  0: { label: "Common", style: "bg-white/20 backdrop-blur text-white" },
  1: { label: "Rare", style: "bg-white/20 backdrop-blur text-white" },
  2: { label: "Gold", style: "bg-[#FFD700] text-black" },
  3: { label: "Legendary", style: "bg-[#D2FF00] text-[#171e00]" },
};

const HISTORY = [
  {
    id: 1, league: "Grand Prix Elite Series", date: "May 12, 2024",
    rank: 4, reward: "2.50 ETH", status: "claimable",
    icon: "emoji_events", iconBg: "bg-[#D2FF00]", iconColor: "text-[#171e00]",
  },
  {
    id: 2, league: "Sprint Masters Invitational", date: "May 08, 2024",
    rank: 114, reward: "0.00 ETH", status: "claimed",
    icon: "sports_score", iconBg: "bg-[#353535]", iconColor: "text-white/40",
  },
  {
    id: 3, league: "Velocity Pro Series", date: "May 01, 2024",
    rank: 12, reward: "0.45 ETH", status: "view",
    icon: "military_tech", iconBg: "bg-[#D2FF00]/20", iconColor: "text-[#D2FF00]",
  },
];

export default function PortfolioPage() {
  const account = useCurrentAccount();
  const address = account?.address;
  const isConnected = !!account;

  if (!isConnected) {
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

  const totalValue = MY_ATHLETES.reduce((sum, a) => sum + a.price, 0);
  const totalEarned = HISTORY.reduce((sum, h) => sum + parseFloat(h.reward), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[#D2FF00] uppercase tracking-[0.2em] text-xs font-bold mb-2 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Executive Overview
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                MY PORTFOLIO
              </h1>
            </div>
            <div className="bg-[#1b1b1b] px-6 py-4 border-l-4 border-[#D2FF00]">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Portfolio Health</p>
              <p className="text-2xl font-bold text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                +12.4% <span className="text-xs font-normal text-white/40">24H</span>
              </p>
            </div>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main stat */}
            <div className="md:col-span-2 bg-[#1b1b1b] p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total Collection Value</p>
                <h2 className="text-6xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {totalValue.toLocaleString()} ONE
                </h2>
                <div className="mt-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D2FF00]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  <span className="text-[#D2FF00] font-bold">+4,230 ONE Today</span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 700" }}>account_balance_wallet</span>
              </div>
            </div>

            {/* Total earned */}
            <div className="bg-[#2a2a2a] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total Earned</p>
                <h3 className="text-3xl font-bold text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{totalEarned} ETH</h3>
              </div>
              <div className="w-full h-1 bg-[#353535] mt-4">
                <div className="h-full bg-[#D2FF00]" style={{ width: "65%" }} />
              </div>
              <p className="text-[10px] text-white/40 mt-4 uppercase">Target: 5.00 ETH</p>
            </div>

            {/* Active athletes */}
            <div className="bg-[#2a2a2a] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Active Athletes</p>
                <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{MY_ATHLETES.length}</h3>
              </div>
              <div className="flex -space-x-3 mt-4">
                {MY_ATHLETES.slice(0, 3).map((a) => (
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
                <div className="w-10 h-10 rounded-full bg-[#353535] border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-white/60">
                  +{MY_ATHLETES.length - 3}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Athletes Grid */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Active Athletes</h2>
            <div className="flex gap-4">
              <button className="bg-[#353535] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Filters</button>
              <button className="bg-[#353535] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Market Value</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MY_ATHLETES.slice(0, 8).map((athlete) => {
              const badge = RARITY_BADGE[athlete.rarity];
              const change = athlete.rarity >= 2 ? `+${(Math.random() * 5).toFixed(1)}%` : "--";
              const changeColor = change === "--" ? "text-white/60" : "text-[#D2FF00]";
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
                      <span className="text-white/40 uppercase">Floor Price</span>
                      <span className="text-white font-mono font-bold">{athlete.price} ONE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-white/40 uppercase">Last Sale</span>
                      <span className={`font-mono font-bold ${changeColor}`}>{change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* League History */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>League History</h2>
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Last 30 Days</span>
          </div>

          <div className="space-y-4">
            {HISTORY.map((h) => (
              <div
                key={h.id}
                className={`bg-[#1b1b1b] flex flex-col md:flex-row items-center gap-6 p-6 ${h.status === "claimed" ? "opacity-60" : ""}`}
              >
                <div className={`w-16 h-16 flex-shrink-0 ${h.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-4xl ${h.iconColor}`} style={{ fontVariationSettings: "'wght' 700" }}>
                    {h.icon}
                  </span>
                </div>

                <div className="flex-grow text-center md:text-left">
                  <p className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${h.status === "claimed" ? "text-white/40" : "text-[#D2FF00]"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Completed · {h.date}
                  </p>
                  <h4 className="text-xl font-bold text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {h.league}
                  </h4>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="text-[10px] text-white/40 uppercase">Final Rank</span>
                  <span className="text-2xl font-bold text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>#{h.rank.toString().padStart(2, "0")}</span>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 border-x border-white/5 px-8">
                  <span className="text-[10px] text-white/40 uppercase">Reward</span>
                  <span className={`text-2xl font-bold leading-none ${h.status === "claimed" && h.reward === "0.00 ETH" ? "text-white/40" : "text-[#D2FF00]"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {h.reward}
                  </span>
                </div>

                {h.status === "claimable" && (
                  <button
                    className="w-full md:w-auto text-[#171e00] px-8 py-3 font-bold uppercase tracking-tighter active:scale-95 transition-transform"
                    style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Claim Prize
                  </button>
                )}
                {h.status === "claimed" && (
                  <button
                    className="w-full md:w-auto bg-white/5 text-white/20 px-8 py-3 font-bold uppercase tracking-tighter cursor-not-allowed"
                    disabled
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Claimed
                  </button>
                )}
                {h.status === "view" && (
                  <button
                    className="w-full md:w-auto bg-white/10 text-white px-8 py-3 font-bold uppercase tracking-tighter hover:bg-white/20 transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    View Details
                  </button>
                )}
              </div>
            ))}
          </div>
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
