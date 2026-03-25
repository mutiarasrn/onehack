"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn, getMultiplier, formatScore } from "@/lib/utils";
import { MOCK_ATHLETES, type Athlete } from "@/lib/athletes";
import { AthleteCard } from "@/components/athletes/AthleteCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, X, Zap, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface TeamBuilderProps {
  leagueId: number;
  sport: string;
  onSubmit: (athleteIds: number[]) => Promise<void>;
  isSubmitting?: boolean;
  existingTeam?: number[];
}

const SLOT_REQUIREMENTS: Record<string, string[]> = {
  NBA: ["PG", "SG", "SF", "PF", "C"],
  SOCCER: ["GK", "DEF", "MID", "MID", "FWD"],
};

const FLEX_POSITIONS: string[] = [];

export function TeamBuilder({
  leagueId,
  sport,
  onSubmit,
  isSubmitting,
  existingTeam,
}: TeamBuilderProps) {
  const account = useCurrentAccount();
  const address = account?.address;
  const slots = SLOT_REQUIREMENTS[sport] || SLOT_REQUIREMENTS.NBA;

  // Initialize with existing team if editing
  const [selectedAthletes, setSelectedAthletes] = useState<Record<number, Athlete | null>>(
    () => Object.fromEntries(slots.map((_, i) => [i, null]))
  );

  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [sportFilter, setSportFilter] = useState(sport);

  // Get owned athletes (mock: all athletes for demo)
  const ownedAthletes = MOCK_ATHLETES.filter((a) => a.sport === sport);

  const totalProjectedScore = Object.values(selectedAthletes)
    .filter(Boolean)
    .reduce((sum, a) => sum + a!.baseScore * getMultiplier(a!.rarity), 0);

  const selectedIds = new Set(
    Object.values(selectedAthletes)
      .filter(Boolean)
      .map((a) => a!.id)
  );

  const handleSlotClick = (slotIndex: number) => {
    setActiveSlot(activeSlot === slotIndex ? null : slotIndex);
  };

  const handleAthleteSelect = (athlete: Athlete) => {
    if (activeSlot === null) return;

    // Check position compatibility
    const slotPos = slots[activeSlot];
    const isCompat =
      slotPos === "FLEX"
        ? FLEX_POSITIONS.includes(athlete.position)
        : athlete.position === slotPos;

    if (!isCompat) {
      toast.error(`${athlete.name} plays ${athlete.position}, need ${slotPos}`);
      return;
    }

    setSelectedAthletes((prev) => ({ ...prev, [activeSlot]: athlete }));
    setActiveSlot(null);
  };

  const handleRemove = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAthletes((prev) => ({ ...prev, [slotIndex]: null }));
  };

  const handleSubmit = async () => {
    const filled = Object.values(selectedAthletes).filter(Boolean);
    if (filled.length < slots.length) {
      toast.error(`Fill all ${slots.length} roster slots`);
      return;
    }
    try {
      await onSubmit(filled.map((a) => a!.tokenId));
    } catch (err) {
      toast.error("Failed to submit team");
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Left: Roster slots */}
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Your Roster</h3>
          <div className="rounded-lg bg-accent px-3 py-1 text-sm">
            <span className="text-muted-foreground">Projected: </span>
            <span className="font-bold text-green-400">
              {formatScore(totalProjectedScore)} pts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
          {slots.map((position, i) => {
            const athlete = selectedAthletes[i];
            const isActive = activeSlot === i;

            return (
              <div
                key={i}
                onClick={() => handleSlotClick(i)}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-2 transition-all",
                  "min-h-[100px] flex flex-col items-center justify-center",
                  isActive
                    ? "border-purple-500 bg-purple-500/10"
                    : athlete
                    ? "border-border bg-card hover:border-purple-400/50"
                    : "border-dashed border-border bg-card/50 hover:border-purple-500/50"
                )}
              >
                {/* Slot label */}
                <span className="absolute top-1.5 left-2 text-[10px] font-bold text-muted-foreground">
                  {position}
                </span>

                {athlete ? (
                  <>
                    <div className="mt-2">
                      <img
                        src={athlete.imageUrl}
                        alt={athlete.name}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <p className="mt-1 text-center text-xs font-bold text-foreground truncate max-w-full px-1">
                      {athlete.name}
                    </p>
                    <p className="text-[10px] text-green-400">
                      ~{formatScore(athlete.baseScore * getMultiplier(athlete.rarity))} pts
                    </p>
                    <button
                      onClick={(e) => handleRemove(i, e)}
                      className="absolute top-1 right-1 rounded-full bg-red-900/60 p-0.5 hover:bg-red-600/80 transition-colors"
                    >
                      <X className="h-3 w-3 text-red-300" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isActive ? "Select athlete →" : "Click to fill"}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.values(selectedAthletes).some((a) => !a)}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Submit Team to League
            </>
          )}
        </Button>
      </div>

      {/* Right: Athlete picker */}
      {activeSlot !== null && (
        <div className="w-full lg:w-80">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">
              Choose {slots[activeSlot]}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSlot(null)}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-border bg-card p-2">
            <div className="grid grid-cols-2 gap-2">
              {ownedAthletes
                .filter((a) => {
                  const slotPos = slots[activeSlot];
                  if (slotPos === "FLEX") return FLEX_POSITIONS.includes(a.position);
                  return a.position === slotPos;
                })
                .map((athlete) => (
                  <AthleteCard
                    key={athlete.id}
                    athlete={athlete}
                    owned
                    selected={selectedIds.has(athlete.id)}
                    size="sm"
                    onClick={() => handleAthleteSelect(athlete)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
