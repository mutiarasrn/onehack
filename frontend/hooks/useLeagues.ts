"use client";

import { useEffect, useState } from "react";

export interface OnChainLeague {
  objectId: string;
  name: string;
  sport: string;
  entryFee: number;
  maxEntrants: number;
  currentEntrants: number;
  startTimeMs: number;
  endTimeMs: number;
  status: number;
  prizePoolMist: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function useLeagues() {
  const [leagues, setLeagues] = useState<OnChainLeague[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/leagues`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLeagues(data.leagues ?? []);
      } catch (e) {
        console.error("Failed to fetch leagues:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, []);

  return { leagues, loading };
}
