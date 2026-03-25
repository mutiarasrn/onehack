"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TxButton } from "@/components/web3/TxButton";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildCreateLeagueTx } from "@/lib/contracts";

const SPORTS = [
  { value: "NBA", icon: "🏀", desc: "National Basketball Association" },
  { value: "SOCCER", icon: "⚽", desc: "International Football" },
];

const PRIZE_SPLITS = [
  { label: "Winner Takes All", splits: [100, 0, 0] },
  { label: "Top 2 Split", splits: [70, 30, 0] },
  { label: "Top 3 Split", splits: [60, 25, 15] },
  { label: "Top 5 Split", splits: [50, 25, 15, 7, 3] },
];

const DURATIONS = [
  { label: "3 Hours", value: 10800 },
  { label: "1 Day", value: 86400 },
  { label: "1 Week", value: 604800 },
];

export default function CreateLeaguePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "NBA",
    entryFee: "10",
    maxEntrants: "20",
    prizeStructure: 2,
    duration: 86400,
  });

  const update = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const buildCreate = () =>
    buildCreateLeagueTx({
      name: form.name,
      sport: form.sport,
      entryFee: Math.floor(Number(form.entryFee) * 1_000_000_000),
      maxEntrants: Number(form.maxEntrants),
      startTimeMs: Date.now() + 3_600_000,      // starts 1 hour from now
      durationMs: form.duration * 1000,
      prizeSplits: PRIZE_SPLITS[form.prizeStructure].splits.filter((s) => s > 0),
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-8">
        <Link href="/leagues" className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Leagues
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/40 border border-purple-700/50">
              <Trophy className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Create a League</h1>
              <p className="text-sm text-muted-foreground">Set up your fantasy contest</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* League Name */}
            <div className="space-y-2">
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                placeholder="e.g. Sunday Night Showdown"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Sport */}
            <div className="space-y-2">
              <Label>Sport</Label>
              <div className="grid grid-cols-3 gap-3">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update("sport", s.value)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition-all",
                      form.sport === s.value
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-border bg-background hover:border-purple-500/50"
                    )}
                  >
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className="text-sm font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Fee & Max Entrants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Entry Fee (ONE)</Label>
                <Input
                  id="fee"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={form.entryFee}
                  onChange={(e) => update("entryFee", e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">0 = Free to enter</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Entrants</Label>
                <Input
                  id="max"
                  type="number"
                  min="2"
                  max="200"
                  placeholder="20"
                  value={form.maxEntrants}
                  onChange={(e) => update("maxEntrants", e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Estimated prize pool */}
            {Number(form.entryFee) > 0 && (
              <div className="rounded-lg bg-yellow-900/20 border border-yellow-800/50 p-3 text-sm">
                <p className="text-yellow-300">
                  Estimated prize pool:{" "}
                  <span className="font-bold">
                    {Number(form.entryFee) * Number(form.maxEntrants)} ONE
                  </span>
                  {" "}(if full)
                </p>
              </div>
            )}

            {/* Prize Structure */}
            <div className="space-y-2">
              <Label>Prize Distribution</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRIZE_SPLITS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => update("prizeStructure", i)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      form.prizeStructure === i
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-border bg-background hover:border-purple-500/50"
                    )}
                  >
                    <p className="text-sm font-bold text-foreground mb-1">{p.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.splits.filter((s) => s > 0).map((s, j) => `${["1st","2nd","3rd","4th","5th"][j]}: ${s}%`).join(" · ")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Contest Duration</Label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d.value}
                    variant={form.duration === d.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("duration", d.value)}
                    className={cn(form.duration === d.value && "bg-purple-600 hover:bg-purple-700")}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <TxButton
              buildTx={buildCreate}
              label="Create League"
              loadingLabel="Creating league on-chain..."
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!form.name}
              onSuccess={() => router.push("/leagues")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
