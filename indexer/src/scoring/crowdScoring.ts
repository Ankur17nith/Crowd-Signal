import { encodeAbiParameters, keccak256, parseAbiParameters, toHex } from "viem";
import { AssetSymbol, CalculatedMarketSignal, ObservedMarketWindow } from "../normalize/types.js";
import { MicrostructureEngine } from "../analytics/microstructure/microstructure.js";
import { LatentProbabilityFilter } from "../analytics/probability/latentProbability.js";
import { InformationTheoryEngine } from "../analytics/information/informationTheory.js";
import { ChangepointEngine } from "../analytics/changepoint/changepoint.js";
import { ConcentrationEngine } from "../analytics/concentration/concentration.js";

/**
 * Crowd Scoring Engine (CS-PROB-2.0)
 * Orchestrates market microstructure, latent probability filtering, Shannon entropy,
 * online change-point detection, and participant concentration into an authoritative quantitative signal.
 */
export class CrowdScoringEngine {
  public static readonly ALGORITHM_VERSION = "CS-PROB-2.0";

  private latentFilters: Map<AssetSymbol, LatentProbabilityFilter> = new Map();
  private infoEngines: Map<AssetSymbol, InformationTheoryEngine> = new Map();
  private changepointEngines: Map<AssetSymbol, ChangepointEngine> = new Map();

  constructor() {
    const assets: AssetSymbol[] = ["BTC", "ETH", "SOL", "SOMI"];
    for (const a of assets) {
      this.latentFilters.set(a, new LatentProbabilityFilter(0.5));
      this.infoEngines.set(a, new InformationTheoryEngine());
      this.changepointEngines.set(a, new ChangepointEngine());
    }
  }

