"use client";

import { cn, formatAddress, formatScore } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal } from "lucide-react";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  prizePool?: bigint;
  isLive?: boolean;
}

const RANK_ICONS = [
  <Trophy key={1} className="h-4 w-4 text-yellow-400" />,
  <Medal key={2} className="h-4 w-4 text-slate-400" />,
  <Medal key={3} className="h-4 w-4 text-amber-700" />,
];

const PRIZE_SPLITS = [60, 25, 15];

export function Leaderboard({ entries, prizePool, isLive = false }: LeaderboardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Leaderboard</h3>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500 font-medium">Live</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No entries yet
          </div>
        ) : (
          entries.map((entry) => {
            const prizeAmount =
              prizePool && entry.rank && entry.rank <= 3
                ? (prizePool * BigInt(PRIZE_SPLITS[entry.rank - 1])) / 100n
                : undefined;

            return (
              <div
                key={entry.address}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors",
                  entry.rank === 1 && "bg-yellow-500/5",
                  entry.rank === 2 && "bg-slate-500/5",
                  entry.rank === 3 && "bg-amber-900/5"
                )}
              >
                {/* Rank */}
                <div className="flex w-8 items-center justify-center">
                  {entry.rank && entry.rank <= 3 ? (
                    RANK_ICONS[entry.rank - 1]
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Change indicator */}
                <div className="w-4">
                  {entry.change === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : entry.change === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.teamName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatAddress(entry.address)}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {formatScore(entry.score)}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>

                {/* Prize */}
                {prizeAmount !== undefined && (
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-bold text-yellow-400">
                      +{(Number(prizeAmount) / 1_000_000_000).toFixed(0)} OCT
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
