"use client";

import { useState } from "react";
import { type OnChainListing, useListings } from "@/hooks/useListings";
import { Navbar } from "@/components/layout/Navbar";
import { TxButton } from "@/components/web3/TxButton";
import { buildBuyTx } from "@/lib/contracts";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { RARITY_NAMES, RARITY_MULTIPLIERS } from "@/lib/athletes";

const SPORTS = ["All", "NBA", "SOCCER"];
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
  { label: "Rarity", value: "rarity" },
];

const RARITY_BADGE: Record<number, { label: string; style: string }> = {
  0: { label: "Bronze",    style: "bg-[#cd7f32] text-black" },
  1: { label: "Silver",    style: "bg-[#C0C0C0] text-black" },
  2: { label: "Gold",      style: "bg-[#FFD700] text-black" },
  3: { label: "Legendary", style: "bg-[#D2FF00] text-[#171e00]" },
};

function formatPrice(mist: number): string {
  return `${(mist / 1_000_000_000).toFixed(1)} OCT`;
}

export default function MarketplacePage() {
  const account = useCurrentAccount();
  const { listings, loading } = useListings();
  const [sportFilter, setSportFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState(-1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rarity");
  const [selected, setSelected] = useState<OnChainListing | null>(null);
  const [boughtIds, setBoughtIds] = useState<Set<string>>(new Set());

  let filtered = listings
    .filter((l) => !boughtIds.has(l.listingId))
    .filter((l) => sportFilter === "All" || l.sport === sportFilter)
    .filter((l) => rarityFilter === -1 || l.rarity === rarityFilter)
    .filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()));

  filtered = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return a.priceMist - b.priceMist;
    if (sort === "price_desc") return b.priceMist - a.priceMist;
    return b.rarity - a.rarity;
  });

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
                Buy and sell athlete NFTs. Build your lineup with the best players.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs tracking-widest uppercase text-[#8f9378] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Listings</span>
              <span className="text-3xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{listings.length} NFTs</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-12 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f9378] text-lg">⌕</span>
            <input
              className="w-full bg-[#353535] border-none focus:outline-none focus:ring-2 focus:ring-[#D2FF00] text-[#e2e2e2] py-4 pl-12 pr-4"
              placeholder="Search athletes..."
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
                  sportFilter === s ? "bg-[#D2FF00] text-[#171e00]" : "bg-[#2a2a2a] text-[#e2e2e2] hover:bg-[#353535]"
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
        {loading ? (
          <div className="py-32 text-center text-white/40 text-lg">Loading listings from chain...</div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center text-white/40 text-lg">
            {listings.length === 0 ? "No listings yet. List your athletes to get started." : "No listings match your filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {filtered.map((listing) => {
              const badge = RARITY_BADGE[listing.rarity];
              const isOwnListing = account?.address === listing.seller;
              return (
                <div
                  key={listing.listingId}
                  className="group relative bg-[#1b1b1b] overflow-hidden transition-transform duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
                  onClick={() => setSelected(listing)}
                >
                  <div className="absolute top-0 right-0 p-4 z-10">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 italic ${badge.style}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="h-[300px] overflow-hidden bg-[#0e0e0e] flex-shrink-0 flex items-center justify-center">
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(listing.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                      }}
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-black italic uppercase leading-tight mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {listing.name}
                      </h3>
                      <p className="text-xs text-[#8f9378] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {listing.sport} · {listing.position}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#1f1f1f] p-3">
                        <span className="block text-[10px] text-[#8f9378] uppercase tracking-widest mb-1">Base Score</span>
                        <span className="text-xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{listing.baseScore / 100}</span>
                      </div>
                      <div className="bg-[#1f1f1f] p-3">
                        <span className="block text-[10px] text-[#8f9378] uppercase tracking-widest mb-1">Price</span>
                        <span className="text-xl font-black text-[#D2FF00]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{formatPrice(listing.priceMist)}</span>
                      </div>
                    </div>

                    {isOwnListing ? (
                      <div className="w-full py-4 text-center text-[#8f9378] font-bold uppercase text-xs tracking-widest bg-[#2a2a2a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Your Listing
                      </div>
                    ) : (
                      <button
                        className="w-full py-4 text-[#171e00] font-black uppercase italic tracking-tighter active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
                        onClick={(e) => { e.stopPropagation(); setSelected(listing); }}
                      >
                        Buy — {formatPrice(listing.priceMist)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Buy Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm bg-[#1b1b1b] border border-[#444933]/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-64 overflow-hidden bg-[#0e0e0e]">
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(selected.name)}&backgroundColor=1b1b1b&textColor=D2FF00`;
                }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selected.name}
              </h3>
              <p className="text-xs text-[#8f9378] uppercase tracking-widest mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selected.sport} · {selected.position} · {RARITY_NAMES[selected.rarity]}
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Base Score",  value: (selected.baseScore / 100).toFixed(1) },
                  { label: "Multiplier",  value: `${RARITY_MULTIPLIERS[selected.rarity as 0|1|2|3]}x` },
                  { label: "Seller",      value: `${selected.seller.slice(0, 6)}...${selected.seller.slice(-4)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-3">
                    <span className="text-[#8f9378] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    <span className="font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
                  </div>
                ))}
              </div>

              {account?.address === selected.seller ? (
                <div className="w-full py-4 text-center text-[#8f9378] font-bold uppercase text-xs tracking-widest bg-[#2a2a2a] mb-3">
                  This is your listing
                </div>
              ) : (
                <TxButton
                  buildTx={() => buildBuyTx(selected.listingId, selected.priceMist)}
                  label={`Buy for ${formatPrice(selected.priceMist)}`}
                  loadingLabel="Buying..."
                  onSuccess={() => {
                    setBoughtIds((prev) => new Set(prev).add(selected.listingId));
                    setSelected(null);
                  }}
                  className="w-full py-4 font-black uppercase tracking-tighter text-[#171e00] mb-3 active:scale-95 transition-all rounded-none border-0 h-auto text-base"
                  style={{ background: "linear-gradient(135deg, #D2FF00 0%, #afd500 100%)" } as React.CSSProperties}
                />
              )}

              <button
                className="w-full py-3 text-[#8f9378] text-sm uppercase tracking-widest hover:text-white transition-colors"
                onClick={() => setSelected(null)}
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
          <span className="text-lg font-black italic text-white uppercase tracking-tighter mb-4 md:mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OneFantasy</span>
          <p className="text-white/40 text-sm">© 2024 OneFantasy. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
