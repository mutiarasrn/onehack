"use client";

import Link from "next/link";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { MOCK_ATHLETES } from "@/lib/athletes";
import { Navbar } from "@/components/layout/Navbar";

const STATS = [
  { label: "Total Prize Pool", value: "$12.4M" },
  { label: "Active Managers", value: "142K+" },
  { label: "Pro Leagues", value: "842" },
  { label: "Digital Assets", value: "1.2M" },
];

const FEATURED = MOCK_ATHLETES.filter((a) => a.rarity === 3).slice(0, 3);

const STEPS = [
  {
    num: "01",
    title: "Draft Real Digital Assets",
    desc: "Collect limited-edition athlete cards that you truly own. Each card's value is tied to real-world performance data.",
  },
  {
    num: "02",
    title: "Enter High-Stakes Leagues",
    desc: "Join public or private leagues. Compete against the world's best managers for huge prize pools in crypto and exclusive perks.",
  },
  {
    num: "03",
    title: "Evolve & Trade",
    desc: "Level up your cards through successful gameplay or trade them on our high-velocity marketplace to build your dynasty.",
  },
];

export default function LandingPage() {
  const account = useCurrentAccount();
  const isConnected = !!account;

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>

      <Navbar />

      <main className="pt-20">

        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden px-8">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-transparent to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop"
              alt="Basketball action"
              className="w-full h-full object-cover grayscale brightness-50"
            />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto w-full pt-20">
            <div className="inline-block mb-4 px-3 py-1 bg-[#2a2a2a] border-l-4 border-[#D2FF00]">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                The Future of Fantasy
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic uppercase leading-[0.85] tracking-tighter mb-8 max-w-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              OWN THE <br />
              <span className="text-[#D2FF00]">PODIUM</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#c5c9ac] max-w-xl mb-12 leading-relaxed">
              Fantasy Sports meets GameFi. Build your ultimate team with real digital assets and compete for professional-grade rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/leagues">
                <button className="bg-[#D2FF00] text-[#171e00] px-10 py-5 font-black uppercase text-xl tracking-tighter hover:brightness-110 transition-all active:scale-95" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Start Your Career
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="border-2 border-[#444933] px-10 py-5 font-black uppercase text-xl tracking-tighter hover:bg-[#2a2a2a] transition-all" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  View Marketplace
                </button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-20 right-8 hidden lg:block text-right pointer-events-none">
            <span className="text-9xl font-black italic leading-none opacity-10 text-white" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)", color: "transparent" }}>
              GAME_DAY
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-[#1b1b1b] py-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-1">
            {STATS.map(({ label, value }) => (
              <div key={label} className="bg-[#131313] p-12 flex flex-col justify-center items-start">
                <span className="text-xs uppercase tracking-widest text-[#c5c9ac] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                <span className="text-5xl font-black tracking-tighter text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Legendary Cards */}
        <section className="py-32 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto mb-20">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Legendary Cards
            </h2>
            <div className="h-1 w-32 bg-[#D2FF00]" />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {FEATURED.map((athlete) => (
              <div
                key={athlete.id}
                className="group relative bg-[#1b1b1b] p-2 aspect-[3/4] overflow-hidden transition-all duration-500 hover:bg-[#2a2a2a]"
              >
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-[#D2FF00] text-[#171e00] font-black px-3 py-1 italic text-lg">
                    {athlete.rarity === 3 ? "99 OVR" : `${90 + athlete.rarity * 3} OVR`}
                  </span>
                </div>
                <img
                  src={athlete.imageUrl}
                  alt={athlete.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-xs uppercase text-[#D2FF00] tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {athlete.sport} · {athlete.position}
                  </span>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {athlete.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 bg-[#0e0e0e]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="w-full lg:w-1/2">
                <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  FANTASY SPORTS <br />
                  <span className="text-[#D2FF00]">RE-ENGINEERED</span>
                </h2>
                <div className="space-y-12">
                  {STEPS.map(({ num, title, desc }) => (
                    <div key={num} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#2a2a2a] flex items-center justify-center font-black text-xl text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {num}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold uppercase mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h4>
                        <p className="text-[#c5c9ac] leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -inset-4 bg-[#D2FF00] opacity-10 blur-3xl rounded-full" />
                <div className="relative bg-[#1f1f1f] p-8 border border-[#444933]/20 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {MOCK_ATHLETES.slice(0, 4).map((a) => (
                      <div key={a.id} className="bg-[#131313] p-4 border border-[#444933]/30">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={a.imageUrl}
                            alt={a.name}
                            className="w-10 h-10 rounded-full grayscale"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(a.name)}`;
                            }}
                          />
                          <div>
                            <p className="text-xs font-bold text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{a.name}</p>
                            <p className="text-[10px] text-[#D2FF00]">{a.position}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#c5c9ac]">Avg Pts</span>
                          <span className="text-sm font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{a.stats.avgPoints}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto" style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)" }}>
            <div className="p-16 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
              <h2 className="text-5xl md:text-8xl font-black italic uppercase text-[#171e00] tracking-tighter mb-8 z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                READY TO <br /> DOMINATE?
              </h2>
              <p className="text-[#3d4c00] text-xl md:text-2xl font-bold max-w-2xl mb-12 z-10">
                The next season starts in 48 hours. Secure your starting lineup and claim your welcome pack.
              </p>
              <Link href="/leagues">
                <button className="bg-[#131313] text-white px-12 py-6 font-black uppercase text-2xl tracking-tighter hover:bg-black transition-all active:scale-95 z-10 shadow-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Get Started Now
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131313] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-bold text-white uppercase tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</div>
            <div className="text-white/40 text-sm tracking-wide">© 2024 OneFantasy. All Rights Reserved.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm tracking-wide">
            {["Twitter", "Discord", "Terms of Service", "Privacy Policy", "Support"].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-[#D2FF00] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
