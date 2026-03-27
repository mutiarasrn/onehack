import { Router, Request, Response } from "express";
import { suiClient, SCORE_BOARD_ID } from "../config";
import { getSimulatedScores, getSimulatedUpdatedAt } from "../scoreSimulator";

const router = Router();

interface Cache {
  data: { scores: Record<number, number>; updatedAt: string; source: string } | null;
  timestamp: number;
}

const cache: Cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 10_000;

async function getChainScores(): Promise<Record<number, number>> {
  const scores: Record<number, number> = {};
  const dynamicFields = await suiClient.getDynamicFields({ parentId: SCORE_BOARD_ID });

  const fieldFetches = dynamicFields.data.map(async (field) => {
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

  await Promise.all(fieldFetches);
  return scores;
}

router.get("/scores", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    let scores: Record<number, number> = {};
    let source = "chain";

    try {
      scores = await getChainScores();
    } catch (err) {
      console.warn("[scores] chain fetch failed, using simulated scores:", (err as Error).message);
    }

    // Fallback: if chain has no scores, use in-memory simulator
    const hasChainScores = Object.values(scores).some((s) => s > 0);
    if (!hasChainScores) {
      scores = getSimulatedScores();
      source = "simulated";
    }

    const result = {
      scores,
      updatedAt: getSimulatedUpdatedAt(),
      source,
    };
    cache.data = result;
    cache.timestamp = now;

    return res.json(result);
  } catch (err: any) {
    console.error("[scores] error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
