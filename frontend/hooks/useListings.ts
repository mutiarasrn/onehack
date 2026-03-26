"use client";

import { useEffect, useState } from "react";

export interface OnChainListing {
  listingId: string;
  seller: string;
  priceMist: number;
  tokenId: number;
  name: string;
  sport: string;
  position: string;
  rarity: number;
  imageUrl: string;
  baseScore: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function useListings() {
  const [listings, setListings] = useState<OnChainListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/listings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setListings(data.listings ?? []);
      } catch (e) {
        console.error("Failed to fetch listings:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return { listings, loading };
}
