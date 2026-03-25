"use client";

import { useState } from "react";
import { MOCK_ATHLETES, type Athlete, RARITY_NAMES, RARITY_MULTIPLIERS } from "@/lib/athletes";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

const SPORTS = ["All", "NBA", "SOCCER", "F1"];
const RARITIES = [
  { label: "All Rarities", value: -1 },
  { label: "Bronze", value: 0 },
  { label: "Silver", value: 1 },
  { label: "Gold", value: 2 },
  { label: "Legendary", value: 3 },
];
const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Avg Points", value: "points" },
  { label: "Rarity", value: "rarity" },
];

const RARITY_BADGE: Record<number, { label: string; style: string }> = {
  0: { label: "Bronze", style: "bg-[#cd7f32] text-black" },
  1: { label: "Silver Tier", style: "bg-[#C0C0C0] text-black" },
  2: { label: "Gold Tier", style: "bg-[#FFD700] text-black" },
  3: { label: "Legendary", style: "bg-[#D2FF00] text-[#171e00]" },
};

const RARITY_BUTTON: Record<number, string> = {
  0: "bg-[#353535] w-full py-4 text-white font-black uppercase italic tracking-tighter active:scale-95 transition-transform hover:bg-white hover:text-black",
  1: "bg-[#353535] w-full py-4 text-white font-black uppercase italic tracking-tighter active:scale-95 transition-transform hover:bg-white hover:text-black",
  2: "bg-[#353535] w-full py-4 text-white font-black uppercase italic tracking-tighter active:scale-95 transition-transform hover:bg-white hover:text-black",
  3: "w-full py-4 text-[#171e00] font-black uppercase italic tracking-tighter active:scale-95 transition-transform",
};

export default function MarketplacePage() {
  const [sportFilter, setSportFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState(-1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rarity");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  let athletes = MOCK_ATHLETES.filter((a) => {
    if (sportFilter !== "All" && a.sport !== sportFilter) return false;
    if (rarityFilter !== -1 && a.rarity !== rarityFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  athletes = [...athletes].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "points") return b.stats.avgPoints - a.stats.avgPoints;
    if (sort === "rarity") return b.rarity - a.rarity;
    return 0;
  });

  const visible = athletes.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">

        {/* Hero */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] mb-6 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Athlete <span className="text-[#D2FF00]">Marketplace</span>
              </h1>
              <p className="text-[#c6c6c7] text-lg max-w-lg leading-relaxed">
                Secure high-performance digital collectibles. Build your dynasty with verified player assets from the world's premier sports leagues.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs tracking-widest uppercase text-[#8f9378] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Volume (24H)</span>
              <span className="text-3xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>1.2M ONE</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-12 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f9378] text-lg">⌕</span>
            <input
              className="w-full bg-[#353535] border-none focus:outline-none focus:ring-2 focus:ring-[#D2FF00] text-[#e2e2e2] py-4 pl-12 pr-4"
              placeholder="Search athletes, teams, or rarity..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-6 py-3 font-black uppercase tracking-wider text-sm transition-colors ${
                  sportFilter === s
                    ? "bg-[#D2FF00] text-[#171e00]"
                    : "bg-[#2a2a2a] text-[#e2e2e2] hover:bg-[#353535]"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(Number(e.target.value))}
            className="bg-[#2a2a2a] text-[#e2e2e2] border-none px-6 py-3 font-black uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF00]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {RARITIES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#2a2a2a] text-[#e2e2e2] border-none px-6 py-3 font-black uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF00]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
          {visible.map((athlete) => {
            const badge = RARITY_BADGE[athlete.rarity];
            const btnClass = RARITY_BUTTON[athlete.rarity];
            return (
              <div
                key={athlete.id}
                className="group relative bg-[#1b1b1b] overflow-hidden transition-transform duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
                onClick={() => setSelectedAthlete(athlete)}
              >
                <div className="absolute top-0 right-0 p-4 z-10">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 italic ${badge.style}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {badge.label}
                  </span>
                </div>

                <div className="h-[300px] overflow-hidden bg-[#0e0e0e] flex-shrink-0 flex items-center justify-center">
                  <img
                    src={athlete.imageUrl}
                    alt={athlete.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                    }}
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4 min-h-[56px]">
                    <h3 className="text-xl font-black italic uppercase leading-tight mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {athlete.name}
                    </h3>
                    <p className="text-xs text-[#8f9378] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {athlete.sport} · {athlete.position}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#1f1f1f] p-3">
                      <span className="block text-[10px] text-[#8f9378] uppercase tracking-widest mb-1">Avg Points</span>
                      <span className="text-xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.stats.avgPoints}</span>
                    </div>
                    <div className="bg-[#1f1f1f] p-3">
                      <span className="block text-[10px] text-[#8f9378] uppercase tracking-widest mb-1">Floor Price</span>
                      <span className="text-xl font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.price} ONE</span>
                    </div>
                  </div>

                  <button
                    className={btnClass}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      ...(athlete.rarity === 3 ? { background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)" } : {}),
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedAthlete(athlete); }}
                  >
                    Buy Collectible
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        {visibleCount < athletes.length && (
          <div className="mt-20 flex justify-center">
            <button
              className="flex items-center gap-4 bg-[#1b1b1b] px-12 py-6 hover:bg-[#2a2a2a] transition-all"
              onClick={() => setVisibleCount((c) => c + 8)}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="font-black uppercase italic tracking-widest">Load More Athletes</span>
              <span className="text-xl">↓</span>
            </button>
          </div>
        )}
      </main>

      {/* Buy Modal */}
      {selectedAthlete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedAthlete(null)}
        >
          <div
            className="w-full max-w-sm bg-[#1b1b1b] border border-[#444933]/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-64 overflow-hidden bg-[#0e0e0e]">
              <img
                src={selectedAthlete.imageUrl}
                alt={selectedAthlete.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(selectedAthlete.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selectedAthlete.name}
              </h3>
              <p className="text-xs text-[#8f9378] uppercase tracking-widest mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selectedAthlete.sport} · {selectedAthlete.position} · {RARITY_NAMES[selectedAthlete.rarity]}
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Avg Points", value: selectedAthlete.stats.avgPoints },
                  { label: "Last Game", value: selectedAthlete.stats.lastGameScore },
                  { label: "Multiplier", value: `${RARITY_MULTIPLIERS[selectedAthlete.rarity]}x` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-3">
                    <span className="text-[#8f9378] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    <span className="font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-4 font-black uppercase tracking-tighter text-[#171e00] mb-3 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Buy for {selectedAthlete.price} ONE
              </button>
              <button
                className="w-full py-3 text-[#8f9378] text-sm uppercase tracking-widest hover:text-white transition-colors"
                onClick={() => setSelectedAthlete(null)}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#131313] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            <span className="text-lg font-black italic text-white uppercase tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</span>
            <p className="text-white/40 text-sm">© 2024 OneFantasy. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8">
            {["Twitter", "Discord", "Terms of Service", "Privacy Policy", "Support"].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-[#D2FF00] transition-colors text-sm tracking-wide uppercase">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
