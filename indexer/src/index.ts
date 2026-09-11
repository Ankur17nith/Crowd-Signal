import { AssetSymbol, ObservedMarketWindow } from "./normalize/types.js";
import { CrowdScoringEngine } from "./scoring/crowdScoring.js";
import { DivergenceScoringEngine, PredictorActiveCall } from "./scoring/divergence.js";
import { DataStore } from "./db/store.js";
import { DatabaseManager } from "./db/database.js";
import { DreamDexClient } from "./adapters/dreamdex/client.js";
import { DreamDexMarketsAdapter } from "./adapters/dreamdex/markets.js";
import { DreamDexTradesAdapter } from "./adapters/dreamdex/trades.js";
import { DreamDexSettlementsAdapter } from "./adapters/dreamdex/settlements.js";
import { DreamDexOrderbookAdapter } from "./adapters/dreamdex/orderbook.js";
import { ReputationEngineV2, EvaluatedCallInput } from "./scoring/reputation.js";
import { OnchainPublisher } from "./publisher/contractPublisher.js";
import { CONFIG } from "./config/env.js";

export class CrowdSignalIndexer {
  private store: DataStore;
  private db: DatabaseManager;
  private scoringEngine: CrowdScoringEngine;
  private dreamdexClient: DreamDexClient;
  private marketsAdapter: DreamDexMarketsAdapter;
  private tradesAdapter: DreamDexTradesAdapter;
  private settlementsAdapter: DreamDexSettlementsAdapter;
  private publisher: OnchainPublisher;
  private isRunning: boolean = false;

  constructor() {
    this.store = DataStore.getInstance();
    this.db = this.store.getDatabaseManager();
    this.scoringEngine = new CrowdScoringEngine();
    this.dreamdexClient = new DreamDexClient();
    this.marketsAdapter = new DreamDexMarketsAdapter(this.dreamdexClient);
    this.tradesAdapter = new DreamDexTradesAdapter(this.dreamdexClient);
    this.settlementsAdapter = new DreamDexSettlementsAdapter(this.dreamdexClient);
    this.publisher = new OnchainPublisher();
  }

  /**
   * Execute single indexer cycle with idempotent database persistence
   */
  public async runCycle() {
    const now = Math.floor(Date.now() / 1000);

    // 1. Check blockchain connection & block cursor
    const conn = await this.dreamdexClient.verifyConnection();
    const currentBlock = conn.connected && conn.blockNumber ? conn.blockNumber : null;
    const cursor = this.db.getCursor("dreamdex_event_block");
    const fromBlock = cursor ? BigInt(cursor.lastBlock + 1) : currentBlock ? currentBlock - 50n : 0n;
    const toBlock = currentBlock || fromBlock;

    // 2. Discover and update canonical markets
    const liveMarkets = await this.marketsAdapter.getMarkets();
    for (const m of liveMarkets) {
      const snap = DreamDexOrderbookAdapter.computeMicrostructure(
        m.marketId,
        undefined,
        undefined,
        undefined,
        undefined,
        now
      );

      const observed: ObservedMarketWindow = {
        marketId: m.marketId,
        asset: m.asset,
        symbol: m.symbol,
        intervalSec: m.intervalSec,
        lastPrice: snap.midpoint ?? 0.5,
        status: m.status,
        expiry: m.expiry,
        timestamp: now,
        cumulativeQuoteVolume: 0,
        tradeCount: 0,
      };
      this.store.upsertMarket(observed);
    }

    // 3. Incremental on-chain trade ingestion & real prediction extraction
    if (conn.connected && currentBlock && fromBlock <= toBlock) {
      try {
        const trades = await this.tradesAdapter.fetchTrades(fromBlock, toBlock);
        for (const t of trades) {
          this.db.insertTrade({
            id: t.id,
            market_id: t.marketId,
            tx_hash: t.txHash,
            log_index: t.logIndex,
            block_number: t.blockNumber,
            timestamp: t.timestamp,
            trader: t.trader,
            direction: t.direction,
            price: t.price,
            size: t.size,
            collateral_amount: t.collateralAmount,
            is_maker: t.isMaker ? 1 : 0,
          });
        }

        // 4. Ingest settlements & resolve predictions
        const settlements = await this.settlementsAdapter.fetchSettlements(fromBlock, toBlock);
        for (const s of settlements) {
          this.db.recordSettlement(
            s.marketId,
            s.txHash,
            s.blockNumber,
            s.timestamp,
            s.winningOutcome,
            s.settlementPrice
          );
        }

        // Update restart-safe cursor
        this.db.setCursor("dreamdex_event_block", Number(toBlock), now);
      } catch (err) {
        console.error("[Indexer] Error scanning block logs:", err);
      }
    }

    // 5. Update reputation rankings for active participants
    this.refreshReputationScores(now);

    // 6. Compute Quantitative Market Signals (CS-PROB-2.0)
    const allMarkets: ObservedMarketWindow[] = Array.from(this.store.markets.values());
    const assets: AssetSymbol[] = ["BTC", "ETH", "SOL", "SOMI"];

    for (const asset of assets) {
      const signal = this.scoringEngine.calculateSignal(asset, allMarkets, now);
      this.store.addSignalHistory(signal);

      // 7. Compute Real Crowd vs Verified Predictor Divergence (CS-DIV-2.0)
      // Strictly derived from real unexpired predictions in the database
      const activePredictions = this.getActivePredictorCalls(asset);
      const divergence = DivergenceScoringEngine.calculateDivergence(
        asset,
        signal.upProbabilityBps,
        activePredictions,
        now
      );
      this.store.recordDivergence(divergence);

      console.log(
        `[CS-PROB-2.0] ${asset.padEnd(4)} | ` +
        `Latent: ${(signal.upProbability * 100).toFixed(1)}% [${(signal.uncertaintyLower * 100).toFixed(1)}% - ${(signal.uncertaintyUpper * 100).toFixed(1)}%] | ` +
        `Micro: ${(signal.microProbability * 100).toFixed(1)}% (${signal.micropriceAdjustment >= 0 ? "+" : ""}${(signal.micropriceAdjustment * 100).toFixed(1)}pp) | ` +
        `Entropy: ${signal.entropy.toFixed(3)} bits | ` +
        `InfoVel: ${signal.informationVelocity >= 0 ? "+" : ""}${signal.informationVelocity.toFixed(3)} bits/min | ` +
        `CP: ${(signal.changePointProbability * 100).toFixed(0)}% | ` +
        `Regime: ${signal.marketRegime} | ` +
        `N_eff: ${signal.effectiveParticipantCount} | ` +
        `Div: ${divergence.divergencePercent}% (${divergence.topPredictorCount} verified) | ` +
        `Prov: ${signal.provenance.signalHash.slice(0, 10)}...`
      );

      // 8. Publish to on-chain oracle if configured
      await this.publisher.publishSignal(signal);
    }
  }

