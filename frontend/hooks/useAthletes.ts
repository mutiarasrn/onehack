"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { suiClient } from "@/lib/onechain";
import { MOCK_ATHLETES, type Athlete } from "@/lib/athletes";
import ADDRESSES from "@/lib/contract-addresses.json";

export function useOwnedAthletes() {
  const account = useCurrentAccount();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account?.address) { setLoading(false); return; }

    async function fetchAthletes() {
      try {
        const PACKAGE_ID: string = (ADDRESSES as any).packageId || "";
        if (!PACKAGE_ID) { setLoading(false); return; }

        const objects = await suiClient.getOwnedObjects({
          owner: account!.address,
          filter: { StructType: `${PACKAGE_ID}::athlete_nft::AthleteNFT` },
          options: { showContent: true },
        });

        const parsed: Athlete[] = objects.data
          .filter((o) => o.data?.content?.dataType === "moveObject")
          .map((o) => {
            const fields = (o.data!.content as any).fields;
            const tokenId = Number(fields.token_id);
            // Match with MOCK_ATHLETES for image/stats, fallback to on-chain data
            const mock = MOCK_ATHLETES.find((a) => a.tokenId === tokenId);
            return {
              id: tokenId,
              tokenId,
              name: fields.name,
              sport: fields.sport as "NBA" | "SOCCER" | "F1",
              position: fields.position,
              rarity: Number(fields.rarity) as 0 | 1 | 2 | 3,
              imageUrl: mock?.imageUrl ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fields.name)}&backgroundColor=1b1b1b&textColor=D2FF00`,
              baseScore: Number(fields.base_score),
              price: mock?.price ?? 0,
              stats: mock?.stats ?? { avgPoints: Number(fields.base_score), gamesPlayed: 0, lastGameScore: 0 },
            };
          });

        // Fallback to mock data if wallet owns no on-chain athletes yet
        setAthletes(parsed.length > 0 ? parsed : MOCK_ATHLETES);
      } catch (e) {
        console.error("Failed to fetch owned athletes:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAthletes();
  }, [account?.address]);

  return { athletes, loading };
}
