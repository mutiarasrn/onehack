# Deploy Guide — OneChain Fantasy Sports

## Prerequisites

- Node.js 18+
- `jq` installed
- `one` CLI (OneChain, Sui-compatible)

### Install `one` CLI

```bash
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one --features tracing
```

### Install `jq`

```bash
sudo apt install jq -y
```

---

## Step 1 — Setup Wallet

Check your active address:

```bash
one client active-address
```

Make sure you're on testnet:

```bash
one client new-env --alias testnet --rpc https://rpc-testnet.onelabs.cc:443
one client switch --env testnet
```

---

## Step 2 — Get Testnet OCT (Gas)

```bash
curl -X POST https://faucet-testnet.onelabs.cc/v1/gas -H "Content-Type: application/json" -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'
```

Replace `<YOUR_ADDRESS>` with your wallet address from Step 1.

---

## Step 3 — Deploy the Contract

Run this from the repo root:

```bash
cd /path/to/onehack
bash move_contracts/scripts/deploy.sh
```

> Note: The default gas budget in `deploy.sh` is too low. If you get `InsufficientGas`, run publish manually:

```bash
cd move_contracts
one client publish --gas-budget 100000000 --json 2>&1 | tee /tmp/deploy-result.json
```

---

## Step 4 — Fill in contract-addresses.json

After deploy, look at the output JSON and find these objects:

| Field | objectType to look for |
|-------|------------------------|
| `packageId` | `"type": "published"` |
| `scoreBoardId` | `::points_oracle::ScoreBoard` (Shared) |
| `oracleCapId` | `::points_oracle::OracleCap` |
| `tokenCounterId` | `::athlete_nft::TokenCounter` (Shared) |
| `minterCapId` | `::athlete_nft::MinterCap` |
| `adminCapId` | `::league_manager::AdminCap` |

Edit `frontend/lib/contract-addresses.json`:

```json
{
  "packageId": "0x...",
  "scoreBoardId": "0x...",
  "oracleCapId": "0x...",
  "tokenCounterId": "0x...",
  "minterCapId": "0x...",
  "adminCapId": "0x...",
  "network": "testnet",
  "rpc": "https://rpc-testnet.onelabs.cc:443"
}
```

---

## Step 5 — Get Your Private Key (Hex)

```bash
one keytool convert <your-suiprivkey1...>
```

Copy the `hexWithoutFlag` value (64 hex characters, no `0x` prefix).

---

## Step 6 — Seed Athletes

```bash
cd move_contracts
npm install
export DEPLOYER_PRIVATE_KEY=<hexWithoutFlag>
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-athletes.ts
```

If you get `No valid gas coins found`, request faucet again (Step 2) and retry.

If you get `502 Bad Gateway`, the testnet RPC is temporarily down — wait a minute and retry.

On success you'll see:

```
Deployer address: 0x...
MinterCap: 0x...
TokenCounter: 0x...
Minting 20 athletes...
✓ Athletes minted — tx digest: ...
All done! Athletes are live on OneChain testnet.
```

---

## Step 7 — Setup Mock Oracle

```bash
cd mock-oracle
cp .env.example .env
```

Fill in `mock-oracle/.env`:

```env
ORACLE_PRIVATE_KEY=<same hexWithoutFlag from Step 5>
PACKAGE_ID=<packageId>
SCORE_BOARD_ID=<scoreBoardId>
ORACLE_CAP_ID=<oracleCapId>
```

Then start:

```bash
npm install
npm run start
```

---

## Summary of All IDs

All IDs come from the deploy transaction output in Step 3. They are also saved in `frontend/lib/contract-addresses.json` after you fill them in Step 4.

The same wallet (and private key) is used for both deploying and seeding — it owns `MinterCap`, `OracleCap`, and `AdminCap`.
