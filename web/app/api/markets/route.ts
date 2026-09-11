import { NextResponse } from "next/server";
import { INITIAL_MARKETS } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    markets: INITIAL_MARKETS,
    count: INITIAL_MARKETS.length,
    timestamp: Math.floor(Date.now() / 1000),
  });
}
