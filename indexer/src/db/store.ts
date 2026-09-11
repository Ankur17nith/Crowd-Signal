import {
  AssetSymbol,
  CalculatedMarketSignal,
  CalculatedTraderReputation,
  CrowdVsPredictorDivergence,
  ObservedMarketWindow,
} from "../normalize/types.js";
import { EvaluatedCallInput } from "../scoring/reputation.js";
import { DatabaseManager } from "./database.js";

/**
 * Persistent Data Store for CrowdSignal Indexer
 * Connects directly to SQLite DatabaseManager. Uses in-memory structures strictly as an L1 read cache.
 * Fully restart-safe and idempotent.
 */
export class DataStore {
  private static instance: DataStore;
  private db: DatabaseManager;

  public markets: Map<string, ObservedMarketWindow> = new Map();
  public signals: Map<AssetSymbol, CalculatedMarketSignal> = new Map();
  public divergences: Map<AssetSymbol, CrowdVsPredictorDivergence> = new Map();
  public predictors: Map<`0x${string}`, CalculatedTraderReputation> = new Map();
  public predictorHistory: Map<`0x${string}`, EvaluatedCallInput[]> = new Map();
  public signalHistory: Map<AssetSymbol, CalculatedMarketSignal[]> = new Map();

  private constructor() {
    this.db = DatabaseManager.getInstance();
    this.hydrateFromDb();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  /**
   * Hydrate in-memory L1 cache from durable SQLite state on boot
   */
  private hydrateFromDb() {
    try {
      const activeMarkets = this.db.getActiveMarkets();
      for (const m of activeMarkets) {
        this.markets.set(m.market_id, {
          marketId: m.market_id,
          asset: m.asset as AssetSymbol,
          symbol: m.symbol,
          intervalSec: m.interval_sec,
          bestBid: m.best_bid,
          bestAsk: m.best_ask,
          lastPrice: m.midpoint ?? 0.5,
          bidDepth: m.bid_depth,
          askDepth: m.ask_depth,
          cumulativeQuoteVolume: m.trade_volume ?? 0,
          tradeCount: m.trade_count ?? 0,
          status: m.status,
          expiry: m.expiry,
          timestamp: m.updated_at,
        });
      }

      const assets: AssetSymbol[] = ["BTC", "ETH", "SOL", "SOMI"];
      for (const asset of assets) {
        const row = this.db.getLatestSignal(asset);
        if (row) {
          const sig: CalculatedMarketSignal = {
            asset: row.asset as AssetSymbol,
            upProbability: row.latent_probability,
            upProbabilityBps: Math.round(row.latent_probability * 10000),
            downProbability: 1 - row.latent_probability,
            downProbabilityBps: Math.round((1 - row.latent_probability) * 10000),
            uncertaintyLower: row.uncertainty_lower,
            uncertaintyUpper: row.uncertainty_upper,
            uncertaintyWidth: row.uncertainty_upper - row.uncertainty_lower,
            midProbability: row.mid_probability ?? row.latent_probability,
            microProbability: row.micro_probability ?? row.latent_probability,
            micropriceAdjustment: (row.micro_probability ?? row.latent_probability) - (row.mid_probability ?? row.latent_probability),
            spread: 0.01,
            relativeSpread: 0.015,
            queueImbalance: 0,
            entropy: row.entropy,
            informationVelocity: row.information_velocity,
            changePointProbability: row.changepoint_probability,
            marketRegime: row.market_regime as any,
            effectiveParticipantCount: row.effective_participants,
            concentrationHhi: row.concentration_hhi,
            signalIndependence: 1 - Math.min(1, row.concentration_hhi * 10),
            openInterestUsd: row.open_interest ?? 0,
            capitalSkew: row.capital_skew,
            velocity: row.information_velocity,
            acceleration: 0,
            sampleSize: 10,
            windowCount: 1,
            provenance: {
              algorithmVersion: row.algorithm_version,
              inputSnapshotHash: row.input_snapshot_hash,
              signalHash: row.provenance_hash,
              timestamp: row.timestamp,
            },
          };
          this.signals.set(asset, sig);
        }
      }
    } catch (e) {
      // In tests or initial boot, table may be populated during run
    }
  }

  public upsertMarket(market: ObservedMarketWindow) {
    this.markets.set(market.marketId, market);
    this.db.upsertMarket({
      market_id: market.marketId,
      asset: market.asset,
      symbol: market.symbol,
      interval_sec: market.intervalSec,
      status: market.status,
      expiry: market.expiry,
      pool_address: null,
      collateral_address: null,
      created_at_block: null,
      created_at_timestamp: market.timestamp,
      updated_at: market.timestamp,
    });

    this.db.insertSnapshot({
      market_id: market.marketId,
      timestamp: market.timestamp,
      best_bid: market.bestBid,
      best_ask: market.bestAsk,
      midpoint: market.lastPrice,
      spread: market.bestAsk && market.bestBid ? market.bestAsk - market.bestBid : null,
      bid_depth: market.bidDepth,
      ask_depth: market.askDepth,
      trade_count: market.tradeCount,
      trade_volume: market.cumulativeQuoteVolume,
      open_interest: market.openInterestUsd ?? null,
    });
  }

  public addSignalHistory(signal: CalculatedMarketSignal) {
    const list = this.signalHistory.get(signal.asset) || [];
    list.push(signal);
    if (list.length > 300) list.shift();
    this.signalHistory.set(signal.asset, list);
    this.signals.set(signal.asset, signal);

    // Persist to SQLite
    this.db.insertCrowdSignal({
      asset: signal.asset,
      timestamp: signal.provenance.timestamp,
      block_number: null,
      latent_probability: signal.upProbability,
      uncertainty_lower: signal.uncertaintyLower,
      uncertainty_upper: signal.uncertaintyUpper,
      mid_probability: signal.midProbability,
      micro_probability: signal.microProbability,
      entropy: signal.entropy,
      information_velocity: signal.informationVelocity,
      changepoint_probability: signal.changePointProbability,
      market_regime: signal.marketRegime,
      effective_participants: signal.effectiveParticipantCount,
      concentration_hhi: signal.concentrationHhi,
      open_interest: signal.openInterestUsd > 0 ? signal.openInterestUsd : null,
      capital_skew: signal.capitalSkew,
      provenance_hash: signal.provenance.signalHash,
      algorithm_version: signal.provenance.algorithmVersion,
      input_snapshot_hash: signal.provenance.inputSnapshotHash,
    });
  }

  public recordDivergence(divergence: CrowdVsPredictorDivergence) {
    this.divergences.set(divergence.asset, divergence);
    this.db.insertDivergence({
      asset: divergence.asset,
      timestamp: divergence.timestamp,
      crowd_up_probability: divergence.crowdUpProbability,
      top_predictor_consensus: divergence.topPredictorConsensus,
      divergence_percent: divergence.divergencePercent,
      effective_predictor_count: divergence.effectivePredictorCount,
      persistence_score: divergence.persistenceScore,
      interpretation: divergence.interpretation,
    });
  }

  public recordPrediction(call: EvaluatedCallInput) {
    const traderKey = call.predictionId.split("_")[0] as `0x${string}`;
    const list = this.predictorHistory.get(traderKey) || [];
    list.push(call);
    this.predictorHistory.set(traderKey, list);
  }

  public getDatabaseManager(): DatabaseManager {
    return this.db;
  }

  public clear() {
    this.markets.clear();
    this.signals.clear();
    this.divergences.clear();
    this.predictors.clear();
    this.predictorHistory.clear();
    this.signalHistory.clear();
  }
}

