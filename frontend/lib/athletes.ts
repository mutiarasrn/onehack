export interface Athlete {
  id: number;
  tokenId: number;
  name: string;
  sport: "NBA" | "SOCCER" | "F1";
  position: string;
  rarity: 0 | 1 | 2 | 3; // 0=Bronze, 1=Silver, 2=Gold, 3=Legendary
  imageUrl: string;
  baseScore: number;
  price: number; // in ONE tokens (wei)
  stats: {
    avgPoints: number;
    gamesPlayed: number;
    lastGameScore: number;
  };
}

export const RARITY_NAMES = ["Bronze", "Silver", "Gold", "Legendary"] as const;
export const RARITY_COLORS = {
  0: "text-amber-700",
  1: "text-slate-400",
  2: "text-yellow-400",
  3: "text-purple-400",
} as const;
export const RARITY_BG = {
  0: "card-bronze",
  1: "card-silver",
  2: "card-gold",
  3: "card-legendary",
} as const;
export const RARITY_MULTIPLIERS = [1.0, 1.3, 1.6, 2.0] as const;

// Mock athlete data — in production this comes from AthleteNFT contract + IPFS
export const MOCK_ATHLETES: Athlete[] = [
  // NBA - Point Guards
  {
    id: 1, tokenId: 10, name: "Stephen Curry", sport: "NBA", position: "PG",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png`,
    baseScore: 48, price: 550, stats: { avgPoints: 44.6, gamesPlayed: 57, lastGameScore: 62 }
  },
  {
    id: 2, tokenId: 21, name: "Luka Doncic", sport: "NBA", position: "PG",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png`,
    baseScore: 50, price: 570, stats: { avgPoints: 46.8, gamesPlayed: 54, lastGameScore: 55 }
  },
  {
    id: 3, tokenId: 32, name: "Ja Morant", sport: "NBA", position: "PG",
    rarity: 2, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1629630.png`,
    baseScore: 40, price: 260, stats: { avgPoints: 37.4, gamesPlayed: 50, lastGameScore: 44 }
  },
  // NBA - Shooting Guards
  {
    id: 4, tokenId: 43, name: "Devin Booker", sport: "NBA", position: "SG",
    rarity: 2, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png`,
    baseScore: 42, price: 270, stats: { avgPoints: 39.2, gamesPlayed: 55, lastGameScore: 46 }
  },
  {
    id: 5, tokenId: 50, name: "Donovan Mitchell", sport: "NBA", position: "SG",
    rarity: 2, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1628378.png`,
    baseScore: 41, price: 250, stats: { avgPoints: 38.6, gamesPlayed: 53, lastGameScore: 45 }
  },
  // NBA - Small Forwards
  {
    id: 6, tokenId: 63, name: "LeBron James", sport: "NBA", position: "SF",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png`,
    baseScore: 52, price: 600, stats: { avgPoints: 49.1, gamesPlayed: 55, lastGameScore: 58 }
  },
  {
    id: 7, tokenId: 70, name: "Jayson Tatum", sport: "NBA", position: "SF",
    rarity: 2, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png`,
    baseScore: 44, price: 280, stats: { avgPoints: 41.2, gamesPlayed: 58, lastGameScore: 48 }
  },
  {
    id: 8, tokenId: 83, name: "Kevin Durant", sport: "NBA", position: "SF",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png`,
    baseScore: 50, price: 580, stats: { avgPoints: 47.3, gamesPlayed: 52, lastGameScore: 54 }
  },
  // NBA - Power Forwards
  {
    id: 9, tokenId: 93, name: "Giannis Antetokounmpo", sport: "NBA", position: "PF",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png`,
    baseScore: 55, price: 580, stats: { avgPoints: 51.3, gamesPlayed: 56, lastGameScore: 60 }
  },
  {
    id: 10, tokenId: 101, name: "Pascal Siakam", sport: "NBA", position: "PF",
    rarity: 1, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1627783.png`,
    baseScore: 36, price: 120, stats: { avgPoints: 33.4, gamesPlayed: 60, lastGameScore: 38 }
  },
  // NBA - Centers
  {
    id: 11, tokenId: 113, name: "Nikola Jokic", sport: "NBA", position: "C",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png`,
    baseScore: 58, price: 620, stats: { avgPoints: 54.8, gamesPlayed: 58, lastGameScore: 65 }
  },
  {
    id: 12, tokenId: 120, name: "Joel Embiid", sport: "NBA", position: "C",
    rarity: 3, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png`,
    baseScore: 54, price: 590, stats: { avgPoints: 50.6, gamesPlayed: 46, lastGameScore: 60 }
  },
  {
    id: 13, tokenId: 131, name: "Bam Adebayo", sport: "NBA", position: "C",
    rarity: 1, imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/1628389.png`,
    baseScore: 34, price: 110, stats: { avgPoints: 31.8, gamesPlayed: 62, lastGameScore: 36 }
  },
  // SOCCER
  {
    id: 14, tokenId: 143, name: "Erling Haaland", sport: "SOCCER", position: "FWD",
    rarity: 3, imageUrl: `/athletes/haaland.png`,
    baseScore: 18, price: 520, stats: { avgPoints: 16.4, gamesPlayed: 32, lastGameScore: 22 }
  },
  {
    id: 15, tokenId: 150, name: "Kylian Mbappé", sport: "SOCCER", position: "FWD",
    rarity: 3, imageUrl: `/athletes/mbappe.png`,
    baseScore: 17, price: 510, stats: { avgPoints: 15.8, gamesPlayed: 30, lastGameScore: 20 }
  },
  {
    id: 16, tokenId: 161, name: "Vinicius Jr", sport: "SOCCER", position: "FWD",
    rarity: 2, imageUrl: `/athletes/vinicius.png`,
    baseScore: 15, price: 240, stats: { avgPoints: 13.6, gamesPlayed: 28, lastGameScore: 17 }
  },
  {
    id: 17, tokenId: 172, name: "Pedri", sport: "SOCCER", position: "MID",
    rarity: 1, imageUrl: `/athletes/pedri.png`,
    baseScore: 12, price: 100, stats: { avgPoints: 11.2, gamesPlayed: 30, lastGameScore: 14 }
  },
  {
    id: 18, tokenId: 181, name: "Jude Bellingham", sport: "SOCCER", position: "MID",
    rarity: 2, imageUrl: `/athletes/bellingham.png`,
    baseScore: 14, price: 210, stats: { avgPoints: 12.8, gamesPlayed: 29, lastGameScore: 16 }
  },
  {
    id: 19, tokenId: 190, name: "Thibaut Courtois", sport: "SOCCER", position: "GK",
    rarity: 1, imageUrl: `/athletes/courtois.png`,
    baseScore: 10, price: 90, stats: { avgPoints: 9.4, gamesPlayed: 34, lastGameScore: 12 }
  },
  {
    id: 20, tokenId: 202, name: "Virgil van Dijk", sport: "SOCCER", position: "DEF",
    rarity: 2, imageUrl: `/athletes/vandijk.png`,
    baseScore: 11, price: 130, stats: { avgPoints: 10.2, gamesPlayed: 33, lastGameScore: 13 }
  },
  // F1 - Drivers
  {
    id: 21, tokenId: 211, name: "Max Verstappen", sport: "F1", position: "Driver",
    rarity: 3, imageUrl: `/athletes/verstappen.png`,
    baseScore: 60, price: 650, stats: { avgPoints: 58.2, gamesPlayed: 22, lastGameScore: 65 }
  },
  {
    id: 22, tokenId: 222, name: "Lewis Hamilton", sport: "F1", position: "Driver",
    rarity: 3, imageUrl: `/athletes/lewishamilton.png`,
    baseScore: 55, price: 600, stats: { avgPoints: 52.4, gamesPlayed: 22, lastGameScore: 58 }
  },
  {
    id: 23, tokenId: 233, name: "Charles Leclerc", sport: "F1", position: "Driver",
    rarity: 2, imageUrl: `/athletes/leclerc.png`,
    baseScore: 48, price: 300, stats: { avgPoints: 45.1, gamesPlayed: 22, lastGameScore: 50 }
  },
];

export function getAthleteById(id: number): Athlete | undefined {
  return MOCK_ATHLETES.find((a) => a.id === id);
}

export function getAthletesByTokenIds(tokenIds: number[]): Athlete[] {
  return MOCK_ATHLETES.filter((a) => tokenIds.includes(a.tokenId));
}

export function getAthletesBySport(sport: string): Athlete[] {
  return MOCK_ATHLETES.filter((a) => a.sport === sport);
}
