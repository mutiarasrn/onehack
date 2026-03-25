"use client";

import { useState } from "react";
import { cn, getRarityBorder, getRarityTextColor, getRarityLabel, getMultiplier, formatScore } from "@/lib/utils";
import type { Athlete } from "@/lib/athletes";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

interface AthleteCardProps {
  athlete: Athlete;
  owned?: boolean;
  selected?: boolean;
  currentScore?: number;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const RARITY_BG_STYLES: Record<number, string> = {
  0: "card-bronze",
  1: "card-silver",
  2: "card-gold",
  3: "card-legendary",
};

const SPORT_COLORS: Record<string, string> = {
  NFL: "bg-green-900/60 text-green-300",
  NBA: "bg-orange-900/60 text-orange-300",
  SOCCER: "bg-blue-900/60 text-blue-300",
  F1: "bg-red-900/60 text-red-300",
};

export function AthleteCard({
  athlete,
  owned = false,
  selected = false,
  currentScore,
  onClick,
  size = "md",
}: AthleteCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rarityClass = RARITY_BG_STYLES[athlete.rarity];
  const rarityBorder = getRarityBorder(athlete.rarity);
  const rarityText = getRarityTextColor(athlete.rarity);

  const sizeClasses = {
    sm: "w-32 h-44",
    md: "w-44 h-60",
    lg: "w-52 h-72",
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300",
        sizeClasses[size],
        rarityClass,
        rarityBorder,
        selected && "ring-2 ring-purple-400 ring-offset-2 ring-offset-background scale-105",
        onClick && "hover:scale-105",
        !owned && "opacity-60"
      )}
      onClick={onClick}
      onMouseEnter={() => size === "lg" && setFlipped(false)}
    >
      {/* Rarity badge */}
      <div className={cn("absolute top-2 right-2 text-xs font-bold", rarityText)}>
        {getRarityLabel(athlete.rarity)}
      </div>

      {/* Athlete image placeholder */}
      <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-background/40">
        <img
          src={athlete.imageUrl}
          alt={athlete.name}
          className="h-12 w-12 rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(athlete.name)}`;
          }}
        />
      </div>

      {/* Name & Position */}
      <div className="text-center">
        <p className="text-xs font-bold text-foreground leading-tight truncate">
          {athlete.name}
        </p>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className={cn("rounded px-1 text-[10px] font-medium", SPORT_COLORS[athlete.sport])}>
            {athlete.sport}
          </span>
          <span className="rounded bg-background/40 px-1 text-[10px] text-muted-foreground">
            {athlete.position}
          </span>
        </div>
      </div>

      {/* Score / Stats */}
      <div className="mt-2 rounded-lg bg-background/40 p-1.5 text-center">
        {currentScore !== undefined ? (
          <div>
            <p className="text-[10px] text-muted-foreground">Live Score</p>
            <p className="text-sm font-bold text-green-400">{formatScore(currentScore)}</p>
          </div>
        ) : (
          <div>
            <p className="text-[10px] text-muted-foreground">Avg Pts</p>
            <p className="text-sm font-bold text-foreground">
              {athlete.stats.avgPoints}
            </p>
          </div>
        )}
      </div>

      {/* Multiplier badge */}
      {athlete.rarity > 0 && size !== "sm" && (
        <div className="mt-1 flex items-center justify-center gap-1">
          <Star className={cn("h-3 w-3", rarityText)} />
          <span className={cn("text-[10px] font-bold", rarityText)}>
            {getMultiplier(athlete.rarity)}x
          </span>
        </div>
      )}

      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-purple-600/20">
          <div className="rounded-full bg-purple-600 p-1">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Price tag (if not owned) */}
      {!owned && size !== "sm" && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-yellow-400 font-bold">
            {athlete.price} ONE
          </span>
        </div>
      )}
    </div>
  );
}
