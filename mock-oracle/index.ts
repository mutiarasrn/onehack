/**
 * OneChain Fantasy — Mock Oracle
 * Simulates live sports scoring by pushing athlete scores to the on-chain
 * PointsOracle.ScoreBoard shared object every 30 seconds.
 *
 * Uses @mysten/sui TypeScript SDK (replaces viem — OneChain is Move-based).
 */
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// ─── Config ────────────────────────────────────────────────────────────────

const RPC_URL = process.env.ONECHAIN_RPC_URL || "https://rpc-testnet.onelabs.cc:443";

const keypair = process.env.ORACLE_PRIVATE_KEY
  ? Ed25519Keypair.fromSecretKey(
      Buffer.from(process.env.ORACLE_PRIVATE_KEY.replace("0x", ""), "hex")
    )
  : (() => {
      console.warn("[Oracle] No ORACLE_PRIVATE_KEY set — using ephemeral key (scores won't persist)");
      return Ed25519Keypair.generate();
    })();

const client = new SuiClient({ url: RPC_URL });

// Loaded from frontend contract-addresses.json after deployment
let PACKAGE_ID = process.env.PACKAGE_ID || "";
let SCORE_BOARD_ID = process.env.SCORE_BOARD_ID || "";
let ORACLE_CAP_ID = process.env.ORACLE_CAP_ID || "";
const CONTEST_ID = BigInt(process.env.CONTEST_ID || "1");

// Try loading from deploy output
try {
  const addresses = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../frontend/lib/contract-addresses.json"),
      "utf8"
    )
  );
  if (!PACKAGE_ID) PACKAGE_ID = addresses.packageId || "";
  if (!SCORE_BOARD_ID) SCORE_BOARD_ID = addresses.scoreBoardId || "";
  if (!ORACLE_CAP_ID) ORACLE_CAP_ID = addresses.oracleCapId || "";
} catch {
  // File may not exist yet (pre-deploy)
}

// ─── Athlete registry ──────────────────────────────────────────────────────

// token_id matches the sequence minted by seed-athletes.ts (counter starts at 1)
const ATHLETES: Record<number, { name: string; sport: string; baseScore: number; currentScore: number }> = {
  // NBA
  1:  { name: "Stephen Curry",           sport: "NBA",    baseScore: 48, currentScore: 0 },
  2:  { name: "Luka Doncic",             sport: "NBA",    baseScore: 50, currentScore: 0 },
  3:  { name: "Ja Morant",               sport: "NBA",    baseScore: 40, currentScore: 0 },
  4:  { name: "Devin Booker",            sport: "NBA",    baseScore: 42, currentScore: 0 },
  5:  { name: "Donovan Mitchell",        sport: "NBA",    baseScore: 41, currentScore: 0 },
  6:  { name: "LeBron James",            sport: "NBA",    baseScore: 52, currentScore: 0 },
  7:  { name: "Jayson Tatum",            sport: "NBA",    baseScore: 44, currentScore: 0 },
  8:  { name: "Kevin Durant",            sport: "NBA",    baseScore: 50, currentScore: 0 },
  9:  { name: "Giannis Antetokounmpo",   sport: "NBA",    baseScore: 55, currentScore: 0 },
  10: { name: "Pascal Siakam",           sport: "NBA",    baseScore: 36, currentScore: 0 },
  11: { name: "Nikola Jokic",            sport: "NBA",    baseScore: 58, currentScore: 0 },
  12: { name: "Joel Embiid",             sport: "NBA",    baseScore: 54, currentScore: 0 },
  13: { name: "Bam Adebayo",             sport: "NBA",    baseScore: 34, currentScore: 0 },
  // SOCCER
  14: { name: "Erling Haaland",          sport: "SOCCER", baseScore: 18, currentScore: 0 },
  15: { name: "Kylian Mbappé",           sport: "SOCCER", baseScore: 17, currentScore: 0 },
  16: { name: "Vinicius Jr",             sport: "SOCCER", baseScore: 15, currentScore: 0 },
  17: { name: "Pedri",                   sport: "SOCCER", baseScore: 12, currentScore: 0 },
  18: { name: "Jude Bellingham",         sport: "SOCCER", baseScore: 14, currentScore: 0 },
  19: { name: "Thibaut Courtois",        sport: "SOCCER", baseScore: 10, currentScore: 0 },
  20: { name: "Virgil van Dijk",         sport: "SOCCER", baseScore: 11, currentScore: 0 },
};

// ─── Score simulation ──────────────────────────────────────────────────────

function simulateScoreUpdate(): { ids: bigint[]; points: bigint[] } {
  const ids: bigint[] = [];
  const points: bigint[] = [];

  for (const [tokenId, athlete] of Object.entries(ATHLETES)) {
    const variance = Math.floor(Math.random() * 12) - 2;
    const bigPlay = Math.random() < 0.05 ? Math.floor(Math.random() * 20) : 0;
    const increment = Math.max(0, variance + bigPlay);
    athlete.currentScore += increment;

    ids.push(BigInt(tokenId));
    // Scale by 100 to match on-chain representation (u64 scaled x100)
    points.push(BigInt(athlete.currentScore * 100));
  }

  return { ids, points };
}

// ─── Push scores on-chain ──────────────────────────────────────────────────

async function pushScores() {
  const { ids, points } = simulateScoreUpdate();

  // Simulation mode if contracts not deployed yet
  if (!PACKAGE_ID || !SCORE_BOARD_ID || !ORACLE_CAP_ID) {
    console.log(`[Oracle Simulation] Contest ${CONTEST_ID} score update (no contract configured):`);
    const top = Object.entries(ATHLETES)
      .sort((a, b) => b[1].currentScore - a[1].currentScore)
      .slice(0, 5);
    top.forEach(([, a]) => console.log(`  ${a.name} (${a.sport}): ${a.currentScore} pts`));
    return;
  }

  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::points_oracle::update_scores`,
      arguments: [
        tx.object(ORACLE_CAP_ID),
        tx.object(SCORE_BOARD_ID),
        tx.pure.u64(CONTEST_ID),
        tx.pure.vector("u64", ids.map((n) => Number(n))),
        tx.pure.vector("u64", points.map((n) => Number(n))),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });

    console.log(`[Oracle] Scores pushed — tx: ${result.digest}`);

    const top = Object.entries(ATHLETES)
      .sort((a, b) => b[1].currentScore - a[1].currentScore)
      .slice(0, 3);
    console.log("Top performers:");
    top.forEach(([, a], i) => console.log(`  ${i + 1}. ${a.name}: ${a.currentScore} pts`));
  } catch (err) {
    console.error("[Oracle] Failed to push scores:", (err as Error).message);
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("OneChain Fantasy Oracle Started");
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Oracle address: ${keypair.toSuiAddress()}`);
  console.log(`Contest #${CONTEST_ID} — updating every 30 seconds`);
  if (!PACKAGE_ID) console.warn("[Oracle] PACKAGE_ID not set — running in simulation mode");
  console.log("---");

  await pushScores();
  setInterval(pushScores, 30_000);
}

main().catch(console.error);
