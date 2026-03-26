/**
 * Seed athletes onto OneChain testnet using the published Move package.
 * Run: npx ts-node seed-athletes.ts
 */
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import * as fs from "fs";
import * as path from "path";

// ─── Config ────────────────────────────────────────────────────────────────

const ADDRESSES = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../frontend/lib/contract-addresses.json"),
    "utf8"
  )
);

const PACKAGE_ID: string = ADDRESSES.packageId;

// Load deployer keypair from env or generate ephemeral
const keypair = process.env.DEPLOYER_PRIVATE_KEY
  ? Ed25519Keypair.fromSecretKey(
      Buffer.from(process.env.DEPLOYER_PRIVATE_KEY.replace("0x", ""), "hex")
    )
  : Ed25519Keypair.generate();

const client = new SuiClient({ url: "https://rpc-testnet.onelabs.cc:443" });

// ─── Athletes ──────────────────────────────────────────────────────────────

const ATHLETES = [
  // NBA – Point Guards
  { name: "Stephen Curry",          sport: "NBA", position: "PG", imageUri: "/athletes/curry.jpg",    rarity: 3, baseScore: 4800 },
  { name: "Luka Doncic",            sport: "NBA", position: "PG", imageUri: "/athletes/luka.jpg",     rarity: 3, baseScore: 5000 },
  { name: "Ja Morant",              sport: "NBA", position: "PG", imageUri: "/athletes/morant.jpg",   rarity: 2, baseScore: 4000 },
  // NBA – Shooting Guards
  { name: "Devin Booker",           sport: "NBA", position: "SG", imageUri: "/athletes/booker.jpg",   rarity: 2, baseScore: 4200 },
  { name: "Donovan Mitchell",       sport: "NBA", position: "SG", imageUri: "/athletes/mitchell.jpg", rarity: 2, baseScore: 4100 },
  // NBA – Small Forwards
  { name: "LeBron James",           sport: "NBA", position: "SF", imageUri: "/athletes/lebron.jpg",   rarity: 3, baseScore: 5200 },
  { name: "Jayson Tatum",           sport: "NBA", position: "SF", imageUri: "/athletes/tatum.jpg",    rarity: 2, baseScore: 4400 },
  { name: "Kevin Durant",           sport: "NBA", position: "SF", imageUri: "/athletes/durant.jpg",   rarity: 3, baseScore: 5000 },
  // NBA – Power Forwards
  { name: "Giannis Antetokounmpo",  sport: "NBA", position: "PF", imageUri: "/athletes/giannis.jpg", rarity: 3, baseScore: 5500 },
  { name: "Pascal Siakam",          sport: "NBA", position: "PF", imageUri: "/athletes/siakam.jpg",   rarity: 1, baseScore: 3600 },
  // NBA – Centers
  { name: "Nikola Jokic",           sport: "NBA", position: "C",  imageUri: "/athletes/jokic.jpg",    rarity: 3, baseScore: 5800 },
  { name: "Joel Embiid",            sport: "NBA", position: "C",  imageUri: "/athletes/embiid.jpg",   rarity: 3, baseScore: 5400 },
  { name: "Bam Adebayo",            sport: "NBA", position: "C",  imageUri: "/athletes/adebayo.jpg",  rarity: 1, baseScore: 3400 },
  // SOCCER
  { name: "Erling Haaland",         sport: "SOCCER", position: "FWD", imageUri: "/athletes/haaland.jpg",    rarity: 3, baseScore: 1800 },
  { name: "Kylian Mbappé",          sport: "SOCCER", position: "FWD", imageUri: "/athletes/mbappe.jpg",     rarity: 3, baseScore: 1700 },
  { name: "Vinicius Jr",            sport: "SOCCER", position: "FWD", imageUri: "/athletes/vinicius.jpg",   rarity: 2, baseScore: 1500 },
  { name: "Pedri",                  sport: "SOCCER", position: "MID", imageUri: "/athletes/pedri.jpg",      rarity: 1, baseScore: 1200 },
  { name: "Jude Bellingham",        sport: "SOCCER", position: "MID", imageUri: "/athletes/bellingham.jpg", rarity: 2, baseScore: 1400 },
  { name: "Thibaut Courtois",       sport: "SOCCER", position: "GK",  imageUri: "/athletes/courtois.jpg",   rarity: 1, baseScore: 1000 },
  { name: "Virgil van Dijk",        sport: "SOCCER", position: "DEF", imageUri: "/athletes/vandijk.jpg",    rarity: 2, baseScore: 1100 },
];

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const sender = keypair.toSuiAddress();
  console.log("Deployer address:", sender);

  const minterCapId: string = ADDRESSES.minterCapId;
  const tokenCounterId: string = ADDRESSES.tokenCounterId;

  if (!minterCapId) {
    console.error("minterCapId not found in contract-addresses.json");
    process.exit(1);
  }
  if (!tokenCounterId) {
    console.error("tokenCounterId not found in contract-addresses.json");
    process.exit(1);
  }

  console.log("MinterCap:", minterCapId);
  console.log("TokenCounter:", tokenCounterId);
  console.log("Minting", ATHLETES.length, "athletes...\n");

  const tx = new Transaction();

  for (const a of ATHLETES) {
    tx.moveCall({
      target: `${PACKAGE_ID}::athlete_nft::mint`,
      arguments: [
        tx.object(minterCapId),
        tx.object(tokenCounterId),
        tx.pure(bcs.vector(bcs.u8()).serialize(Array.from(Buffer.from(a.name)))),
        tx.pure(bcs.vector(bcs.u8()).serialize(Array.from(Buffer.from(a.sport)))),
        tx.pure(bcs.vector(bcs.u8()).serialize(Array.from(Buffer.from(a.position)))),
        tx.pure(bcs.vector(bcs.u8()).serialize(Array.from(Buffer.from(a.imageUri)))),
        tx.pure.u8(a.rarity),
        tx.pure.u64(a.baseScore),
        tx.pure.address(sender),
      ],
    });
  }

  tx.setGasBudget(100_000_000);

  // Fetch gas coin dynamically
  const coins = await client.getCoins({ owner: sender });
  if (!coins.data.length) throw new Error("No gas coins found");
  const gas = coins.data[0];
  tx.setGasPayment([{
    objectId: gas.coinObjectId,
    version: gas.version,
    digest: gas.digest,
  }]);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  console.log("✓ Athletes minted — tx digest:", result.digest);
  console.log("\nAll done! Athletes are live on OneChain testnet.");
}

main().catch(console.error);
