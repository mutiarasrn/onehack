"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { formatAddress, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TxButton } from "@/components/web3/TxButton";
import { Coins } from "lucide-react";

// 1 OCT = 1_000_000_000 MIST
const MIST_PER_OCT = 1_000_000_000n;

function formatOct(mist: bigint): string {
  return (Number(mist) / Number(MIST_PER_OCT)).toFixed(0);
}

function parseOct(oct: string): bigint {
  return BigInt(Math.floor(parseFloat(oct || "0") * Number(MIST_PER_OCT)));
}

interface Candidate {
  address: string;
  teamName: string;
  odds: number;
  totalBet: bigint;
}

interface BettingPoolProps {
  leagueId: number;
  leagueObjectId?: string;   // on-chain object ID once deployed
  candidates: Candidate[];
  totalPool: bigint;
  myBet?: { predictedWinner: string; amount: bigint; settled: boolean };
  leagueWinner?: string;
}

export function BettingPoolPanel({
  leagueId,
  leagueObjectId,
  candidates,
  totalPool,
  myBet,
  leagueWinner,
}: BettingPoolProps) {
  const account = useCurrentAccount();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("10");
  const [showBetForm, setShowBetForm] = useState(false);

  const potentialPayout =
    selectedCandidate && totalPool > 0n
      ? (() => {
          const betMist = parseOct(betAmount);
          const candidateBet =
            candidates.find((c) => c.address === selectedCandidate)?.totalBet ?? 0n;
          const newPool = totalPool + betMist;
          const newCandidateBet = candidateBet + betMist;
          if (newCandidateBet === 0n) return 0;
          return Number((betMist * newPool) / newCandidateBet) / Number(MIST_PER_OCT);
        })()
      : 0;

  const hasBet = myBet && myBet.amount > 0n;
  const canClaim =
    hasBet && !myBet!.settled && leagueWinner === myBet!.predictedWinner;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Betting Pool</h3>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">
              {formatOct(totalPool)} OCT
            </span>
            <span className="text-muted-foreground">total wagered</span>
          </div>
        </div>
      </div>

      {/* My Bet Banner */}
      {hasBet && (
        <div className="border-b border-border bg-purple-900/20 px-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your bet:{" "}
              <span className="font-bold text-foreground">
                {formatOct(myBet!.amount)} OCT
              </span>{" "}
              on {formatAddress(myBet!.predictedWinner)}
            </p>
            {canClaim && (
              <TxButton
                buildTx={() => null}
                label="Claim Winnings"
                size="sm"
                className="bg-green-700 hover:bg-green-600"
              />
            )}
          </div>
        </div>
      )}

      {/* Candidates */}
      <div className="divide-y divide-border">
        {candidates.map((c) => {
          const isWinner = leagueWinner === c.address;
          return (
            <div
              key={c.address}
              onClick={() => {
                if (!hasBet) {
                  setSelectedCandidate(c.address);
                  setShowBetForm(true);
                }
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                !hasBet && "cursor-pointer hover:bg-accent/50",
                selectedCandidate === c.address && "bg-purple-900/20",
                isWinner && "bg-green-900/20"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {c.teamName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAddress(c.address)}
                </p>
              </div>

              <div className="w-32">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Odds</span>
                  <span
                    className={cn(
                      "font-bold",
                      isWinner ? "text-green-400" : "text-foreground"
                    )}
                  >
                    {c.odds}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-background">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isWinner ? "bg-green-500" : "bg-purple-600"
                    )}
                    style={{ width: `${c.odds}%` }}
                  />
                </div>
              </div>

              <div className="text-right min-w-[60px]">
                <p className="text-xs text-muted-foreground">Wagered</p>
                <p className="text-xs font-bold text-foreground">
                  {formatOct(c.totalBet)} OCT
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bet Form */}
      {showBetForm && selectedCandidate && !hasBet && (
        <div className="border-t border-border bg-background/40 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            Bet on {formatAddress(selectedCandidate)}
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Amount in OCT"
              className="bg-background"
              min="1"
            />
            <TxButton
              buildTx={() => null /* betting contract coming soon */}
              label="Place Bet"
              className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
              onSuccess={() => setShowBetForm(false)}
            />
            <Button
              variant="ghost"
              onClick={() => setShowBetForm(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
          {potentialPayout > 0 && (
            <p className="mt-2 text-xs text-green-400">
              Potential payout: ~{potentialPayout.toFixed(1)} OCT
            </p>
          )}
        </div>
      )}
    </div>
  );
}
