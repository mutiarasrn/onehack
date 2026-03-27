/**
 * Auto-resolver cron job.
 * Every 60s: checks all leagues — if end_time_ms has passed and status != FINISHED,
 * fetches leaderboard scores, then calls resolve_league on-chain to distribute prizes.
 */
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { bcs } from "@mysten/sui/bcs";
import { suiClient, PACKAGE_ID, ADMIN_CAP_ID, ADMIN_PRIVATE_KEY } from "./config";
import { getSimulatedScores } from "./scoreSimulator";
import { ATHLETE_REGISTRY, RARITY_MULTIPLIERS } from "./config";

const RESOLVE_INTERVAL_MS = 60_000;
const resolved = new Set<string>(); // in-memory dedup within process lifetime

function getKeypair(): Ed25519Keypair | null {
  if (!ADMIN_PRIVATE_KEY) {
    console.warn("[autoResolver] ADMIN_PRIVATE_KEY not set — resolver disabled");
    return null;
  }
  try {
    return Ed25519Keypair.fromSecretKey(
      Buffer.from(ADMIN_PRIVATE_KEY.replace("0x", ""), "hex")
    );
  } catch (e) {
    console.error("[autoResolver] Invalid ADMIN_PRIVATE_KEY:", (e as Error).message);
    return null;
  }
}

async function fetchAllLeagues(): Promise<Array<{ leagueId: string; endTimeMs: number; status: number; entrants: string[] }>> {
  try {
    const events = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::league_manager::LeagueCreated` },
      limit: 50,
    });

    const leagueIds: string[] = [];
    for (const e of events.data) {
      const parsed = e.parsedJson as any;
      const id = parsed?.league_id ?? parsed?.id;
      if (id) leagueIds.push(id);
    }

    if (leagueIds.length === 0) return [];

    const objects = await suiClient.multiGetObjects({
      ids: [...new Set(leagueIds)],
      options: { showContent: true },
    });

    const leagues = [];
    for (const obj of objects) {
      if (!obj.data) continue;
      const fields = (obj.data?.content as any)?.fields;
      if (!fields) continue;
      leagues.push({
        leagueId: obj.data.objectId,
        endTimeMs: parseInt(fields.end_time_ms ?? "0", 10),
        status: parseInt(fields.status ?? "0", 10),
        entrants: Array.isArray(fields.entrants) ? fields.entrants : [],
      });
    }
    return leagues;
  } catch (err) {
    console.error("[autoResolver] fetchAllLeagues error:", (err as Error).message);
    return [];
  }
}

async function getLeaderboardScores(leagueId: string, entrants: string[]): Promise<string[]> {
  // Fetch team scores via leaderboard route logic (reuse score data)
  // We query TeamSubmitted events to get tokenIds per address, then score them
  try {
    const events = await suiClient.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::fantasy_team::TeamSubmitted` },
      limit: 200,
    });

    const teamEntries: Array<{ address: string; teamId: string }> = [];
    const seenAddresses = new Set<string>();

    for (const e of events.data) {
      const parsed = e.parsedJson as any;
      const eventLeagueId = parsed?.league_id ?? parsed?.leagueId;
      if (eventLeagueId && eventLeagueId !== leagueId) continue;

      const teamOwner = parsed?.owner ?? parsed?.player ?? e.sender ?? "";
      const teamId = parsed?.team_id ?? parsed?.teamId ?? parsed?.id;

      if (teamOwner && !seenAddresses.has(teamOwner) && entrants.includes(teamOwner)) {
        seenAddresses.add(teamOwner);
        if (teamId) teamEntries.push({ address: teamOwner, teamId });
      }
    }

    if (teamEntries.length === 0) {
      // No team data — return entrants as-is (random order, still resolves)
      return entrants;
    }

    // Fetch team objects
    const teamIds = teamEntries.map((t) => t.teamId);
    const teamTokenMap = new Map<string, number[]>();

    const objects = await suiClient.multiGetObjects({
      ids: teamIds,
      options: { showContent: true },
    });

    for (const obj of objects) {
      if (!obj.data) continue;
      const fields = (obj.data?.content as any)?.fields;
      if (!fields) continue;
      const rawIds = fields.athlete_token_ids ?? fields.athlete_ids ?? fields.token_ids ?? fields.athletes ?? [];
      const tokenIds: number[] = Array.isArray(rawIds)
        ? rawIds.map((id: any) => parseInt(String(id), 10)).filter((n: number) => !isNaN(n))
        : [];
      teamTokenMap.set(obj.data.objectId, tokenIds);
    }

    // Get scores (chain or simulated)
    const scores = getSimulatedScores();

    // Score each entrant
    const scored = teamEntries.map((entry) => {
      const tokenIds = teamTokenMap.get(entry.teamId) ?? [];
      const total = tokenIds.reduce((sum, tokenId) => {
        const athleteScore = scores[tokenId] ?? ATHLETE_REGISTRY[tokenId]?.baseScore ?? 0;
        const rarity = ATHLETE_REGISTRY[tokenId]?.rarity ?? 0;
        const multiplier = RARITY_MULTIPLIERS[rarity] ?? 1.0;
        return sum + athleteScore * multiplier;
      }, 0);
      return { address: entry.address, total };
    });

    scored.sort((a, b) => b.total - a.total);
    return scored.map((s) => s.address);
  } catch (err) {
    console.error("[autoResolver] getLeaderboardScores error:", (err as Error).message);
    return entrants;
  }
}

async function resolveLeague(keypair: Ed25519Keypair, leagueId: string, rankedPlayers: string[]) {
  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::league_manager::resolve_league`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(leagueId),
        tx.pure(bcs.vector(bcs.Address).serialize(rankedPlayers)),
      ],
    });

    tx.setGasBudget(10_000_000);

    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });

    console.log(`[autoResolver] Resolved league ${leagueId} — tx: ${result.digest}`);
    console.log(`[autoResolver] Winners: ${rankedPlayers.slice(0, 3).join(", ")}`);
  } catch (err) {
    console.error(`[autoResolver] Failed to resolve league ${leagueId}:`, (err as Error).message);
  }
}

async function tick() {
  const keypair = getKeypair();
  if (!keypair) return;

  const leagues = await fetchAllLeagues();
  const now = Date.now();

  for (const league of leagues) {
    const { leagueId, endTimeMs, status, entrants } = league;

    // Skip if already finished or not ended yet
    if (status === 2) continue;
    if (endTimeMs === 0 || now < endTimeMs) continue;
    if (resolved.has(leagueId)) continue;
    if (entrants.length === 0) {
      resolved.add(leagueId);
      continue;
    }

    console.log(`[autoResolver] League ${leagueId} ended — resolving with ${entrants.length} entrants`);

    const rankedPlayers = await getLeaderboardScores(leagueId, entrants);
    await resolveLeague(keypair, leagueId, rankedPlayers);
    resolved.add(leagueId);
  }
}

export function startAutoResolver() {
  if (!ADMIN_PRIVATE_KEY) {
    console.warn("[autoResolver] ADMIN_PRIVATE_KEY not set — auto-resolve disabled");
    return;
  }
  console.log("[autoResolver] Started — checking every 60s");
  tick();
  setInterval(tick, RESOLVE_INTERVAL_MS);
}
