import { Router, Request, Response } from "express";
import { suiClient, PACKAGE_ID, SCORE_BOARD_ID, ATHLETE_REGISTRY, RARITY_MULTIPLIERS } from "../config";
import { getSimulatedScores } from "../scoreSimulator";

const router = Router();

interface LeaderboardEntry {
  rank: number;
  address: string;
  tokenIds: number[];
  totalScore: number;
}

interface Cache {
  data: { leaderboard: LeaderboardEntry[]; leagueId: string } | null;
  timestamp: number;
}

const cacheMap = new Map<string, Cache>();
const CACHE_TTL_MS = 30_000;

async function getScores(): Promise<Record<number, number>> {
  const scores: Record<number, number> = {};
  try {
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: SCORE_BOARD_ID,
    });

    const fetches = dynamicFields.data.map(async (field) => {
      try {
        const fieldObj = await suiClient.getDynamicFieldObject({
          parentId: SCORE_BOARD_ID,
          name: field.name,
        });
        const fieldData = (fieldObj.data?.content as any)?.fields;
        if (!fieldData) return;

        const tokenId =
          typeof field.name.value === "string"
            ? parseInt(field.name.value, 10)
            : typeof field.name.value === "number"
            ? field.name.value
            : parseInt(String(field.name.value), 10);

        const rawScore = parseInt(fieldData.value ?? fieldData.score ?? "0", 10);
        const score = rawScore / 100;

        if (!isNaN(tokenId) && tokenId > 0) {
          scores[tokenId] = score;
        }
      } catch {
        // Skip
      }
    });

    await Promise.all(fetches);
  } catch (err) {
    console.error("[leaderboard] getScores error:", err);
  }

  // Fallback to in-memory simulated scores if chain has nothing
  const hasChainScores = Object.values(scores).some((s) => s > 0);
  if (!hasChainScores) {
    return getSimulatedScores();
  }
  return scores;
}

function calcTeamScore(tokenIds: number[], scores: Record<number, number>): number {
  return tokenIds.reduce((total, tokenId) => {
    const athleteScore = scores[tokenId] ?? ATHLETE_REGISTRY[tokenId]?.baseScore ?? 0;
    const rarity = ATHLETE_REGISTRY[tokenId]?.rarity ?? 0;
    const multiplier = RARITY_MULTIPLIERS[rarity] ?? 1.0;
    return total + athleteScore * multiplier;
  }, 0);
}

// GET /api/leaderboard/:leagueId
router.get("/leaderboard/:leagueId", async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    if (!leagueId) {
      return res.status(400).json({ error: "leagueId is required" });
    }

    const now = Date.now();
    const cached = cacheMap.get(leagueId);
    if (cached?.data && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    // Query TeamSubmitted events for this league
    const events = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::fantasy_team::TeamSubmitted` },
      limit: 200,
    });

    // Filter by leagueId and collect team object IDs
    const teamEntries: Array<{ address: string; teamId: string }> = [];
    const seenAddresses = new Set<string>();

    for (const e of events.data) {
      const parsed = e.parsedJson as any;
      // Filter by league
      const eventLeagueId = parsed?.league_id ?? parsed?.leagueId;
      if (eventLeagueId && eventLeagueId !== leagueId) continue;

      const teamOwner = parsed?.owner ?? parsed?.player ?? e.sender ?? "";
      const teamId = parsed?.team_id ?? parsed?.teamId ?? parsed?.id;

      // Only keep the most recent team per address (events are chronological)
      if (teamOwner && !seenAddresses.has(teamOwner)) {
        seenAddresses.add(teamOwner);
        if (teamId) {
          teamEntries.push({ address: teamOwner, teamId });
        }
      }
    }

    // Fetch team objects to get token IDs
    const teamIds = teamEntries.map((t) => t.teamId).filter(Boolean);
    const teamTokenMap = new Map<string, number[]>(); // teamId -> tokenIds

    if (teamIds.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < teamIds.length; i += batchSize) {
        const batch = teamIds.slice(i, i + batchSize);
        const objects = await suiClient.multiGetObjects({
          ids: batch,
          options: { showContent: true },
        });

        for (const obj of objects) {
          if (!obj.data) continue;
          const fields = (obj.data?.content as any)?.fields;
          if (!fields) continue;

          const tokenIds: number[] = [];
          const rawTokenIds =
            fields.athlete_token_ids ??
            fields.athlete_ids ??
            fields.token_ids ??
            fields.athletes ??
            [];
          if (Array.isArray(rawTokenIds)) {
            for (const id of rawTokenIds) {
              const parsed = parseInt(String(id), 10);
              if (!isNaN(parsed)) tokenIds.push(parsed);
            }
          }
          teamTokenMap.set(obj.data.objectId, tokenIds);
        }
      }
    }

    // Get current scores
    const scores = await getScores();

    // Build leaderboard entries
    const rawEntries: Array<{ address: string; tokenIds: number[]; totalScore: number }> = [];

    for (const entry of teamEntries) {
      const tokenIds = teamTokenMap.get(entry.teamId) ?? [];
      const totalScore = calcTeamScore(tokenIds, scores);
      rawEntries.push({ address: entry.address, tokenIds, totalScore });
    }

    // Sort descending by totalScore
    rawEntries.sort((a, b) => b.totalScore - a.totalScore);

    const leaderboard: LeaderboardEntry[] = rawEntries.map((e, idx) => ({
      rank: idx + 1,
      address: e.address,
      tokenIds: e.tokenIds,
      totalScore: Math.round(e.totalScore * 100) / 100,
    }));

    const result = { leaderboard, leagueId };
    cacheMap.set(leagueId, { data: result, timestamp: now });

    return res.json(result);
  } catch (err: any) {
    console.error("[leaderboard] error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
