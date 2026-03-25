export interface League {
  id: number;
  name: string;
  sport: "NBA" | "SOCCER";
  entryFee: bigint;       // in MIST (1 OCT = 1_000_000_000 MIST)
  maxEntrants: number;
  currentEntrants: number;
  startTime: number;      // unix seconds
  duration: number;       // seconds
  status: 0 | 1 | 2;     // OPEN | ACTIVE | FINISHED
  prizePool: bigint;
  creator: string;        // Sui address (0x...)
}

export interface TeamEntry {
  leagueId: number;
  owner: string;
  athleteIds: number[];
  totalScore: number;
  rank?: number;
}

export interface BetEntry {
  leagueId: number;
  bettor: string;
  predictedWinner: string;
  amount: bigint;
  settled: boolean;
  payout: bigint;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  teamName: string;
  score: number;
  prize?: bigint;
  change?: "up" | "down" | "same";
}

export const LEAGUE_STATUS_LABELS = {
  0: "Registration Open",
  1: "Active",
  2: "Finished",
} as const;

export const SPORT_ICONS = {
  NBA: "🏀",
  SOCCER: "⚽",
} as const;
