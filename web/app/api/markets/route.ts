import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_MARKETS } from "@/fixtures/verifiedFixtures";
import { EventContractWindow } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();
  const db = getServerDb();
  let markets: EventContractWindow[] = [];

  if (db) {
    try {
      const rows = db.prepare(`
        SELECT m.*, s.best_bid, s.best_ask, s.midpoint, s.spread, s.queue_imbalance, s.microprice, s.open_interest, s.trade_volume
        FROM markets m
        LEFT JOIN (
          SELECT ms1.* FROM market_snapshots ms1
          INNER JOIN (
            SELECT market_id, MAX(timestamp) as max_ts FROM market_snapshots GROUP BY market_id
          ) ms2 ON ms1.market_id = ms2.market_id AND ms1.timestamp = ms2.max_ts
        ) s ON m.market_id = s.market_id
        ORDER BY m.expiry ASC
      `).all();

      if (rows && rows.length > 0) {
        markets = rows.map((r: any): EventContractWindow => {
          const mid = r.midpoint ?? 0.5;
          const upProb = Number((mid * 100).toFixed(1));
          return {
            id: r.market_id,
            asset: r.asset as any,
            title: `${r.asset} ${Math.round(r.interval_sec / 60)} MIN EVENT`,
            interval: `${Math.round(r.interval_sec / 60)}m`,
            upProbability: upProb,
            downProbability: Number((100 - upProb).toFixed(1)),
            microPrice: r.microprice ? Number((r.microprice * 100).toFixed(1)) : upProb,
            spread: r.spread ? Number(r.spread.toFixed(4)) : 0.01,
            queueImbalance: r.queue_imbalance ? Number(r.queue_imbalance.toFixed(2)) : 0,
            openInterestUsd: r.open_interest ? Number(r.open_interest) : 0,
            volumeUsd: r.trade_volume ? Number(r.trade_volume) : 0,
            secondsRemaining: Math.max(0, r.expiry - Math.floor(Date.now() / 1000)),
            status: r.status as any,
            openPrice: 0,
            currentTouchBid: r.best_bid ?? 0.49,
            currentTouchAsk: r.best_ask ?? 0.51,
            poolAddress: r.pool_address || "0x3ecC694Cef705358864a646142ac17A90E29e388",
          };
        });
      }
    } catch (err) {
      console.error("[api/markets] DB query error:", err);
    }
  }

  if (markets.length === 0 && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    markets = FIXTURE_MARKETS;
  }

  return NextResponse.json(
    {
      markets,
      count: markets.length,
      status: markets.length > 0 ? "LIVE" : "Awaiting active DreamDEX markets",
      elapsedMs: Date.now() - startTime,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5",
      },
    }
  );
}
