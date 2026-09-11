import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_MARKETS } from "@/fixtures/verifiedFixtures";
import { EventContractWindow, ActiveMarketsResponse } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();
  const db = getServerDb();
  let markets: EventContractWindow[] = [];

  if (db) {
    try {
      const rows = db.prepare(`
        SELECT m.*, l.best_bid, l.best_ask, l.midpoint, l.spread, l.relative_spread, l.bid_depth, l.ask_depth, l.queue_imbalance, l.microprice, l.open_interest, l.trade_count, l.trade_volume
        FROM markets m
        LEFT JOIN latest_market_state l ON m.market_id = l.market_id
        ORDER BY m.expiry ASC
      `).all();

      if (rows && rows.length > 0) {
        markets = rows.map((r: any): EventContractWindow => {
          const bestBid = r.best_bid !== null && r.best_bid !== undefined ? Number(r.best_bid) : undefined;
          const bestAsk = r.best_ask !== null && r.best_ask !== undefined ? Number(r.best_ask) : undefined;
          const mid = r.midpoint !== null && r.midpoint !== undefined && Number(r.midpoint) > 0
            ? Number(r.midpoint)
            : (bestBid !== undefined && bestAsk !== undefined ? (bestBid + bestAsk) / 2 : undefined);
          const upProb = mid !== undefined ? Number((mid * 100).toFixed(1)) : undefined;
          const downProb = upProb !== undefined ? Number((100 - upProb).toFixed(1)) : undefined;

          return {
            id: r.market_id,
            asset: r.asset as any,
            title: `${r.asset} ${Math.round(r.interval_sec / 60)} MIN EVENT`,
            interval: `${Math.round(r.interval_sec / 60)}m`,
            upProbability: upProb,
            downProbability: downProb,
            microPrice: r.microprice ? Number((r.microprice * 100).toFixed(1)) : upProb,
            spread: r.spread ? Number(r.spread.toFixed(4)) : (bestAsk && bestBid ? Number((bestAsk - bestBid).toFixed(4)) : 0),
            queueImbalance: r.queue_imbalance ? Number(r.queue_imbalance.toFixed(2)) : 0,
            openInterestUsd: r.open_interest ? Number(r.open_interest) : 0,
            volumeUsd: r.trade_volume ? Number(r.trade_volume) : 0,
            secondsRemaining: Math.max(0, r.expiry - Math.floor(Date.now() / 1000)),
            status: r.status as any,
            openPrice: 0,
            currentTouchBid: bestBid ?? 0,
            currentTouchAsk: bestAsk ?? 0,
            poolAddress: r.pool_address || "",
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

  const response: ActiveMarketsResponse =
    markets.length > 0
      ? {
          status: "live",
          markets,
          count: markets.length,
          elapsedMs: Date.now() - startTime,
        }
      : {
          status: "unavailable",
          markets: [],
          count: 0,
          message: "No active DreamDEX binary markets found matching trading criteria on Somnia Shannon.",
          elapsedMs: Date.now() - startTime,
        };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5",
    },
  });
}
