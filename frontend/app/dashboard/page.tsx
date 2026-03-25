"use client";

import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Navbar } from "@/components/layout/Navbar";
import { MOCK_ATHLETES } from "@/lib/athletes";
import { formatAddress } from "@/lib/utils";
import { buildDripTx } from "@/lib/contracts";
import { TxButton } from "@/components/web3/TxButton";
import Link from "next/link";
import { useEffect, useState } from "react";

const OWNED_ATHLETES = MOCK_ATHLETES.filter((a) => a.rarity >= 2).slice(0, 3);

const CONDITION_WIDTHS = ["92%", "85%", "98%"];
const WIN_RATES = ["64.2%", "71.8%", "58.9%"];
const FP_SCORES = ["88.4", "92.1", "76.5"];

export default function DashboardPage() {
  const account = useCurrentAccount();
  const address = account?.address;
  const isConnected = !!account;
  const [oneBalance, setOneBalance] = useState(14250);
  const [liveScore, setLiveScore] = useState(2840);
  const [faucetAddress, setFaucetAddress] = useState("");

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setLiveScore((s) => s + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col items-center justify-center gap-6 pt-20" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Connect Your Wallet
        </h2>
        <p className="text-[#c5c9ac] text-lg">Connect to view your dashboard, teams, and earnings.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto">

        {/* Welcome Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#D2FF00] font-black tracking-[0.2em] uppercase text-sm mb-2 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                DRIVER PROFILE
              </span>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Welcome, {address ? formatAddress(address) : "User"}
              </h1>
              <div className="flex items-center gap-3 bg-[#1b1b1b] px-4 py-2 w-fit">
                <span className="text-[#D2FF00] text-sm">⬡</span>
                <span className="text-[#c5c9ac] font-mono text-sm">{address ? formatAddress(address) : "0x000...0000"}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {[
                { label: "ONE Balance", value: oneBalance.toLocaleString(), accent: true },
                { label: "Live Score", value: liveScore.toLocaleString(), accent: false },
                { label: "Global Rank", value: "#412", accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-[#1b1b1b] p-6 flex flex-col min-w-[180px]">
                  <span className="text-xs uppercase tracking-widest text-white/40 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                  <span className={`text-3xl font-black tracking-tighter ${accent ? "text-[#D2FF00]" : "text-white"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Active League Card */}
          <div className="lg:col-span-5 xl:col-span-4 relative group">
            <div className="absolute -inset-0.5 bg-[#D2FF00] opacity-0 group-hover:opacity-10 transition duration-500" />
            <div className="bg-[#1b1b1b] overflow-hidden flex flex-col">
              <div className="relative h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop"
                  alt="NBA All-Stars"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/8.x/shapes/svg?seed=league"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b] via-transparent to-transparent" />
                <div className="absolute top-6 left-6 bg-[#D2FF00] text-[#171e00] px-3 py-1 font-black uppercase text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Active Now
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-4xl font-black italic uppercase leading-none mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    NBA All-Stars Showdown
                  </h2>
                  <p className="text-white/60 text-sm max-w-[80%]">Compete in the premier basketball fantasy league with exclusive NFT rewards.</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {[
                  { label: "Entry Fee", value: "250 ONE", accent: false },
                  { label: "Prize Pool", value: "50,000 ONE", accent: true },
                  { label: "Ending In", value: "14h 22m 10s", accent: false },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <span className="text-white/40 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    <span className={`font-bold ${accent ? "text-[#D2FF00]" : "text-white"}`}>{value}</span>
                  </div>
                ))}
                <Link href="/leagues">
                  <button className="w-full py-4 text-[#171e00] font-black uppercase tracking-widest active:scale-95 transition-all" style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    VIEW LEADERBOARD
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* My Athletes */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Athletes</h3>
              <Link href="/marketplace" className="text-[#D2FF00] text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Marketplace →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {OWNED_ATHLETES.map((athlete, i) => (
                <div key={athlete.id} className="bg-[#2a2a2a] p-4 flex flex-col gap-4 group">
                  <div className="relative aspect-square overflow-hidden bg-[#0e0e0e]">
                    <img
                      src={athlete.imageUrl}
                      alt={athlete.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}&backgroundColor=2a2a2a&textColor=D2FF00`;
                      }}
                    />
                    <div className="absolute bottom-2 right-2 px-3 py-1 flex items-center gap-2" style={{ background: "rgba(53,53,53,0.6)", backdropFilter: "blur(20px)" }}>
                      <span className="text-[10px] text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FP</span>
                      <span className="text-sm font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{FP_SCORES[i]}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-lg leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.name}</h4>
                      <span className="text-[10px] bg-[#353535] px-2 py-0.5 text-white/40 font-mono">#{athlete.tokenId}</span>
                    </div>
                    <span className="text-xs text-white/40 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.position}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-[#1b1b1b] p-3">
                      <span className="block text-[10px] text-white/40 uppercase mb-1">Condition</span>
                      <div className="h-1 bg-[#353535] w-full">
                        <div className="h-full" style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", width: CONDITION_WIDTHS[i] }} />
                      </div>
                    </div>
                    <div className="bg-[#1b1b1b] p-3">
                      <span className="block text-[10px] text-white/40 uppercase mb-1">Win Rate</span>
                      <span className="text-sm font-bold">{WIN_RATES[i]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Faucet Banner */}
        <section className="mt-20">
          <div className="bg-[#1b1b1b] relative overflow-hidden flex flex-col md:flex-row items-center justify-between p-12 gap-8 border-l-4 border-[#D2FF00]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D2FF00] opacity-5 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Low on ONE?</h2>
              <p className="text-white/60 max-w-md">Running out of tokens on the testnet? Use our faucet to top up your wallet and stay in the game.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input
                className="bg-[#353535] border-none text-white font-mono text-sm px-6 py-4 min-w-[300px] focus:outline-none focus:ring-1 focus:ring-[#D2FF00]"
                placeholder="Enter Wallet Address"
                type="text"
                value={faucetAddress}
                onChange={(e) => setFaucetAddress(e.target.value)}
              />
              <TxButton
                buildTx={buildDripTx}
                label="Claim Tokens"
                loadingLabel="Claiming..."
                className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-none hover:bg-[#D2FF00] hover:text-[#171e00] transition-all"
                onSuccess={() => setOneBalance((b) => b + 100)}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131313] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-0">
            <span className="text-lg font-bold text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</span>
            <p className="text-sm tracking-wide text-white/40 mt-2">© 2024 OneFantasy. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8">
            {["Twitter", "Discord", "Terms of Service", "Privacy Policy", "Support"].map((item) => (
              <a key={item} href="#" className="text-sm tracking-wide text-white/40 hover:text-[#D2FF00] transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
