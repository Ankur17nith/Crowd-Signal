import { AssetSymbol, CrowdVsPredictorDivergence } from "../normalize/types.js";

export interface PredictorActiveCall {
  trader: `0x${string}`;
  direction: "UP" | "DOWN";
  confidence: number;
  predictorScore: number;
  isVerified: boolean;
}

export class DivergenceScoringEngine {
  public static calculateDivergence(
    asset: AssetSymbol,
    crowdUpProbabilityBps: number,
    activeCalls: PredictorActiveCall[],
    nowSeconds: number = Math.floor(Date.now() / 1000)
  ): CrowdVsPredictorDivergence {
    // Filter to verified / high-score predictors
    const qualified = activeCalls.filter((c) => c.isVerified || c.predictorScore >= 65);

    if (qualified.length === 0) {
      // If no active verified predictors in this slice, consensus defaults to crowd probability
      return {
        asset,
        crowdUpProbabilityBps,
        predictorConsensusBps: crowdUpProbabilityBps,
        divergenceBps: 0,
        divergencePercent: 0,
        interpretation: "Insufficient verified predictor positions active in this window.",
        topPredictorCount: 0,
        timestamp: nowSeconds,
      };
    }

    // Weight by predictor score
    let weightedUpSum = 0;
    let totalWeight = 0;

    for (const call of qualified) {
      const weight = Math.pow(call.predictorScore / 100, 2); // quadratic weighting on skill
      const callProb = call.direction === "UP" ? call.confidence : 1 - call.confidence;
      weightedUpSum += callProb * weight;
      totalWeight += weight;
    }

    const consensusProb = totalWeight > 0 ? weightedUpSum / totalWeight : crowdUpProbabilityBps / 10000;
    const predictorConsensusBps = Math.round(consensusProb * 10000);

    const deltaBps = crowdUpProbabilityBps - predictorConsensusBps;
    const divergenceBps = Math.abs(deltaBps);
    const divergencePercent = Number((divergenceBps / 100).toFixed(1));

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
      timestamp: nowSeconds,
    };
  }
}
