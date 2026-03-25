"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Leaderboard } from "@/components/league/Leaderboard";
import { BettingPoolPanel } from "@/components/betting/BettingPool";
import { Button } from "@/components/ui/button";
import { TxButton } from "@/components/web3/TxButton";
import type { League, LeaderboardEntry } from "@/types";
import { SPORT_ICONS } from "@/types";
import { formatCountdown, cn } from "@/lib/utils";
import { Users, Clock, Trophy, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

// Mock data for the demo
const MOCK_LEAGUE: League = {
  id: 1, name: "OneChain Hoops Classic", sport: "NBA", entryFee: BigInt("10000000000"),
  maxEntrants: 20, currentEntrants: 14, startTime: Math.floor(Date.now() / 1000) - 1800,
  duration: 86400, status: 1, prizePool: BigInt("140000000000"), creator: "0x1234",
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: "0xabc1" as `0x${string}`, teamName: "Crypto Kings", score: 312, change: "up" },
  { rank: 2, address: "0xabc2" as `0x${string}`, teamName: "Diamond Hands FC", score: 298, change: "same" },
  { rank: 3, address: "0xabc3" as `0x${string}`, teamName: "Web3 Warriors", score: 281, change: "down" },
  { rank: 4, address: "0xabc4" as `0x${string}`, teamName: "Blockchain Ballers", score: 267, change: "up" },
  { rank: 5, address: "0xabc5" as `0x${string}`, teamName: "DeFi Dolphins", score: 254, change: "down" },
];

const MOCK_CANDIDATES = [
  { address: "0xabc1", teamName: "Crypto Kings", odds: 45, totalBet: BigInt("450000000000") },
  { address: "0xabc2", teamName: "Diamond Hands FC", odds: 30, totalBet: BigInt("300000000000") },
  { address: "0xabc3", teamName: "Web3 Warriors", odds: 25, totalBet: BigInt("250000000000") },
];

const TABS = ["Overview", "Bets"];

export default function LeagueDetailPage() {
  const { leagueId } = useParams();
  const account = useCurrentAccount();
  const address = account?.address;
  const [tab, setTab] = useState("Overview");
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD);
  const league = MOCK_LEAGUE;

  // Simulate live score updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev
          .map((e) => ({
            ...e,
            score: e.score + Math.floor(Math.random() * 5),
          }))
          .sort((a, b) => b.score - a.score)
          .map((e, i) => ({
            ...e,
            rank: i + 1,
            change: e.rank === i + 1 ? "same" : e.rank > i + 1 ? "up" : "down",
          })) as LeaderboardEntry[]
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const endTime = new Date((league.startTime + league.duration) * 1000);
  // Convert from MIST (1e9) to OCT
  const prizePoolFormatted = (Number(league.prizePool) / 1_000_000_000).toFixed(0);
  const hasTeam = true; // Mock: assume user has team

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        {/* League Header */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{SPORT_ICONS[league.sport]}</span>
                <span className="rounded border border-green-800 bg-green-900/60 px-2 py-0.5 text-xs font-medium text-green-300">
                  Live
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{league.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {league.currentEntrants}/{league.maxEntrants} teams
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Ends {formatCountdown(endTime)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
              <p className="text-3xl font-extrabold text-yellow-400">{prizePoolFormatted} ONE</p>
              <p className="text-xs text-muted-foreground">60/25/15% split</p>
            </div>
          </div>

          {/* Prize breakdown */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { place: "1st", pct: 60, color: "text-yellow-400 border-yellow-800 bg-yellow-900/20" },
              { place: "2nd", pct: 25, color: "text-slate-400 border-slate-700 bg-slate-800/20" },
              { place: "3rd", pct: 15, color: "text-amber-700 border-amber-900 bg-amber-900/20" },
            ].map(({ place, pct, color }) => (
              <div key={place} className={cn("rounded-xl border p-3 text-center", color)}>
                <p className="text-xs font-medium">{place} Place</p>
                <p className="text-lg font-bold">
                  {Math.floor((parseFloat(prizePoolFormatted) * pct) / 100)} ONE
                </p>
                <p className="text-xs opacity-60">{pct}%</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!hasTeam && (
            <div className="mt-4">
              <Link href={`/leagues/${leagueId}/team`}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="mr-2 h-4 w-4" />
                  Build & Join with Team
                </Button>
              </Link>
            </div>
          )}
          {hasTeam && (
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-lg border border-green-800 bg-green-900/20 px-3 py-1.5 text-sm text-green-300">
                Team submitted ✓
              </div>
              <Link href={`/leagues/${leagueId}/team`}>
                <Button variant="outline" size="sm">
                  Edit Team <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <Leaderboard
            entries={leaderboard}
            prizePool={league.prizePool}
            isLive
          />
        )}

        {tab === "Bets" && (
          <BettingPoolPanel
            leagueId={league.id}
            candidates={MOCK_CANDIDATES}
            totalPool={BigInt("1000000000000")}
          />
        )}
      </div>
    </div>
  );
}
