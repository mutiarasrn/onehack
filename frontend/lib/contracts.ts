/**
 * Move contract helpers for OneChain Fantasy Sports.
 * Each function returns a Transaction (PTB) ready to be signed by the wallet,
 * or null if the package is not yet deployed (demo/mock mode).
 */
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
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
      tx.pure(bcs.vector(bcs.u8()).serialize(strBytes(args.name))),
      tx.pure(bcs.vector(bcs.u8()).serialize(strBytes(args.sport))),
      tx.pure(bcs.u64().serialize(args.entryFee)),
      tx.pure(bcs.u64().serialize(args.maxEntrants)),
      tx.pure(bcs.u64().serialize(args.startTimeMs)),
      tx.pure(bcs.u64().serialize(args.durationMs)),
      tx.pure(bcs.vector(bcs.u64()).serialize(args.prizeSplits)),
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
      tx.pure(bcs.Address.serialize(leagueObjectId)),
      tx.pure(bcs.vector(bcs.u64()).serialize(athleteTokenIds)),
    ],
  });
  return tx;
}

// ─── Marketplace ───────────────────────────────────────────────────────────

/** List an AthleteNFT for sale at a fixed OCT price (in MIST). */
export function buildListTx(
  nftObjectId: string,
  priceMist: number
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::marketplace::list`,
    arguments: [
      tx.object(nftObjectId),
      tx.pure(bcs.u64().serialize(priceMist)),
    ],
  });
  return tx;
}

/** Buy a listed AthleteNFT — splits payment from the user's gas coin. */
export function buildBuyTx(
  listingObjectId: string,
  priceMist: number
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  const [payment] = tx.splitCoins(tx.gas, [priceMist]);
  tx.moveCall({
    target: `${PACKAGE_ID}::marketplace::buy`,
    arguments: [
      tx.object(listingObjectId),
      payment,
    ],
  });
  return tx;
}

/** Cancel a listing and reclaim the NFT. */
export function buildDelistTx(
  listingObjectId: string
): Transaction | null {
  if (!deployed) return null;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::marketplace::delist`,
    arguments: [tx.object(listingObjectId)],
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
