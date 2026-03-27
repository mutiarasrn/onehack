# OneFantasy — On-Chain Fantasy Sports Platform

> **Track: GameFi** | Built on OneChain Testnet

A fully on-chain fantasy sports GameFi platform where players compete in fantasy leagues using real athlete NFTs, with OCT token prizes distributed automatically via smart contract. Every roster decision, every league entry, and every payout is a verifiable on-chain action — transparent, trustless, and rewarding.

**Live Demo:** https://onefantasy.vercel.app/

---

## Architecture

```
onehack/
├── move_contracts/   Move smart contracts (OneChain/Sui)
│   ├── sources/      6 Move modules
│   └── scripts/      Deploy, seed, and listing scripts
├── frontend/         Next.js 14 App Router + @mysten/dapp-kit
├── backend/          Express.js API (leaderboard, scores, leagues, auto-resolver)
└── mock-oracle/      Node.js score simulator (pushes live data on-chain every 30s)
```

---

## Smart Contracts (Move)

| Module | Purpose |
|--------|---------|
| `athlete_nft` | Athlete NFTs with MinterCap, rarity tiers (0–3), score multipliers |
| `points_oracle` | OracleCap + shared ScoreBoard — receives live score data from oracle |
| `fantasy_team` | Owned FantasyTeam object, 5-slot roster per player |
| `league_manager` | Contest lifecycle: create → join → resolve; OCT prize pool auto-distributed |
| `score_resolver` | Computes team score from oracle data + rarity bonuses |
| `marketplace` | Peer-to-peer AthleteNFT trading — list, buy, delist |
| `faucet` | Testnet OCT drip (epoch-based cooldown) |

---

## Backend API

Express.js backend deployed on Railway, connected to OneChain testnet RPC.

| Endpoint | Description |
|----------|-------------|
| `GET /api/leagues` | List all on-chain leagues (from LeagueCreated events) |
| `GET /api/leagues/:id` | Get single league object |
| `GET /api/leaderboard/:leagueId` | Ranked leaderboard with live scores |
| `GET /api/scores` | Current athlete scores (chain or simulated fallback) |
| `GET /api/listings` | Active marketplace listings |

### Key Backend Features
- **In-memory score simulator** — runs every 30s as fallback when on-chain oracle scores are empty
- **Auto-resolver cron job** — checks every 60s if any league has passed `end_time_ms`; automatically calls `resolve_league` on-chain to distribute OCT prizes to winners
- **Score fallback chain**: on-chain ScoreBoard → in-memory simulator → baseScore registry

---

## GameFi Mechanics

- **Real economic stakes** — entry fees and prize pools in OCT tokens
- **NFT rarity advantages** — Legendary athletes get 2x score multiplier
- **On-chain prize distribution** — prizes auto-sent to winners' wallets, no claiming needed
- **Play-to-earn** — skill-based competition with real token rewards
- **Secondary market** — athlete NFTs have tradeable value based on rarity and performance

### Rarity Multipliers

| Rarity | Multiplier |
|--------|-----------|
| Common (Bronze) | 1.0x |
| Rare (Silver) | 1.3x |
| Gold | 1.6x |
| Legendary | 2.0x |

---

## Game Flow

1. **Connect Wallet** — connect OneWallet via dapp-kit
2. **Get OCT** — claim testnet OCT from faucet
3. **Buy Athlete NFTs** — browse marketplace, buy athletes with OCT
4. **Join a League** — pay OCT entry fee to enter a fantasy league
5. **Build Team** — assign 5 owned athletes to roster slots (by position)
6. **Earn Points** — oracle pushes live scores every 30s to on-chain ScoreBoard
7. **Win Prizes** — when league ends, backend auto-resolves on-chain; top 3 get OCT prize split (60/25/15%)

---

## Deployed Contracts (OneChain Testnet)

| Object | Address |
|--------|---------|
| **Package** | `0x877c71292a91f4ab41f7e767ba2f653cf76fb31f291d851f3b975f7edfdcb7c9` |
| **ScoreBoard** | `0x0401c41185f29f1b689b0c319ca96eb723b990ddc01ccc37764efec799f4ac7f` |
| **TokenCounter** | `0x40e1b5907d0f1cf721ef3ab78d551368b740c8dae44a5a12f1e67138275524a0` |
| **AdminCap** | `0x48a8eaa6760f5671a7667df8b3cef6bafc0ffcd432355206043638daacc9d994` |
| **OracleCap** | `0x68a580f014a4ffb5cb4404359cb5d5956f249d7098be6f5e3a916cf9124a0a9a` |
| **MinterCap** | `0xa03e222c45ac6b20926341859ee095ef3da4a6e30f67fce930e2e414d8137d5f` |
| **Demo League** | `0x2357e1d37f7e7229f0313cf8bc228d62f6765c2283b8bcf3ac0d6263b962c7c6` |

- **Network**: OneChain Testnet
- **RPC**: `https://rpc-testnet.onelabs.cc:443`
- **Faucet**: `POST https://faucet-testnet.onelabs.cc/v1/gas`

---

## Deployments

| Service | URL |
|---------|-----|
| **Frontend** | https://onefantasy.vercel.app/ |
| **Backend API** | https://onehack-production.up.railway.app |

---

## Quick Start (Local)

### Prerequisites
- OneChain CLI (`one` — Sui-compatible): https://docs.onelabs.cc
- Node.js 18+

### 1. Contracts

```bash
cd move_contracts

# Deploy to testnet
bash scripts/deploy.sh
# Writes packageId to frontend/lib/contract-addresses.json

# Mint all 20 athletes to deployer wallet
npm run seed

# List all athletes to marketplace
DEPLOYER_PRIVATE_KEY=<hex> npx ts-node scripts/list-athletes.ts
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in: ADMIN_PRIVATE_KEY, PACKAGE_ID, SCORE_BOARD_ID, ADMIN_CAP_ID

npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > .env.local

npm run dev
# Open http://localhost:3000
```

### 4. Mock Oracle (not required)

> **You do not need to run the mock oracle.** The backend already includes a built-in in-memory score simulator that runs automatically on startup — no extra setup needed.
>
> The backend simulator ticks every 30 seconds, accumulates athlete scores, and serves them via `/api/scores` and `/api/leaderboard`. If on-chain scores exist (from a real oracle push), those take priority; otherwise the backend's simulated scores are used as fallback.
>
> Only run the mock oracle if you want scores to actually be written on-chain (requires a funded wallet with OCT for gas).

```bash
# Only needed if you want on-chain score writes:
cd mock-oracle
cp .env.example .env
# Fill in: ORACLE_PRIVATE_KEY, PACKAGE_ID, SCORE_BOARD_ID, ORACLE_CAP_ID

npm run start
# Pushes simulated scores on-chain every 30 seconds
```

---

## Token

All in-game transactions use **OCT** — the native token of OneChain.

- 1 OCT = 1,000,000,000 MIST (same scale as SUI/MIST)
- Entry fees, prize pools, marketplace prices, and faucet drips are all denominated in OCT
