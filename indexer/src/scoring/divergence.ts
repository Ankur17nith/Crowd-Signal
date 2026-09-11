import { AssetSymbol, CrowdVsPredictorDivergence } from "../normalize/types.js";

export interface PredictorActiveCall {
  trader: `0x${string}`;
  direction: "UP" | "DOWN";
  confidence: number;
  predictorScore: number;
  isVerified: boolean;
}

/**
 * Divergence Scoring Engine (CS-DIV-2.0)
 * Evaluates directional consensus of calibrated predictors vs broad market crowd,
 * measuring divergence magnitude, persistence, and effective predictor count.
 */
export class DivergenceScoringEngine {
  private static divergenceHistory: Map<AssetSymbol, { divergenceBps: number; timestamp: number }[]> = new Map();

  public static calculateDivergence(
    asset: AssetSymbol,
    crowdUpProbabilityBps: number,
    activeCalls: PredictorActiveCall[],
    nowSeconds: number = Math.floor(Date.now() / 1000)
  ): CrowdVsPredictorDivergence {
    // Filter to verified or high-reputation predictors
    const qualified = activeCalls.filter((c) => c.isVerified || c.predictorScore >= 65);

    if (qualified.length === 0) {
      return {
        asset,
        crowdUpProbabilityBps,
        predictorConsensusBps: crowdUpProbabilityBps,
        divergenceBps: 0,
        divergencePercent: 0,
        interpretation: "Insufficient verified predictor positions active in this window.",
        topPredictorCount: 0,
        effectivePredictorCount: 0,
        persistenceScore: 0,
        timestamp: nowSeconds,
      };
    }

    // Weight by quadratic predictor score: w_i = (score_i / 100)^2
    let weightedUpSum = 0;
    let totalWeight = 0;
    const weights: number[] = [];

    for (const call of qualified) {
      const weight = Math.pow(call.predictorScore / 100, 2);
      const callProb = call.direction === "UP" ? call.confidence : 1 - call.confidence;
      weightedUpSum += callProb * weight;
      totalWeight += weight;
      weights.push(weight);
    }

    const consensusProb = totalWeight > 0 ? weightedUpSum / totalWeight : crowdUpProbabilityBps / 10000;
    const predictorConsensusBps = Math.round(consensusProb * 10000);

    const deltaBps = crowdUpProbabilityBps - predictorConsensusBps;
    const divergenceBps = Math.abs(deltaBps);
    const divergencePercent = Number((divergenceBps / 100).toFixed(1));

    // Calculate effective predictor count N_eff = 1 / sum(p_i^2) where p_i = w_i / totalWeight
    const normalizedWeights = totalWeight > 0 ? weights.map((w) => w / totalWeight) : [];
    const hhi = normalizedWeights.reduce((sum, p) => sum + p * p, 0);
    const effectivePredictorCount = hhi > 0 ? Number((1 / hhi).toFixed(1)) : qualified.length;

    // Track historical divergence persistence
    const hist = this.divergenceHistory.get(asset) || [];
    hist.push({ divergenceBps, timestamp: nowSeconds });
    if (hist.length > 50) hist.shift();
    this.divergenceHistory.set(asset, hist);

    // Persistence score measures whether divergence has persisted over recent evaluation cycles
    const recentConsistent = hist.filter((h) => Math.abs(h.divergenceBps) > 400).length;
    const persistenceScore = Math.min(100, Math.round((recentConsistent / Math.max(1, hist.length)) * 100));

    let interpretation = "High consensus: Crowd and verified predictors are aligned.";
    if (deltaBps >= 1000) {
      interpretation = `Crowd is significantly more bullish (+${divergencePercent}%) than historically accurate predictors.`;
    } else if (deltaBps <= -1000) {
      interpretation = `Crowd is significantly more bearish (-${divergencePercent}%) than historically accurate predictors.`;
    } else if (deltaBps > 400) {
      interpretation = `Mild bullish divergence (+${divergencePercent}%): Crowd moderately leads verified predictors.`;
    } else if (deltaBps < -400) {
      interpretation = `Mild bearish divergence (-${divergencePercent}%): Verified predictors are more bullish than the crowd.`;
    }

    return {
      asset,
      crowdUpProbabilityBps,
      predictorConsensusBps,
      divergenceBps,
      divergencePercent,
      interpretation,
      topPredictorCount: qualified.length,
      effectivePredictorCount,
      persistenceScore,
      timestamp: nowSeconds,
    };
  }
}