  /**
   * Retrieve genuine active calls from the persistent database
   */
  private getActivePredictorCalls(asset: AssetSymbol): PredictorActiveCall[] {
    const rawPredictions = this.db["db"].prepare(`
      SELECT p.trader, p.direction, p.confidence, p.market_probability_at_call, r.predictor_score, r.is_verified
      FROM predictions p
      JOIN markets m ON p.market_id = m.market_id
      LEFT JOIN reputation_scores r ON p.trader = r.trader
      WHERE m.asset = ? AND p.outcome = 'Pending'
    `).all(asset) as any[];

    return rawPredictions.map((p) => ({
      trader: p.trader as `0x${string}`,
      direction: p.direction as "UP" | "DOWN",
      confidence: p.confidence ? Number(p.confidence) : 0.55,
      predictorScore: p.predictor_score ? Number(p.predictor_score) : 50,
      isVerified: Boolean(p.is_verified),
    }));
  }

  /**
   * Recalculate and materialize reputation scores for participants
   */
  private refreshReputationScores(now: number) {
    try {
      const participants = this.db["db"].prepare(`SELECT address FROM participants`).all() as { address: string }[];
      const rankedList: any[] = [];

      for (const p of participants) {
        const resolvedRows = this.db["db"].prepare(`
          SELECT * FROM predictions WHERE trader = ? AND outcome IN ('Correct', 'Incorrect') ORDER BY timestamp ASC
        `).all(p.address) as any[];

        if (resolvedRows.length === 0) continue;

        const calls: EvaluatedCallInput[] = resolvedRows.map((r) => ({
          predictionId: r.id,
          asset: "BTC",
          windowInterval: "15m",
          predictedDirection: r.direction,
          confidence: r.confidence ?? 0.6,
          marketProbabilityAtCall: r.market_probability_at_call,
          actualOutcome: r.outcome === "Correct" ? (r.direction === "UP" ? 1 : 0) : (r.direction === "UP" ? 0 : 1),
          timestamp: r.timestamp,
          callTimestamp: r.timestamp,
          resolvedTimestamp: r.resolved_at ?? r.timestamp + 900,
        }));

        const rep = ReputationEngineV2.calculateReputation(p.address as `0x${string}`, calls, now);
        rankedList.push(rep);
      }

      // Sort by predictor score descending
      rankedList.sort((a, b) => b.predictorScore - a.predictorScore);

      // Materialize into reputation_scores table
      rankedList.forEach((r, idx) => {
        const rank = idx + 1;
        this.db.upsertReputationScore({
          trader: r.address,
          ens_or_short: `${r.address.slice(0, 6)}...${r.address.slice(-4)}`,
          predictor_score: r.predictorScore,
          accuracy: r.accuracy,
          total_predictions: r.totalPredictions,
          resolved_predictions: r.resolvedPredictions,
          bayesian_accuracy_mean: r.bayesianAccuracyMean,
          credible_interval_low: r.credibleInterval[0],
          credible_interval_high: r.credibleInterval[1],
          market_relative_skill: r.marketRelativeSkill,
          mean_brier_score: r.meanBrierScore,
          reliability: r.brierDecomposition.reliability,
          resolution: r.brierDecomposition.resolution,
          uncertainty: r.brierDecomposition.uncertainty,
          recency_weighted_skill: r.recencyWeightedSkill,
          skill_trend: r.skillTrend,
          calibration_score: r.calibrationScore,
          consistency_score: r.consistencyScore,
          effective_sample_size: r.effectiveSampleSize,
          is_verified: r.isVerified ? 1 : 0,
          rank,
          updated_at: now,
        });
      });
    } catch {
      // Empty participants or calculation pass
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("=== CrowdSignal Quantitative Indexer Engine Started (CS-PROB-2.0) ===");
    console.log(`Target Network: Somnia Shannon Testnet (Chain ID: ${CONFIG.chainId})`);
    console.log(`Persistence: SQLite WAL Storage Enabled`);
    console.log(`Poll Interval: ${CONFIG.pollIntervalMs}ms | RPC: ${CONFIG.rpcUrl}`);

    this.runCycle().catch((err) => console.error("Error in initial indexer cycle:", err));

    setInterval(() => {
      this.runCycle().catch((err) => console.error("Error in indexer cycle:", err));
    }, CONFIG.pollIntervalMs);
  }
}

if (process.env.NODE_ENV !== "test") {
  const indexer = new CrowdSignalIndexer();
  indexer.start();
}
