"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { suiClient } from "@/lib/onechain";
import ADDRESSES from "@/lib/contract-addresses.json";

/**
 * Fetches the existing FantasyTeam for the current user in a given league,
 * by querying TeamSubmitted events then reading the team object.
 * Returns the athlete_token_ids so the team builder can pre-populate slots.
 */
export function useExistingTeam(leagueId: string) {
  const account = useCurrentAccount();
  const [tokenIds, setTokenIds] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account?.address || !leagueId) { setLoading(false); return; }

    async function fetch() {
      try {
        const PACKAGE_ID: string = (ADDRESSES as any).packageId || "";
        if (!PACKAGE_ID) { setLoading(false); return; }

        // Query TeamSubmitted events and find this user's team for this league
        const events = await suiClient.queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::fantasy_team::TeamSubmitted` },
          limit: 200,
        });

        let teamId: string | null = null;
        for (const e of events.data) {
          const parsed = e.parsedJson as any;
          const eventLeagueId = parsed?.league_id ?? parsed?.leagueId;
          const owner = parsed?.owner ?? e.sender ?? "";
          if (eventLeagueId === leagueId && owner === account!.address) {
            teamId = parsed?.team_id ?? parsed?.teamId ?? parsed?.id ?? null;
            // Don't break — take the last (most recent) submission
          }
        }

        if (!teamId) { setLoading(false); return; }

        const obj = await suiClient.getObject({ id: teamId, options: { showContent: true } });
        const fields = (obj.data?.content as any)?.fields;
        if (!fields) { setLoading(false); return; }

        const raw: number[] = (fields.athlete_token_ids ?? []).map((id: any) => Number(id));
        setTokenIds(raw);
      } catch (e) {
        console.error("useExistingTeam error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [account?.address, leagueId]);

  return { tokenIds, loading };
}
