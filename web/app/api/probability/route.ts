import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_SIGNALS } from "@/fixtures/verifiedFixtures";
import { MarketSignal, MarketSignalResponse } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;
  const asset = (searchParams.get("asset") || "BTC").toUpperCase();

  const db = getServerDb();
  let signal: MarketSignal | null = null;

  if (db) {
    try {
      const row = db.prepare(`
        SELECT * FROM crowd_signals WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
      `).get(asset);

      if (row && row.market_regime !== "UNAVAILABLE" && row.latent_probability > 0) {
        const uncertaintyWidth = row.uncertainty_upper - row.uncertainty_lower;
        const confidenceVal = uncertaintyWidth < 0.99
          ? Math.max(0, Math.min(100, Math.round((1 - uncertaintyWidth) * 100)))
          : 0;

        signal = {
          asset: row.asset as any,
          symbol: `${row.asset} / USDso`,
          midProbability: row.mid_probability ? Number((row.mid_probability * 100).toFixed(1)) : Number((row.latent_probability * 100).toFixed(1)),
          microProbability: row.micro_probability ? Number((row.micro_probability * 100).toFixed(1)) : Number((row.latent_probability * 100).toFixed(1)),
          micropriceAdjustment: Number((((row.micro_probability || row.latent_probability) - (row.mid_probability || row.latent_probability)) * 100).toFixed(1)),
          spread: 0.01,
          relativeSpread: 0.015,
          queueImbalance: 0,
          upProbability: Number((row.latent_probability * 100).toFixed(1)),
          downProbability: Number(((1 - row.latent_probability) * 100).toFixed(1)),
          uncertaintyInterval: [
            Number((row.uncertainty_lower * 100).toFixed(1)),
            Number((row.uncertainty_upper * 100).toFixed(1)),
          ],
          uncertaintyWidth: Number(((row.uncertainty_upper - row.uncertainty_lower) * 100).toFixed(1)),
          entropy: Number(row.entropy.toFixed(3)),
          informationVelocity: Number(row.information_velocity.toFixed(3)),
          changePointProbability: Number(row.changepoint_probability.toFixed(2)),
          openInterestUsd: row.open_interest ? Number(row.open_interest) : 0,
          capitalSkew: Number(row.capital_skew.toFixed(1)),
          effectiveParticipants: Number(row.effective_participants.toFixed(1)),
          concentrationHhi: Number(row.concentration_hhi.toFixed(3)),
          signalIndependence: Number((1 - Math.min(1, row.concentration_hhi * 10)).toFixed(2)),
          change24h: 0,
          velocityPerMin: Number(row.information_velocity.toFixed(2)),
          confidence: confidenceVal,
          marketRegime: row.market_regime as any,
          activeWindowCount: 1,
          totalVolumeUsd: 0,
          lastUpdatedSecondsAgo: Math.max(0, Math.floor(Date.now() / 1000) - Number(row.timestamp)),
          provenance: {
            algorithmVersion: row.algorithm_version,
            inputSnapshotHash: row.input_snapshot_hash,
            signalHash: row.provenance_hash,
            timestamp: Number(row.timestamp),
          },
        };
      }
    } catch (err) {
      console.error("[api/probability] DB query error:", err);
    }
  }

  // Fallback strictly in DEMO_MODE or return honest awaiting state
  if (!signal) {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      const demoData = FIXTURE_SIGNALS[asset] || FIXTURE_SIGNALS.BTC;
      const response: MarketSignalResponse = {
        status: "live",
        data: demoData,
        freshnessSeconds: 0,
        elapsedMs: Date.now() - startTime,
        source: "FIXTURE_DEMO",
      };
      return NextResponse.json(response, {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5" },
      });
    }

    const response: MarketSignalResponse = {
      status: "unavailable",
      asset,
      message: "No live trade executions or orderbook observations recorded on Somnia Shannon for this asset yet.",
      elapsedMs: Date.now() - startTime,
      source: "INDEXER_AWAITING",
    };
    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5" },
    });
  }

  const response: MarketSignalResponse = {
    status: signal.lastUpdatedSecondsAgo > 45 ? "delayed" : "live",
    data: signal,
    freshnessSeconds: signal.lastUpdatedSecondsAgo,
    elapsedMs: Date.now() - startTime,
    source: "SQLITE_WAL",
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5" },
  });
}
