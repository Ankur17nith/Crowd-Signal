import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_SIGNALS, FIXTURE_MARKETS, FIXTURE_DIVERGENCE } from "@/fixtures/verifiedFixtures";
import {
  ActiveMarketsResponse,
  DivergenceResponse,
  EventContractWindow,
  MarketSignal,
  MarketSignalResponse,
  OverviewAggregateResponse,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;
  const asset = (searchParams.get("asset") || "BTC").toUpperCase();

  const db = getServerDb();

  let signalResponse: MarketSignalResponse;
  let divergenceResponse: DivergenceResponse;
  let marketsResponse: ActiveMarketsResponse;

  if (db) {
    try {
      // 1. Fetch signal
      const signalRow = db.prepare(`
        SELECT * FROM crowd_signals WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
      `).get(asset);

      if (signalRow && signalRow.market_regime !== "UNAVAILABLE" && signalRow.latent_probability > 0) {
        const uncertaintyWidth = signalRow.uncertainty_upper - signalRow.uncertainty_lower;
        const confidenceVal = uncertaintyWidth < 0.99
          ? Math.max(0, Math.min(100, Math.round((1 - uncertaintyWidth) * 100)))
          : 0;

        const signalData: MarketSignal = {
          asset: signalRow.asset as any,
          symbol: `${signalRow.asset} / USDso`,
          midProbability: signalRow.mid_probability ? Number((signalRow.mid_probability * 100).toFixed(1)) : Number((signalRow.latent_probability * 100).toFixed(1)),
          microProbability: signalRow.micro_probability ? Number((signalRow.micro_probability * 100).toFixed(1)) : Number((signalRow.latent_probability * 100).toFixed(1)),
          micropriceAdjustment: Number((((signalRow.micro_probability || signalRow.latent_probability) - (signalRow.mid_probability || signalRow.latent_probability)) * 100).toFixed(1)),
          spread: 0.01,
          relativeSpread: 0.015,
          queueImbalance: 0,
          upProbability: Number((signalRow.latent_probability * 100).toFixed(1)),
          downProbability: Number(((1 - signalRow.latent_probability) * 100).toFixed(1)),
          uncertaintyInterval: [
            Number((signalRow.uncertainty_lower * 100).toFixed(1)),
            Number((signalRow.uncertainty_upper * 100).toFixed(1)),
          ],
          uncertaintyWidth: Number(((signalRow.uncertainty_upper - signalRow.uncertainty_lower) * 100).toFixed(1)),
          entropy: Number(signalRow.entropy.toFixed(3)),
          informationVelocity: Number(signalRow.information_velocity.toFixed(3)),
          changePointProbability: Number(signalRow.changepoint_probability.toFixed(2)),
          openInterestUsd: signalRow.open_interest ? Number(signalRow.open_interest) : 0,
          capitalSkew: Number(signalRow.capital_skew.toFixed(1)),
          effectiveParticipants: Number(signalRow.effective_participants.toFixed(1)),
          concentrationHhi: Number(signalRow.concentration_hhi.toFixed(3)),
          signalIndependence: Number((1 - Math.min(1, signalRow.concentration_hhi * 10)).toFixed(2)),
          change24h: 0,
          velocityPerMin: Number(signalRow.information_velocity.toFixed(2)),
          confidence: confidenceVal,
          marketRegime: signalRow.market_regime as any,
          activeWindowCount: 1,
          totalVolumeUsd: 0,
          lastUpdatedSecondsAgo: Math.max(0, Math.floor(Date.now() / 1000) - Number(signalRow.timestamp)),
          provenance: {
            algorithmVersion: signalRow.algorithm_version,
            inputSnapshotHash: signalRow.input_snapshot_hash,
            signalHash: signalRow.provenance_hash,
            timestamp: Number(signalRow.timestamp),
          },
        };

        signalResponse = {
          status: signalData.lastUpdatedSecondsAgo > 45 ? "delayed" : "live",
          data: signalData,
          freshnessSeconds: signalData.lastUpdatedSecondsAgo,
          elapsedMs: Date.now() - startTime,
          source: "SQLITE_WAL",
        };
      } else if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        signalResponse = {
          status: "live",
          data: FIXTURE_SIGNALS[asset] || FIXTURE_SIGNALS.BTC,
          freshnessSeconds: 0,
          elapsedMs: Date.now() - startTime,
          source: "FIXTURE_DEMO",
        };
      } else {
        signalResponse = {
          status: "unavailable",
          asset,
          message: `Awaiting active orderbook quotes on Somnia Shannon for ${asset}.`,
          elapsedMs: Date.now() - startTime,
        };
      }

      // 2. Fetch divergence
      const divRow = db.prepare(`
        SELECT * FROM divergence_observations WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
      `).get(asset);

      if (divRow && Number(divRow.effective_predictor_count) > 0 && divRow.top_predictor_consensus !== null) {
        divergenceResponse = {
          status: "live",
          data: {
            asset: divRow.asset as any,
            crowdUpProbability: Number(divRow.crowd_up_probability),
            topPredictorConsensus: Number(divRow.top_predictor_consensus),
            divergencePercent: divRow.divergence_percent ? Number(divRow.divergence_percent) : 0,
            effectivePredictorCount: Number(divRow.effective_predictor_count),
            persistenceScore: Number(divRow.persistence_score),
            interpretation: divRow.interpretation,
            topPredictorCount: Math.round(divRow.effective_predictor_count),
          },
          elapsedMs: Date.now() - startTime,
        };
      } else if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        divergenceResponse = {
          status: "live",
          data: FIXTURE_DIVERGENCE,
          elapsedMs: Date.now() - startTime,
        };
      } else {
        divergenceResponse = {
          status: "unavailable",
          asset,
          message: "No verified predictor positions active for this asset in the current evaluation window.",
          elapsedMs: Date.now() - startTime,
        };
      }

      // 3. Fetch active markets
      const marketRows = db.prepare(`
        SELECT m.*, l.best_bid, l.best_ask, l.midpoint, l.spread, l.relative_spread, l.bid_depth, l.ask_depth, l.queue_imbalance, l.microprice, l.open_interest, l.trade_count, l.trade_volume
        FROM markets m
        LEFT JOIN latest_market_state l ON m.market_id = l.market_id
        ORDER BY m.expiry ASC
      `).all();

      let marketList: EventContractWindow[] = [];
      if (marketRows && marketRows.length > 0) {
        marketList = marketRows.map((r: any): EventContractWindow => {
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
      } else if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        marketList = FIXTURE_MARKETS;
      }

      marketsResponse =
        marketList.length > 0
          ? {
              status: "live",
              markets: marketList,
              count: marketList.length,
              elapsedMs: Date.now() - startTime,
            }
          : {
              status: "unavailable",
              markets: [],
              count: 0,
              message: "No active DreamDEX binary markets found on Somnia Shannon.",
              elapsedMs: Date.now() - startTime,
            };
    } catch (err: any) {
      console.error("[api/overview] Error:", err);
      signalResponse = {
        status: "error",
        asset,
        error: err.message || "Internal database error",
        elapsedMs: Date.now() - startTime,
      };
      divergenceResponse = {
        status: "error",
        asset,
        error: err.message || "Internal database error",
        elapsedMs: Date.now() - startTime,
      };
      marketsResponse = {
        status: "error",
        markets: [],
        count: 0,
        error: err.message || "Internal database error",
        elapsedMs: Date.now() - startTime,
      };
    }
  } else {
    // DB not connected
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      signalResponse = {
        status: "live",
        data: FIXTURE_SIGNALS[asset] || FIXTURE_SIGNALS.BTC,
        freshnessSeconds: 0,
        elapsedMs: Date.now() - startTime,
        source: "FIXTURE_DEMO",
      };
      divergenceResponse = {
        status: "live",
        data: FIXTURE_DIVERGENCE,
        elapsedMs: Date.now() - startTime,
      };
      marketsResponse = {
        status: "live",
        markets: FIXTURE_MARKETS,
        count: FIXTURE_MARKETS.length,
        elapsedMs: Date.now() - startTime,
      };
    } else {
      signalResponse = {
        status: "unavailable",
        asset,
        message: "Database connection unavailable.",
        elapsedMs: Date.now() - startTime,
      };
      divergenceResponse = {
        status: "unavailable",
        asset,
        message: "Database connection unavailable.",
        elapsedMs: Date.now() - startTime,
      };
      marketsResponse = {
        status: "unavailable",
        markets: [],
        count: 0,
        message: "Database connection unavailable.",
        elapsedMs: Date.now() - startTime,
      };
    }
  }

  const aggregate: OverviewAggregateResponse = {
    signal: signalResponse,
    divergence: divergenceResponse,
    markets: marketsResponse,
    elapsedMs: Date.now() - startTime,
  };

  return NextResponse.json(aggregate, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5",
    },
  });
}
