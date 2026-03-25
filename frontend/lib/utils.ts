import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 1 OCT = 1_000_000_000 MIST (same scale as Sui/SUI)
const MIST_PER_OCT = 1_000_000_000n;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatONE(mist: bigint | string | number): string {
  const value = typeof mist === "bigint" ? mist : BigInt(Math.floor(Number(mist)));
  return `${(Number(value) / Number(MIST_PER_OCT)).toLocaleString()} OCT`;
}

export function toMist(amount: number): bigint {
  return BigInt(Math.floor(amount * Number(MIST_PER_OCT)));
}

export function formatScore(score: number): string {
  return score.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function getRarityLabel(rarity: number): string {
  return ["Bronze", "Silver", "Gold", "Legendary"][rarity] ?? "Unknown";
}

export function getRarityGlow(rarity: number): string {
  const glows = [
    "shadow-amber-900/50",
    "shadow-slate-400/30",
    "shadow-yellow-500/50",
    "shadow-purple-500/60",
  ];
  return glows[rarity] ?? "";
}

export function getRarityBorder(rarity: number): string {
  const borders = [
    "border-amber-800",
    "border-slate-500",
    "border-yellow-500",
    "border-purple-500",
  ];
  return borders[rarity] ?? "";
}

export function getRarityTextColor(rarity: number): string {
  const colors = [
    "text-amber-600",
    "text-slate-400",
    "text-yellow-400",
    "text-purple-400",
  ];
  return colors[rarity] ?? "";
}

export function getMultiplier(rarity: number): number {
  return [1.0, 1.3, 1.6, 2.0][rarity] ?? 1.0;
}

export function formatCountdown(endTime: Date): string {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
