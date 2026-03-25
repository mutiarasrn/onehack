/**
 * Move contract helpers for OneChain Fantasy Sports.
 * Each function returns a Transaction (PTB) ready to be signed by the wallet,
 * or null if the package is not yet deployed (demo/mock mode).
 */
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, SCORE_BOARD_ID } from "./onechain";
import ADDRESSES from "./contract-addresses.json";

const deployed = !!PACKAGE_ID;

export const CONTRACT_IDS = {
  packageId:     PACKAGE_ID,
  scoreBoardId:  SCORE_BOARD_ID,
  adminCapId:    (ADDRESSES as any).adminCapId    || "",
  oracleCapId:   (ADDRESSES as any).oracleCapId   || "",
  faucetId:      (ADDRESSES as any).faucetId      || "",
  treasuryCapId: (ADDRESSES as any).treasuryCapId || "",
} as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function strBytes(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

// ─── League ────────────────────────────────────────────────────────────────

interface CreateLeagueArgs {
  name: string;
  sport: string;
  entryFee: number;        // in MIST
  maxEntrants: number;
  startTimeMs: number;     // unix ms
  durationMs: number;      // ms
  prizeSplits: number[];   // e.g. [60, 25, 15]
}

/** Admin creates a new league. Requires AdminCap. */
export function buildCreateLeagueTx(args: CreateLeagueArgs): Transaction | null {
  if (!deployed || !CONTRACT_IDS.adminCapId) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::league_manager::create_league`,
    arguments: [
      tx.object(CONTRACT_IDS.adminCapId),
      tx.pure.vector("u8", strBytes(args.name)),
      tx.pure.vector("u8", strBytes(args.sport)),
      tx.pure.u64(args.entryFee),
      tx.pure.u64(args.maxEntrants),
      tx.pure.u64(args.startTimeMs),
      tx.pure.u64(args.durationMs),
      tx.pure.vector("u64", args.prizeSplits),
    ],
  });
  return tx;
}

/** Join a paid league — splits entry fee from the user's gas coin. */
export function buildJoinLeagueTx(
  leagueId: string,
  entryFeeMist: number,
  clockId = "0x6"
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  const [payment] = tx.splitCoins(tx.gas, [entryFeeMist]);
  tx.moveCall({
    target: `${PACKAGE_ID}::league_manager::join_league`,
    arguments: [
      tx.object(leagueId),
      payment,
      tx.object(clockId),
    ],
  });
  return tx;
}

/** Join a free league (entry_fee == 0). */
export function buildJoinLeagueFreeTx(
  leagueId: string,
  clockId = "0x6"
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::league_manager::join_league_free`,
    arguments: [tx.object(leagueId), tx.object(clockId)],
  });
  return tx;
}

// ─── Team ──────────────────────────────────────────────────────────────────

/** Submit a 5-player fantasy roster for a league. */
export function buildSubmitTeamTx(
  leagueObjectId: string,
  athleteTokenIds: number[]
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::fantasy_team::submit_team`,
    arguments: [
      tx.pure.id(leagueObjectId),
      tx.pure.vector("u64", athleteTokenIds),
    ],
  });
  return tx;
}

// ─── Faucet ────────────────────────────────────────────────────────────────

/** Claim testnet OCT from the faucet. */
export function buildDripTx(): Transaction | null {
  if (!deployed || !CONTRACT_IDS.faucetId || !CONTRACT_IDS.treasuryCapId) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::faucet::drip`,
    arguments: [
      tx.object(CONTRACT_IDS.faucetId),
      tx.object(CONTRACT_IDS.treasuryCapId),
    ],
  });
  return tx;
}
