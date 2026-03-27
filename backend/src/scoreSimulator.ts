/**
 * In-memory score simulator for demo/hackathon use.
 * Runs every 30s, accumulates scores same way as mock-oracle.
 * Used as fallback when on-chain ScoreBoard is empty.
 */
import { ATHLETE_REGISTRY } from "./config";

interface AthleteScore {
  currentScore: number;
  baseScore: number;
}

const athleteScores: Record<number, AthleteScore> = {};

// Init from registry
for (const [id, info] of Object.entries(ATHLETE_REGISTRY)) {
  athleteScores[Number(id)] = { baseScore: info.baseScore, currentScore: 0 };
}

let startedAt = Date.now();

function tick() {
  for (const [, athlete] of Object.entries(athleteScores)) {
    const scale = athlete.baseScore / 50;
    const variance = Math.floor((Math.random() * 12 - 2) * scale);
    const bigPlay = Math.random() < 0.05 ? Math.floor(Math.random() * 20 * scale) : 0;
    const increment = Math.max(0, variance + bigPlay);
    athlete.currentScore += increment;
  }
}

// Start simulating immediately
tick();
setInterval(tick, 30_000);

export function getSimulatedScores(): Record<number, number> {
  const result: Record<number, number> = {};
  for (const [id, a] of Object.entries(athleteScores)) {
    result[Number(id)] = a.currentScore;
  }
  return result;
}

export function getSimulatedUpdatedAt(): string {
  return new Date().toISOString();
}
