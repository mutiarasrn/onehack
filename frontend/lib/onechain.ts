/**
 * OneChain client — replaces wagmi.ts / viem config.
 * Uses @mysten/sui SDK (OneChain is a Sui-fork).
 */
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import ADDRESSES from "./contract-addresses.json";

export const ONECHAIN_RPC =
  process.env.NEXT_PUBLIC_ONECHAIN_RPC || ADDRESSES.rpc || "https://rpc-testnet.onelabs.cc:443";

export const suiClient = new SuiClient({ url: ONECHAIN_RPC });

export const PACKAGE_ID: string = ADDRESSES.packageId || "";
export const SCORE_BOARD_ID: string = ADDRESSES.scoreBoardId || "";

// ─── Move call targets ──────────────────────────────────────────────────────

export const TARGETS = {
  joinLeague:      `${PACKAGE_ID}::league_manager::join_league`,
  joinLeagueFree:  `${PACKAGE_ID}::league_manager::join_league_free`,
  submitTeam:      `${PACKAGE_ID}::fantasy_team::submit_team`,
  getScore:        `${PACKAGE_ID}::points_oracle::get_score`,
  drip:            `${PACKAGE_ID}::faucet::drip`,
} as const;

// ─── Score fetcher ─────────────────────────────────────────────────────────

export async function getAthleteScores(): Promise<Record<number, number>> {
  if (!SCORE_BOARD_ID) return {};

  try {
    const obj = await suiClient.getObject({
      id: SCORE_BOARD_ID,
      options: { showContent: true },
    });

    const content = obj.data?.content;
    if (content?.dataType !== "moveObject") return {};

    // The scores table is a dynamic field table — fetch via dynamic fields
    const fields = await suiClient.getDynamicFields({ parentId: SCORE_BOARD_ID });
    const scores: Record<number, number> = {};

    for (const field of fields.data) {
      const df = await suiClient.getDynamicFieldObject({
        parentId: SCORE_BOARD_ID,
        name: field.name,
      });
      const tokenId = Number(field.name.value);
      const pts = Number((df.data?.content as any)?.fields?.value ?? 0);
      scores[tokenId] = Math.round(pts / 100); // un-scale from x100
    }

    return scores;
  } catch {
    return {};
  }
}
