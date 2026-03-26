/**
 * List all AthleteNFTs (from new package) to the marketplace.
 * Run: DEPLOYER_PRIVATE_KEY=<hex> npx ts-node scripts/list-athletes.ts
 */
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import * as fs from "fs";
import * as path from "path";

const ADDRESSES = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../frontend/lib/contract-addresses.json"),
    "utf8"
  )
);

const PACKAGE_ID: string = ADDRESSES.packageId;
const client = new SuiClient({ url: "https://rpc-testnet.onelabs.cc:443" });

const keypair = process.env.DEPLOYER_PRIVATE_KEY
  ? Ed25519Keypair.fromSecretKey(
      Buffer.from(process.env.DEPLOYER_PRIVATE_KEY.replace("0x", ""), "hex")
    )
  : (() => { throw new Error("DEPLOYER_PRIVATE_KEY not set"); })();

// Price per tokenId (MIST) — matches athletes.ts
const PRICES: Record<number, number> = {
  1:  3_800_000_000,
  2:  4_000_000_000,
  3:  2_400_000_000,
  4:  2_600_000_000,
  5:  2_200_000_000,
  6:  4_200_000_000,
  7:  2_800_000_000,
  8:  3_600_000_000,
  9:  3_800_000_000,
  10: 1_400_000_000,
  11: 4_400_000_000,
  12: 3_400_000_000,
  13: 1_200_000_000,
  14: 3_600_000_000,
  15: 3_400_000_000,
  16: 2_000_000_000,
  17: 1_600_000_000,
  18: 2_200_000_000,
  19: 1_000_000_000,
  20: 1_800_000_000,
};

async function main() {
  const sender = keypair.toSuiAddress();
  console.log("Seller address:", sender);
  console.log("Package:", PACKAGE_ID);

  // Fetch all AthleteNFTs from new package owned by deployer
  const objects = await client.getOwnedObjects({
    owner: sender,
    filter: { StructType: `${PACKAGE_ID}::athlete_nft::AthleteNFT` },
    options: { showContent: true },
  });

  if (!objects.data.length) {
    console.error("No AthleteNFTs found for this package. Run seed first.");
    process.exit(1);
  }

  console.log(`Found ${objects.data.length} athletes. Listing each one...\n`);

  // List one-by-one (each NFT needs its own tx because it gets consumed)
  for (const obj of objects.data) {
    if (obj.data?.content?.dataType !== "moveObject") continue;

    const fields = (obj.data.content as any).fields;
    const tokenId = Number(fields.token_id);
    const name = fields.name;
    const priceMist = PRICES[tokenId];

    if (!priceMist) {
      console.warn(`  [skip] tokenId ${tokenId} (${name}) — no price defined`);
      continue;
    }

    try {
      // Wait for node to sync after previous tx
      await new Promise((r) => setTimeout(r, 2000));

      // Fetch fresh gas coin
      const coins = await client.getCoins({ owner: sender });
      if (!coins.data.length) throw new Error("No gas coins");
      const gas = coins.data[0];

      const tx = new Transaction();
      tx.setGasBudget(10_000_000);
      tx.setGasPayment([{
        objectId: gas.coinObjectId,
        version: gas.version,
        digest: gas.digest,
      }]);

      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list`,
        arguments: [
          tx.object(obj.data.objectId),
          tx.pure(bcs.u64().serialize(priceMist)),
        ],
      });

      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true },
      });

      console.log(`  ✓ Listed tokenId ${tokenId} (${name}) @ ${priceMist / 1_000_000_000} OCT — tx: ${result.digest}`);
    } catch (err) {
      console.error(`  ✗ Failed tokenId ${tokenId} (${name}):`, (err as Error).message);
    }
  }

  console.log("\nAll done! Check marketplace.");
}

main().catch(console.error);
