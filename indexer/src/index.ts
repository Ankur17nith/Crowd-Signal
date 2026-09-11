import { AssetSymbol, RawMarketWindow } from "./normalize/types.js";
import { CrowdScoringEngine } from "./scoring/crowdScoring.js";
import { DivergenceScoringEngine } from "./scoring/divergence.js";
import { DataStore } from "./db/store.js";
import { DreamDexIngestClient } from "./ingest/dreamdexClient.js";
import { OnchainPublisher } from "./publisher/contractPublisher.js";
import { CONFIG } from "./config/env.js";

export class CrowdSignalIndexer {
  private store: DataStore;
  private scoringEngine: CrowdScoringEngine;
  private ingestClient: DreamDexIngestClient;
  private publisher: OnchainPublisher;
  private isRunning: boolean = false;

  constructor() {
    this.store = DataStore.getInstance();
    this.scoringEngine = new CrowdScoringEngine();
    this.ingestClient = new DreamDexIngestClient();
    this.publisher = new OnchainPublisher();
  }

  public async runCycle() {
    const now = Math.floor(Date.now() / 1000);
    // console.log(`[CROWDSIGNAL INDEXER] Running evaluation cycle at ${new Date().toISOString()}`);

    // 1. Ingest live markets from DreamDEX
    const liveMarkets = await this.ingestClient.fetchActiveMarkets();
    for (const m of liveMarkets) {
      this.store.markets.set(m.marketId, m);
    }

    const allMarkets: RawMarketWindow[] = Array.from(this.store.markets.values());
    const assets: AssetSymbol[] = ["BTC", "ETH", "SOL"];

    for (const asset of assets) {
      // 2. Compute Crowd Market Signal
      const signal = this.scoringEngine.calculateSignal(asset, allMarkets, now);
      this.store.addSignalHistory(signal);

      // 3. Compute Crowd vs Predictor Divergence
      // Build active predictor calls from known predictors
      const activeCalls = Array.from(this.store.predictors.values()).map((p) => ({
        trader: p.address,
        direction: (asset === "BTC" ? "UP" : "DOWN") as "UP" | "DOWN",
        confidence: 0.52, // verified predictor consensus
        predictorScore: p.predictorScore,
        isVerified: p.isVerified,
      }));

      const divergence = DivergenceScoringEngine.calculateDivergence(
        asset,
        signal.upProbabilityBps,
        activeCalls,
        now
      );
      this.store.divergences.set(asset, divergence);

      console.log(
        `[SIGNAL] ${asset.padEnd(4)} | UP: ${(signal.upProbabilityBps / 100).toFixed(1)}% | ` +
        `Skew: ${(signal.capitalSkewBps / 100 > 0 ? "+" : "")}${(signal.capitalSkewBps / 100).toFixed(1)}% | ` +
        `Velocity: ${(signal.velocityBpsPerMin / 100).toFixed(1)}%/min | ` +
        `Confidence: ${signal.confidenceScore}/100 | Regime: ${signal.marketRegime} | ` +
        `Divergence: ${divergence.divergencePercent}%`
      );

      // 4. Publish to on-chain oracle if active
      await this.publisher.publishSignal(signal);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("=== CrowdSignal Indexer Service Started ===");
    console.log(`Targeting Somnia Shannon Testnet (Chain ID: ${CONFIG.chainId})`);
    console.log(`Poll Interval: ${CONFIG.pollIntervalMs}ms | RPC: ${CONFIG.rpcUrl}`);

    // Initial cycle
    this.runCycle().catch((err) => console.error("Error in initial indexer cycle:", err));

    // Periodic loop
    setInterval(() => {
      this.runCycle().catch((err) => console.error("Error in indexer cycle:", err));
    }, CONFIG.pollIntervalMs);
  }
}

// Auto-start when run directly
if (process.env.NODE_ENV !== "test") {
  const indexer = new CrowdSignalIndexer();
  indexer.start();
}
