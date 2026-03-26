import { Router, Request, Response } from "express";
import { suiClient, SCORE_BOARD_ID } from "../config";

const router = Router();

interface Cache {
  data: { scores: Record<number, number>; updatedAt: string } | null;
  timestamp: number;
}

const cache: Cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 10_000;

router.get("/scores", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    // Get all dynamic fields for the score board
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: SCORE_BOARD_ID,
    });

    const scores: Record<number, number> = {};

    // Fetch each dynamic field object to get the score value
    const fieldFetches = dynamicFields.data.map(async (field) => {
      try {
        const fieldObj = await suiClient.getDynamicFieldObject({
          parentId: SCORE_BOARD_ID,
          name: field.name,
        });

        const fieldData = (fieldObj.data?.content as any)?.fields;
        if (!fieldData) return;

        // The key is the token_id (athlete ID)
        const tokenId =
          typeof field.name.value === "string"
            ? parseInt(field.name.value, 10)
            : typeof field.name.value === "number"
            ? field.name.value
            : parseInt(String(field.name.value), 10);

        // Score is stored scaled by 100, un-scale it
        const rawScore =
          parseInt(fieldData.value ?? fieldData.score ?? "0", 10);
        const score = rawScore / 100;

        if (!isNaN(tokenId) && tokenId > 0) {
          scores[tokenId] = score;
        }
      } catch (fieldErr) {
        // Skip fields that fail to fetch
      }
    });

    await Promise.all(fieldFetches);

    const result = {
      scores,
      updatedAt: new Date().toISOString(),
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
