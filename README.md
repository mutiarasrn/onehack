# OneChain Fantasy Sports

A fantasy sports platform built on OneChain (Sui-fork) where players create teams, earn points from real-world athlete performances, and compete for OCT token prizes via GameFi mechanics.

## Architecture

```
onehack/
├── move_contracts/   Move smart contracts (OneChain/Sui)
├── frontend/         Next.js 14 App Router frontend
└── mock-oracle/      Node.js score simulator (pushes live data on-chain)
```

## Smart Contracts (Move)

| Module | Purpose |
|---|---|
| `athlete_nft` | Athlete cards with rarity multipliers (Bronze/Silver/Gold/Legendary) |
| `points_oracle` | Receives live score data from oracle service |
| `fantasy_team` | Team assembly — owned object, 5-slot roster |
| `league_manager` | Contest lifecycle: create → join → resolve; OCT prize pool |
| `score_resolver` | Computes team score from oracle data + rarity bonuses |
| `faucet` | Testnet OCT drip (epoch-based cooldown) |

## Token

All in-game transactions use **OCT** — the native token of OneChain.

- 1 OCT = 1,000,000,000 MIST (same scale as SUI/MIST)
- Entry fees, prize pools, and faucet drips are all denominated in OCT

## Quick Start

### 1. Contracts

```bash
# Install OneChain CLI (one — Sui-compatible)
# https://docs.onelabs.cc

cd move_contracts

# Deploy to testnet
bash scripts/deploy.sh
# Writes packageId to frontend/lib/contract-addresses.json

# Mint all 20 athletes
npm run seed

# Manually add to contract-addresses.json after deploy:
# scoreBoardId, oracleCapId, faucetId
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in contract addresses

npm run dev
# Open http://localhost:3000
```

### 3. Mock Oracle (live scores)

```bash
cd mock-oracle
cp .env.example .env
# Fill in: ORACLE_PRIVATE_KEY, PACKAGE_ID, SCORE_BOARD_ID, etc.

npm run start
# Pushes simulated scores every 30 seconds
```

## Game Flow

1. **Connect Wallet** → claim demo OCT from faucet (100 OCT per epoch)
2. **Buy Athlete NFTs** → each card has a sport, position, and rarity (Bronze/Silver/Gold/Legendary)
3. **Join a League** → pay OCT entry fee
4. **Build Team** → assign owned athletes to 5 roster slots
5. **Earn Points** → athletes earn points based on real-world performances (pushed by oracle)
6. **Claim Prizes** → top 3 teams split the prize pool (60/25/15%)

## Rarity Multipliers

| Rarity | Multiplier |
|---|---|
| Bronze | 1.0x |
| Silver | 1.3x |
| Gold | 1.6x |
| Legendary | 2.0x |

## OneChain Network (Testnet)

- RPC: `https://rpc-testnet.onelabs.cc:443`
- Faucet: `POST https://faucet-testnet.onelabs.cc/v1/gas`
- CLI: `one client publish --gas-budget 5000000`
