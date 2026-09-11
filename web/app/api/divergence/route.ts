import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_DIVERGENCE } from "@/fixtures/verifiedFixtures";
import { DivergenceData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;
  const asset = (searchParams.get("asset") || "BTC").toUpperCase();

  const db = getServerDb();
  let divergence: DivergenceData | null = null;

  if (db) {
    try {
      const row = db.prepare(`
        SELECT * FROM divergence_observations WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
      `).get(asset);

      if (row) {
        divergence = {
          asset: row.asset as any,
          crowdUpProbability: Number(row.crowd_up_probability),
          topPredictorConsensus: row.top_predictor_consensus ? Number(row.top_predictor_consensus) : Number(row.crowd_up_probability),
          divergencePercent: row.divergence_percent ? Number(row.divergence_percent) : 0,
          effectivePredictorCount: Number(row.effective_predictor_count),
          persistenceScore: Number(row.persistence_score),
          interpretation: row.interpretation,
          topPredictorCount: Math.round(row.effective_predictor_count),
        };
      }
    } catch (err) {
      console.error("[api/divergence] DB query error:", err);
    }
  }

  if (!divergence) {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      divergence = FIXTURE_DIVERGENCE;
    } else {
      return NextResponse.json(
        {
          asset,
          status: "Awaiting verified predictor observations",
          divergencePercent: 0,
          persistenceScore: 0,
          interpretation: "No verified predictor positions active for this asset in the current evaluation window.",
          elapsedMs: Date.now() - startTime,
        },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5" },
        }
      );
    }
  }

  return NextResponse.json(
    {
      ...divergence,
      elapsedMs: Date.now() - startTime,
    },
    {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5" },
    }
  );
}
