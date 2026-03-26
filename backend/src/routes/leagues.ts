import { Router, Request, Response } from "express";
import { suiClient, PACKAGE_ID } from "../config";

const router = Router();

interface OnChainLeague {
  leagueId: string;
  name: string;
  sport: string;
  entryFee: string;
  maxEntrants: number;
  startTimeMs: string;
  endTimeMs: string;
  status: number;
  entrants: string[];
  prizePool: string;
  prizeSplits: number[];
  winners: string[];
}

interface ListCache {
  data: { leagues: OnChainLeague[]; total: number } | null;
  timestamp: number;
}

const listCache: ListCache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 30_000;

function parseLeagueObject(obj: any): OnChainLeague | null {
  if (!obj?.data) return null;
  const fields = (obj.data?.content as any)?.fields;
  if (!fields) return null;

  return {
    leagueId: obj.data.objectId,
    name: fields.name ?? "",
    sport: fields.sport ?? "",
    entryFee: fields.entry_fee ?? "0",
    maxEntrants: parseInt(fields.max_entrants ?? "0", 10),
    startTimeMs: fields.start_time_ms ?? "0",
    endTimeMs: fields.end_time_ms ?? "0",
    status: parseInt(fields.status ?? "0", 10),
    entrants: Array.isArray(fields.entrants) ? fields.entrants : [],
    prizePool: fields.prize_pool?.fields?.value ?? fields.prize_pool ?? "0",
    prizeSplits: Array.isArray(fields.prize_splits) ? fields.prize_splits.map(Number) : [],
    winners: Array.isArray(fields.winners) ? fields.winners : [],
  };
}

// GET /api/leagues
router.get("/leagues", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (listCache.data && now - listCache.timestamp < CACHE_TTL_MS) {
      return res.json(listCache.data);
    }

    // Query LeagueCreated events
    const events = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::league_manager::LeagueCreated` },
      limit: 50,
    });

    // Extract league object IDs from events
    const leagueIds: string[] = [];
    for (const e of events.data) {
      const parsed = e.parsedJson as any;
      const id = parsed?.league_id ?? parsed?.id;
      if (id) leagueIds.push(id);
    }

    if (leagueIds.length === 0) {
      const result = { leagues: [], total: 0 };
      listCache.data = result;
      listCache.timestamp = now;
      return res.json(result);
    }

    const uniqueIds = [...new Set(leagueIds)];

    // Fetch league objects
    const objects = await suiClient.multiGetObjects({
      ids: uniqueIds,
      options: { showContent: true },
    });

    const leagues: OnChainLeague[] = [];
    for (const obj of objects) {
      const league = parseLeagueObject(obj);
      if (league) leagues.push(league);
    }

    const result = { leagues, total: leagues.length };
    listCache.data = result;
    listCache.timestamp = now;

    return res.json(result);
  } catch (err: any) {
    console.error("[leagues] list error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/leagues/:id
router.get("/leagues/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "League ID is required" });
    }

    const obj = await suiClient.getObject({
      id,
      options: { showContent: true },
    });

    if (!obj.data) {
      return res.status(404).json({ error: "League not found" });
    }

    const league = parseLeagueObject(obj);
    if (!league) {
      return res.status(404).json({ error: "Could not parse league object" });
    }

    return res.json(league);
  } catch (err: any) {
    console.error("[leagues] get error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
