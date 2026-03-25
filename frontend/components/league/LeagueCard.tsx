"use client";

import Link from "next/link";
import { cn, formatCountdown } from "@/lib/utils";
import type { League } from "@/types";
import { LEAGUE_STATUS_LABELS, SPORT_ICONS } from "@/types";
import { Users, Clock, Trophy } from "lucide-react";

interface LeagueCardProps {
  league: League;
}

const STATUS_COLORS = {
  0: "bg-blue-900/60 text-blue-300 border-blue-800",
  1: "bg-green-900/60 text-green-300 border-green-800",
  2: "bg-yellow-900/60 text-yellow-300 border-yellow-800",
  3: "bg-slate-800 text-slate-400 border-slate-700",
} as const;

export function LeagueCard({ league }: LeagueCardProps) {
  const entryFeeFormatted = (Number(league.entryFee) / 1_000_000_000).toFixed(0);
  const prizePoolFormatted = (Number(league.prizePool) / 1_000_000_000).toFixed(0);
  const endTime = new Date((league.startTime + league.duration) * 1000);
  const fillPercent = Math.round((league.currentEntrants / league.maxEntrants) * 100);

  return (
    <Link href={`/leagues/${league.id}`}>
      <div className="group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{SPORT_ICONS[league.sport]}</span>
              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-xs font-medium",
                  STATUS_COLORS[league.status]
                )}
              >
                {LEAGUE_STATUS_LABELS[league.status]}
              </span>
            </div>
            <h3 className="font-bold text-foreground group-hover:text-purple-300 transition-colors">
              {league.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-lg font-bold text-yellow-400">
              {prizePoolFormatted} OCT
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-xs text-muted-foreground mb-0.5">Entry</p>
            <p className="text-sm font-bold text-foreground">{entryFeeFormatted} OCT</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {league.currentEntrants}/{league.maxEntrants}
            </p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Ends</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {league.status === 2 ? "Done" : formatCountdown(endTime)}
            </p>
          </div>
        </div>

        {/* Fill bar */}
        <div className="h-1.5 w-full rounded-full bg-background">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {fillPercent}% full
        </p>
      </div>
    </Link>
  );
}
