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

## Deployed Contracts (Testnet)

| | |
|---|---|
| **Package ID** | `0x26ef263d4cb568d6c2364d7444ab07fa30826d81ecb5e21a3e9e16de5d3eb6a1` |
| **ScoreBoard** | `0xdeec81b6e9889cfd2d586d20da6f8f1eb7d6a3ae3336173bbd22ed67c1a2b14f` |
| **TokenCounter** | `0xd96c296e3aa2e83f1c6a42e509dbe339f83be2b9f51054678d82e591a7d258f7` |
| **AdminCap** | `0x137f38b14cab77b0d063662cf6afd02b1497c52cb7c73e07ac2bbe1bc7f1f3fd` |
| **Deploy Tx** | `GLz3WYQMZ86ykzxxhcTGnEuwXGzuh2daAoiE5pgFkCXw` |
| **Seed Tx** | `4dGTGvPRQK7sFw23DefwyoHKHGYxYficYsjpTbJtFcB5` |

## OneChain Network (Testnet)

- RPC: `https://rpc-testnet.onelabs.cc:443`
- Faucet: `POST https://faucet-testnet.onelabs.cc/v1/gas`
- CLI: `one client publish --gas-budget 100000000`
