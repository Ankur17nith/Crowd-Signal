import { AssetSymbol, ObservedMarketWindow } from "./normalize/types.js";
import { CrowdScoringEngine } from "./scoring/crowdScoring.js";
import { DivergenceScoringEngine, PredictorActiveCall } from "./scoring/divergence.js";
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

    // 1. Ingest observable markets from DreamDEX
    const liveMarkets = await this.ingestClient.fetchActiveMarkets();
    for (const m of liveMarkets) {
      this.store.markets.set(m.marketId, m);
    }

    const allMarkets: ObservedMarketWindow[] = Array.from(this.store.markets.values());
    const assets: AssetSymbol[] = ["BTC", "ETH", "SOL", "SOMI"];

    for (const asset of assets) {
      // 2. Compute Quantitative Market Signal (CS-PROB-2.0)
      const signal = this.scoringEngine.calculateSignal(asset, allMarkets, now);
      this.store.addSignalHistory(signal);

      // 3. Compute Crowd vs Predictor Divergence (CS-DIV-2.0)
      const activeCalls: PredictorActiveCall[] = Array.from(this.store.predictors.values()).map((p) => ({
        trader: p.address,
        direction: (asset === "BTC" ? "UP" : "DOWN") as "UP" | "DOWN",
        confidence: 0.52,
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
        `[CS-PROB-2.0] ${asset.padEnd(4)} | ` +
        `Latent: ${(signal.upProbability * 100).toFixed(1)}% [${(signal.uncertaintyLower * 100).toFixed(1)}% - ${(signal.uncertaintyUpper * 100).toFixed(1)}%] | ` +
        `Micro: ${(signal.microProbability * 100).toFixed(1)}% (${signal.micropriceAdjustment >= 0 ? "+" : ""}${(signal.micropriceAdjustment * 100).toFixed(1)}pp) | ` +
        `Entropy: ${signal.entropy.toFixed(3)} bits | ` +
        `InfoVel: ${signal.informationVelocity >= 0 ? "+" : ""}${signal.informationVelocity.toFixed(3)} bits/min | ` +
        `CP: ${(signal.changePointProbability * 100).toFixed(0)}% | ` +
        `Regime: ${signal.marketRegime} | ` +
        `N_eff: ${signal.effectiveParticipantCount} | ` +
        `Prov: ${signal.provenance.signalHash.slice(0, 10)}...`
      );

      // 4. Publish to on-chain oracle if configured
      await this.publisher.publishSignal(signal);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("=== CrowdSignal Quantitative Indexer Engine Started (CS-PROB-2.0) ===");
    console.log(`Target Network: Somnia Shannon Testnet (Chain ID: ${CONFIG.chainId})`);
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
