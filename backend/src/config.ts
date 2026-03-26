import dotenv from "dotenv";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

dotenv.config();

export const PACKAGE_ID =
  process.env.PACKAGE_ID ||
  "0x877c71292a91f4ab41f7e767ba2f653cf76fb31f291d851f3b975f7edfdcb7c9";

export const SCORE_BOARD_ID =
  process.env.SCORE_BOARD_ID ||
  "0x0401c41185f29f1b689b0c319ca96eb723b990ddc01ccc37764efec799f4ac7f";

export const RPC_URL =
  process.env.RPC_URL || "https://rpc-testnet.onelabs.cc:443";

export const PORT = parseInt(process.env.PORT || "3001", 10);

export const suiClient = new SuiClient({ url: RPC_URL });

export interface AthleteInfo {
  name: string;
  sport: string;
  position: string;
  rarity: number;
  priceMist: number;
  imageUrl: string;
  baseScore: number;
}

export const RARITY_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.3,
  2: 1.6,
  3: 2.0,
};

export const ATHLETE_REGISTRY: Record<number, AthleteInfo> = {
  1: {
    name: "Stephen Curry",
    sport: "NBA",
    position: "PG",
    rarity: 3,
    priceMist: 3_800_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png",
    baseScore: 48,
  },
  2: {
    name: "Luka Doncic",
    sport: "NBA",
    position: "PG",
    rarity: 3,
    priceMist: 4_000_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
    baseScore: 50,
  },
  3: {
    name: "Ja Morant",
    sport: "NBA",
    position: "PG",
    rarity: 2,
    priceMist: 2_400_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1629630.png",
    baseScore: 42,
  },
  4: {
    name: "Devin Booker",
    sport: "NBA",
    position: "SG",
    rarity: 2,
    priceMist: 2_600_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png",
    baseScore: 44,
  },
  5: {
    name: "Donovan Mitchell",
    sport: "NBA",
    position: "SG",
    rarity: 2,
    priceMist: 2_200_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1628378.png",
    baseScore: 40,
  },
  6: {
    name: "LeBron James",
    sport: "NBA",
    position: "SF",
    rarity: 3,
    priceMist: 4_200_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
    baseScore: 52,
  },
  7: {
    name: "Jayson Tatum",
    sport: "NBA",
    position: "SF",
    rarity: 2,
    priceMist: 2_800_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png",
    baseScore: 46,
  },
  8: {
    name: "Kevin Durant",
    sport: "NBA",
    position: "SF",
    rarity: 3,
    priceMist: 3_600_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png",
    baseScore: 47,
  },
  9: {
    name: "Giannis Antetokounmpo",
    sport: "NBA",
    position: "PF",
    rarity: 3,
    priceMist: 3_800_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
    baseScore: 49,
  },
  10: {
    name: "Pascal Siakam",
    sport: "NBA",
    position: "PF",
    rarity: 1,
    priceMist: 1_400_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1627783.png",
    baseScore: 35,
  },
  11: {
    name: "Nikola Jokic",
    sport: "NBA",
    position: "C",
    rarity: 3,
    priceMist: 4_400_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
    baseScore: 55,
  },
  12: {
    name: "Joel Embiid",
    sport: "NBA",
    position: "C",
    rarity: 3,
    priceMist: 3_400_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png",
    baseScore: 46,
  },
  13: {
    name: "Bam Adebayo",
    sport: "NBA",
    position: "C",
    rarity: 1,
    priceMist: 1_200_000_000,
    imageUrl:
      "https://cdn.nba.com/headshots/nba/latest/1040x760/1628389.png",
    baseScore: 33,
  },
  14: {
    name: "Erling Haaland",
    sport: "SOCCER",
    position: "FWD",
    rarity: 3,
    priceMist: 3_600_000_000,
    imageUrl: "/athletes/haaland.png",
    baseScore: 47,
  },
  15: {
    name: "Kylian Mbappé",
    sport: "SOCCER",
    position: "FWD",
    rarity: 3,
    priceMist: 3_400_000_000,
    imageUrl: "/athletes/mbappe.png",
    baseScore: 46,
  },
  16: {
    name: "Vinicius Jr",
    sport: "SOCCER",
    position: "FWD",
    rarity: 2,
    priceMist: 2_000_000_000,
    imageUrl: "/athletes/vinicius.png",
    baseScore: 40,
  },
  17: {
    name: "Pedri",
    sport: "SOCCER",
    position: "MID",
    rarity: 1,
    priceMist: 1_600_000_000,
    imageUrl: "/athletes/pedri.png",
    baseScore: 36,
  },
  18: {
    name: "Jude Bellingham",
    sport: "SOCCER",
    position: "MID",
    rarity: 2,
    priceMist: 2_200_000_000,
    imageUrl: "/athletes/bellingham.png",
    baseScore: 41,
  },
  19: {
    name: "Thibaut Courtois",
    sport: "SOCCER",
    position: "GK",
    rarity: 1,
    priceMist: 1_000_000_000,
    imageUrl: "/athletes/courtois.png",
    baseScore: 30,
  },
  20: {
    name: "Virgil van Dijk",
    sport: "SOCCER",
    position: "DEF",
    rarity: 2,
    priceMist: 1_800_000_000,
    imageUrl: "/athletes/vandijk.png",
    baseScore: 38,
  },
};