  public calculateSignal(
    asset: AssetSymbol,
    windows: ObservedMarketWindow[],
    nowSeconds: number = Math.floor(Date.now() / 1000)
  ): CalculatedMarketSignal {
    const assetKey = keccak256(toHex(asset));

    // 1. Filter active windows for this asset (strictly timestamp-causal)
    const active = windows.filter(
      (w) =>
        w.asset === asset &&
        (w.status === "Trading" || w.status === "Listed") &&
        w.expiry > nowSeconds &&
        (w.timestamp === undefined || w.timestamp <= nowSeconds)
    );

    // Initial state if no active markets are available
    if (active.length === 0) {
      const defaultFilter = this.latentFilters.get(asset) || new LatentProbabilityFilter(0.5);
      const latentState = defaultFilter.update(0.5, 0.05, 0, nowSeconds);
      const infoEngine = this.infoEngines.get(asset) || new InformationTheoryEngine();
      const info = infoEngine.update(0.5, nowSeconds);

      const nullHash = keccak256(toHex(`CS-PROB-2.0_${asset}_EMPTY_${nowSeconds}`));

      return {
        asset,
        assetKey,
        midProbability: 0.5,
        microProbability: 0.5,
        micropriceAdjustment: 0,
        spread: 0.02,
        relativeSpread: 0.04,
        queueImbalance: 0,
        upProbability: 0.5,
        upProbabilityBps: 5000,
        downProbabilityBps: 5000,
        uncertaintyLower: 0.45,
        uncertaintyUpper: 0.55,
        uncertaintyWidthBps: 1000,
        entropy: 1.0,
        informationVelocity: 0,
        changePointProbability: 0.05,
        capitalSkew: 0,
        capitalSkewBps: 0,
        effectiveParticipantCount: 0,
        concentrationHhi: 0,
        signalIndependenceScore: 0.5,
        confidenceScore: 0,
        velocityBpsPerMin: 0,
        accelerationBpsPerMin2: 0,
        openInterestUsd: 0,
        totalVolumeUsd: 0,
        activeWindowCount: 0,
        marketRegime: "STABLE",
        provenance: {
          algorithmVersion: CrowdScoringEngine.ALGORITHM_VERSION,
          inputSnapshotHash: nullHash,
          signalHash: nullHash,
          timestamp: nowSeconds,
        },
        timestamp: nowSeconds,
      };
    }

    // 2. Microstructure Analysis
    const micro = MicrostructureEngine.aggregateMicrostructure(active);

    // 3. Latent Probability Filtering in Logit Space
    let filter = this.latentFilters.get(asset);
    if (!filter) {
      filter = new LatentProbabilityFilter(micro.microPrice);
      this.latentFilters.set(asset, filter);
    }
    const totalVolume = active.reduce((sum, w) => sum + (w.cumulativeQuoteVolume || 0), 0);
    const latent = filter.update(micro.microPrice, micro.relativeSpread, totalVolume, nowSeconds);

    const upProb = latent.latentProbability;
    const upProbabilityBps = Math.round(upProb * 10000);
    const downProbabilityBps = 10000 - upProbabilityBps;
    const uncertaintyWidthBps = Math.round(latent.uncertaintyWidth * 10000);

    // 4. Information Theory & Shannon Entropy
    let infoEngine = this.infoEngines.get(asset);
    if (!infoEngine) {
      infoEngine = new InformationTheoryEngine();
      this.infoEngines.set(asset, infoEngine);
    }
    const info = infoEngine.update(upProb, nowSeconds);

    // 5. Change-Point Detection & Market Regime
    let cpEngine = this.changepointEngines.get(asset);
    if (!cpEngine) {
      cpEngine = new ChangepointEngine();
      this.changepointEngines.set(asset, cpEngine);
    }
    const cp = cpEngine.update(upProb, latent.velocityBpsPerMin, info.entropy, micro.relativeSpread);

    // 6. Capital Skew & Concentration
    let totalOiUp = 0;
    let totalOiDown = 0;
    let totalOi = 0;
    let totalTrades = 0;

    for (const w of active) {
      if (w.openInterestUp !== undefined && w.openInterestDown !== undefined) {
        totalOiUp += w.openInterestUp;
        totalOiDown += w.openInterestDown;
      }
      totalOi += w.openInterestUsd ?? 0;
      totalTrades += w.tradeCount || 0;
    }

    const rawSkew = totalOiUp + totalOiDown > 0 ? (totalOiUp - totalOiDown) / (totalOiUp + totalOiDown) : 0;
    const clampedSkew = Math.max(-1, Math.min(1, rawSkew));
    const capitalSkewBps = Math.round(clampedSkew * 10000);

    const concentration = ConcentrationEngine.estimateFromAggregates(totalTrades, totalVolume);

    // 7. Composite Market Confidence Score (0 - 100)
    // 30% Spread Tightness + 25% Liquidity/Volume + 20% Signal Independence + 15% Latent Certainty + 10% Window Breadth
    const spreadScore = Math.min(30, Math.max(0, Math.round((1 - micro.relativeSpread / 0.1) * 30)));
    const volumeScore = Math.min(25, Math.round(Math.log10(totalVolume + 1) * 5));
    const independenceScore = Math.round(concentration.signalIndependenceScore * 20);
    const certaintyScore = Math.min(15, Math.max(0, Math.round((1 - latent.uncertaintyWidth / 0.15) * 15)));
    const windowScore = Math.min(10, active.length * 3);

    const confidenceScore = Math.max(10, Math.min(100, spreadScore + volumeScore + independenceScore + certaintyScore + windowScore));

    // 8. Cryptographic Provenance Commitment
    const snapshotData = active.map((w) => `${w.marketId}:${w.bestBid}:${w.bestAsk}:${w.tradeCount}`).join("|");
    const inputSnapshotHash = keccak256(toHex(snapshotData));

    // Deterministic signal output hash
    const signalHash = keccak256(
      encodeAbiParameters(
        parseAbiParameters("bytes32, uint16, int16, uint16, int16, uint64"),
        [
          assetKey,
          upProbabilityBps,
          capitalSkewBps,
          confidenceScore,
          latent.velocityBpsPerMin,
          BigInt(nowSeconds),
        ]
      )
    );

    return {
      asset,
      assetKey,
      midProbability: micro.midPrice,
      microProbability: micro.microPrice,
      micropriceAdjustment: micro.micropriceAdjustment,
      spread: micro.spread,
      relativeSpread: micro.relativeSpread,
      queueImbalance: micro.queueImbalance,
      upProbability: upProb,
      upProbabilityBps,
      downProbabilityBps,
      uncertaintyLower: latent.uncertaintyLower,
      uncertaintyUpper: latent.uncertaintyUpper,
      uncertaintyWidthBps,
      entropy: info.entropy,
      informationVelocity: info.informationVelocity,
      changePointProbability: cp.changePointProbability,
      capitalSkew: Number(clampedSkew.toFixed(4)),
      capitalSkewBps,
      effectiveParticipantCount: concentration.effectiveParticipantCount,
      concentrationHhi: concentration.hhi,
      signalIndependenceScore: concentration.signalIndependenceScore,
      confidenceScore,
      velocityBpsPerMin: latent.velocityBpsPerMin,
      accelerationBpsPerMin2: latent.accelerationBpsPerMin2,
      openInterestUsd: Math.round(totalOi),
      totalVolumeUsd: Math.round(totalVolume),
      activeWindowCount: active.length,
      marketRegime: cp.marketRegime,
      provenance: {
        algorithmVersion: CrowdScoringEngine.ALGORITHM_VERSION,
        inputSnapshotHash,
        signalHash,
        timestamp: nowSeconds,
      },
      timestamp: nowSeconds,
    };
  }
}
