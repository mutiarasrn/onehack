import { NextResponse } from "next/server";
import { MOCK_ATHLETES } from "@/lib/athletes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const rarity = searchParams.get("rarity");

  let athletes = MOCK_ATHLETES;
  if (sport) athletes = athletes.filter((a) => a.sport === sport);
  if (rarity) athletes = athletes.filter((a) => a.rarity === Number(rarity));

  return NextResponse.json({ athletes, total: athletes.length });
}
