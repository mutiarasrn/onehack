import { NextResponse } from "next/server";

// Mock score data — simulates oracle pushing scores on-chain
// In production, this reads from PointsOracle contract via viem

let scores: Record<number, number> = {
  // NBA
  10: 62, 21: 55, 32: 44, 43: 46, 50: 45,
  63: 58, 70: 48, 83: 54, 93: 60, 101: 38,
  113: 65, 120: 60, 131: 36,
  // SOCCER
  143: 22, 150: 20, 161: 17, 172: 14, 181: 16, 190: 12, 202: 13,
};

// Simulate gradual score increments (like a live game)
let lastUpdate = Date.now();

export async function GET() {
  const now = Date.now();
  const elapsed = now - lastUpdate;

  // Add incremental points every ~30s
  if (elapsed > 30000) {
    const tokenIds = Object.keys(scores).map(Number);
    for (const id of tokenIds) {
      scores[id] += Math.floor(Math.random() * 8);
    }
    lastUpdate = now;
  }

  return NextResponse.json({
    scores,
    updatedAt: new Date().toISOString(),
    contestId: 1,
  });
}
