import { Router, Request, Response } from "express";
import { suiClient, PACKAGE_ID, ATHLETE_REGISTRY } from "../config";

const router = Router();

interface OnChainListing {
  listingId: string;
  seller: string;
  priceMist: string;
  tokenId: number;
  name: string;
  sport: string;
  position: string;
  rarity: number;
  baseScore: number;
  imageUrl: string;
}

interface Cache {
  data: { listings: OnChainListing[]; total: number; cachedAt: string } | null;
  timestamp: number;
}

const cache: Cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15_000;

router.get("/listings", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    // Query Listed events
    const listedEvents = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::marketplace::Listed` },
      limit: 100,
    });

    // Query Sold events
    const soldEvents = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::marketplace::Sold` },
      limit: 100,
    });

    // Query Delisted events
    const delistedEvents = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::marketplace::Delisted` },
      limit: 100,
    });

    // Collect sold/delisted listing IDs
    const inactiveIds = new Set<string>();
    for (const e of soldEvents.data) {
      const parsed = e.parsedJson as any;
      if (parsed?.listing_id) inactiveIds.add(parsed.listing_id);
    }
    for (const e of delistedEvents.data) {
      const parsed = e.parsedJson as any;
      if (parsed?.listing_id) inactiveIds.add(parsed.listing_id);
    }

    // Collect active listing IDs
    const activeIds: string[] = [];
    for (const e of listedEvents.data) {
      const parsed = e.parsedJson as any;
      const id = parsed?.listing_id;
      if (id && !inactiveIds.has(id)) {
        activeIds.push(id);
      }
    }

    if (activeIds.length === 0) {
      const result = { listings: [], total: 0, cachedAt: new Date().toISOString() };
      cache.data = result;
      cache.timestamp = now;
      return res.json(result);
    }

    // Deduplicate
    const uniqueIds = [...new Set(activeIds)];

    // Fetch listing objects in batches of 50
    const listings: OnChainListing[] = [];
    const batchSize = 50;
    for (let i = 0; i < uniqueIds.length; i += batchSize) {
      const batch = uniqueIds.slice(i, i + batchSize);
      const objects = await suiClient.multiGetObjects({
        ids: batch,
        options: { showContent: true },
      });

      for (const obj of objects) {
        if (!obj.data) continue;
        const fields = (obj.data?.content as any)?.fields;
        if (!fields) continue;

        const tokenId = parseInt(fields.nft?.fields?.token_id ?? fields.token_id ?? "0", 10);
        const athleteInfo = ATHLETE_REGISTRY[tokenId];

        listings.push({
          listingId: obj.data.objectId,
          seller: fields.seller ?? "",
          priceMist: fields.price_mist ?? fields.price ?? "0",
          tokenId,
          name: fields.nft?.fields?.name ?? fields.name ?? athleteInfo?.name ?? "Unknown",
          sport: fields.nft?.fields?.sport ?? fields.sport ?? athleteInfo?.sport ?? "Unknown",
          position: fields.nft?.fields?.position ?? fields.position ?? athleteInfo?.position ?? "Unknown",
          rarity: parseInt(fields.nft?.fields?.rarity ?? fields.rarity ?? "0", 10),
          baseScore: parseInt(fields.nft?.fields?.base_score ?? fields.base_score ?? "0", 10),
          imageUrl: athleteInfo?.imageUrl ?? "",
        });
      }
    }

    const result = {
      listings,
      total: listings.length,
      cachedAt: new Date().toISOString(),
    };
    cache.data = result;
    cache.timestamp = now;

    return res.json(result);
  } catch (err: any) {
    console.error("[listings] error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
