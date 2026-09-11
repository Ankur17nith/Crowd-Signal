import { CalculatedTraderReputation, EvaluatedPrediction, OutcomeDirection } from "../normalize/types.js";

export interface EvaluatedCallInput {
  predictionId: string;
  asset: "BTC" | "ETH" | "SOL" | "SOMI";
  marketId: string;
  direction: OutcomeDirection;
  predictorConfidence: number;   // 0.50 - 1.00 stated confidence
  marketProbabilityAtCall: number;// Market probability when prediction was made
  actualOutcome: OutcomeDirection;
  timestamp: number;
}

/**
 * Reputation Engine V2 (CS-REPUTATION-2.0)
 * Implements:
 * 1. Market-Relative Skill (Brier Skill Score vs Market Baseline)
 * 2. Murphy / Sanders 3-Component Brier Decomposition (Reliability, Resolution, Uncertainty)
 * 3. Beta-Binomial Bayesian Accuracy Shrinkage with 95% Credible Intervals
 * 4. Exponential Recency Weighting
 * 5. Wilson Score Interval Lower Bound Anti-Gaming Protection
 */
export class ReputationEngineV2 {
  private static readonly HALF_LIFE_DAYS = 30; // 30-day exponential half-life
  private static readonly LAMBDA = Math.LN2 / (ReputationEngineV2.HALF_LIFE_DAYS * 86400);

  /**
   * Wilson score lower bound on binomial proportion (95% confidence, z = 1.96)
   */
  public static calculateWilsonLowerBound(correct: number, total: number): number {
    if (total === 0) return 0;
    const z = 1.96;
    const z2 = z * z;
    const p = correct / total;
    const numerator = p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));
    const denominator = 1 + z2 / total;
    return Math.max(0, Math.min(1, numerator / denominator));
  }

  /**
   * Beta-Binomial Bayesian Posterior Shrinkage
   * Prior: Beta(alpha=2, beta=2) - weak prior centered at 50%
   */
  public static calculateBayesianShrinkage(correct: number, total: number): {
    posteriorMean: number;
    credibleLower: number;
    credibleUpper: number;
  } {
    const alpha0 = 2;
    const beta0 = 2;
    const alphaPost = alpha0 + correct;
    const betaPost = beta0 + (total - correct);

    const posteriorMean = alphaPost / (alphaPost + betaPost);
    // Normal approximation to Beta distribution for 95% credible interval
    const posteriorVariance = (alphaPost * betaPost) / (Math.pow(alphaPost + betaPost, 2) * (alphaPost + betaPost + 1));
    const posteriorStdDev = Math.sqrt(posteriorVariance);

    const credibleLower = Math.max(0, posteriorMean - 1.96 * posteriorStdDev);
    const credibleUpper = Math.min(1, posteriorMean + 1.96 * posteriorStdDev);

    return {
      posteriorMean: Number(posteriorMean.toFixed(4)),
      credibleLower: Number(credibleLower.toFixed(4)),
      credibleUpper: Number(credibleUpper.toFixed(4)),
    };
  }

  /**
   * Sanders / Murphy 3-Part Brier Decomposition:
   * Total Brier Score = Reliability - Resolution + Uncertainty
   */
  public static calculateBrierDecomposition(calls: EvaluatedPrediction[]): {
    meanBrier: number;
    reliability: number;
    resolution: number;
    uncertainty: number;
  } {
    if (calls.length === 0) {
      return { meanBrier: 0.25, reliability: 0, resolution: 0, uncertainty: 0.25 };
    }

    const n = calls.length;
    const baseWinCount = calls.filter((c) => c.isCorrect).length;
    const baseRate = baseWinCount / n; // \bar{o}
    const uncertainty = baseRate * (1 - baseRate);

    // Group calls into calibration bins (K = 5 bins)
    const bins = [
      { min: 0.5, max: 0.6, midpoint: 0.55, calls: [] as EvaluatedPrediction[] },
      { min: 0.6, max: 0.7, midpoint: 0.65, calls: [] as EvaluatedPrediction[] },
      { min: 0.7, max: 0.8, midpoint: 0.75, calls: [] as EvaluatedPrediction[] },
      { min: 0.8, max: 0.9, midpoint: 0.85, calls: [] as EvaluatedPrediction[] },
      { min: 0.9, max: 1.01, midpoint: 0.95, calls: [] as EvaluatedPrediction[] },
    ];

    let brierSum = 0;
    for (const call of calls) {
      brierSum += call.brierScore;
      for (const bin of bins) {
        if (call.predictorConfidence >= bin.min && call.predictorConfidence < bin.max) {
          bin.calls.push(call);
          break;
        }
      }
    }

    let reliability = 0;
    let resolution = 0;

    for (const bin of bins) {
      const nk = bin.calls.length;
      if (nk > 0) {
        const ok = bin.calls.filter((c) => c.isCorrect).length / nk;
        reliability += (nk / n) * Math.pow(bin.midpoint - ok, 2);
        resolution += (nk / n) * Math.pow(ok - baseRate, 2);
      }
    }

    const meanBrier = brierSum / n;

    return {
      meanBrier: Number(meanBrier.toFixed(4)),
      reliability: Number(reliability.toFixed(4)),
      resolution: Number(resolution.toFixed(4)),
      uncertainty: Number(uncertainty.toFixed(4)),
    };
  }

  /**
   * Evaluate full predictor profile
   */
  public static evaluatePredictor(
    address: `0x${string}`,
    totalPredictions: number,
    rawCalls: EvaluatedCallInput[],
    currentTimestamp: number = Math.floor(Date.now() / 1000)
  ): CalculatedTraderReputation {
    // 1. Evaluate individual predictions against market baselines
    const evaluatedCalls: EvaluatedPrediction[] = rawCalls.map((c) => {
      const isCorrect = c.direction === c.actualOutcome;
      const outcomeVal = isCorrect ? 1 : 0;
      const brierScore = Math.pow(c.predictorConfidence - outcomeVal, 2);
      
      // Market baseline brier score
      const marketProb = c.direction === "UP" ? c.marketProbabilityAtCall : 1 - c.marketProbabilityAtCall;
      const marketBrierScore = Math.pow(marketProb - outcomeVal, 2);
      
      const brierSkillScore = marketBrierScore > 0 ? 1 - brierScore / marketBrierScore : 0;

      return {
        predictionId: c.predictionId,
        asset: c.asset,
        marketId: c.marketId,
        direction: c.direction,
        predictorConfidence: c.predictorConfidence,
        marketProbabilityAtCall: c.marketProbabilityAtCall,
        actualOutcome: c.actualOutcome,
        isCorrect,
        brierScore,
        marketBrierScore,
        brierSkillScore,
        timestamp: c.timestamp,
      };
    });

    const resolved = evaluatedCalls.length;
    const correct = evaluatedCalls.filter((c) => c.isCorrect).length;
    const accuracy = resolved > 0 ? correct / resolved : 0;

    // 2. Bayesian Shrinkage & Credible Intervals
    const bayes = this.calculateBayesianShrinkage(correct, resolved);

    // 3. Wilson Score Lower Bound
    const wilsonLower = this.calculateWilsonLowerBound(correct, resolved);

    // 4. Brier Decomposition
    const decomp = this.calculateBrierDecomposition(evaluatedCalls);

    // 5. Market-Relative Skill Score
    const totalMarketSkill = evaluatedCalls.reduce((sum, c) => sum + c.brierSkillScore, 0);
    const marketRelativeSkill = resolved > 0 ? Number((totalMarketSkill / resolved).toFixed(4)) : 0;

    // 6. Recency Weighting & Skill Trend
    let weightedSkillSum = 0;
    let weightSum = 0;
    for (const call of evaluatedCalls) {
      const ageSeconds = Math.max(0, currentTimestamp - call.timestamp);
      const weight = Math.exp(-this.LAMBDA * ageSeconds);
      weightedSkillSum += call.brierSkillScore * weight;
      weightSum += weight;
    }
    const recencyWeightedSkill = weightSum > 0 ? Number((weightedSkillSum / weightSum).toFixed(4)) : marketRelativeSkill;

    let skillTrend: "IMPROVING" | "STABLE" | "DECLINING" = "STABLE";
    if (recencyWeightedSkill - marketRelativeSkill > 0.05) {
      skillTrend = "IMPROVING";
    } else if (marketRelativeSkill - recencyWeightedSkill > 0.05) {
      skillTrend = "DECLINING";
    }

    // 7. Streaks
    let currentStreak = 0;
    let maxStreak = 0;
    for (let i = evaluatedCalls.length - 1; i >= 0; i--) {
      if (evaluatedCalls[i].isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    let tempStreak = 0;
    for (const c of evaluatedCalls) {
      if (c.isCorrect) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // 8. Calibration Score (0 - 100)
    // Scaled from reliability error: reliability of 0 -> 100 score, 0.15 -> 0 score
    const calibrationScore = Math.round(Math.max(0, Math.min(100, (1 - decomp.reliability / 0.12) * 100)));

    // 9. Consistency Score (0 - 100)
    const consistencyScore = Math.round(Math.max(20, Math.min(100, (1 - decomp.meanBrier) * 100 + (maxStreak > 4 ? 10 : 0))));

    // 10. Composite Score (CS-REPUTATION-2.0)
    // 40% Wilson Lower Bound + 30% Market-Relative Skill + 20% Calibration + 10% Consistency
    const marketSkillFactor = Math.max(0, Math.min(100, (marketRelativeSkill + 0.3) * 100));
    const compositeScore = wilsonLower * 100 * 0.4 + marketSkillFactor * 0.3 + calibrationScore * 0.2 + consistencyScore * 0.1;
    const predictorScore = Math.round(Math.max(0, Math.min(100, compositeScore)));

    // Strict eligibility rule for Verified badge:
    // N >= 15 resolved, predictorScore >= 65, bayesian lower bound >= 0.50, and marketRelativeSkill > 0.02
    const isVerified = resolved >= 15 && predictorScore >= 65 && bayes.credibleLower >= 0.50 && marketRelativeSkill > 0.02;

    // Calibration Buckets for UI inspection
    const bucketDefs = [
      { min: 0.5, max: 0.6, label: "50-60%", expected: 0.55 },
      { min: 0.6, max: 0.7, label: "60-70%", expected: 0.65 },
      { min: 0.7, max: 0.8, label: "70-80%", expected: 0.75 },
      { min: 0.8, max: 0.9, label: "80-90%", expected: 0.85 },
      { min: 0.9, max: 1.01, label: "90-100%", expected: 0.95 },
    ];

    const calibrationBuckets = bucketDefs.map((b) => {
      const matching = evaluatedCalls.filter((c) => c.predictorConfidence >= b.min && c.predictorConfidence < b.max);
      const count = matching.length;
      const wins = matching.filter((c) => c.isCorrect).length;
      const actualWinRate = count > 0 ? Number((wins / count).toFixed(3)) : b.expected;
      return {
        confidenceRange: b.label,
        predictedCount: count,
        actualWinRate,
        expectedConfidence: b.expected,
      };
    });

    const lastActiveTimestamp = evaluatedCalls.length > 0 ? evaluatedCalls[evaluatedCalls.length - 1].timestamp : currentTimestamp;

    return {
      address,
      totalPredictions,
      resolvedPredictions: resolved,
      correctPredictions: correct,
      accuracy: Number(accuracy.toFixed(4)),
      accuracyBps: Math.round(accuracy * 10000),
      bayesianAccuracyMean: bayes.posteriorMean,
      credibleIntervalLower: bayes.credibleLower,
      credibleIntervalUpper: bayes.credibleUpper,
      meanBrierScore: decomp.meanBrier,
      marketRelativeSkill,
      reliability: decomp.reliability,
      resolution: decomp.resolution,
      uncertainty: decomp.uncertainty,
      wilsonLowerBound: Number(wilsonLower.toFixed(4)),
      calibrationScore,
      consistencyScore,
      predictorScore,
      recencyWeightedSkill,
      skillTrend,
      currentStreak,
      maxStreak,
      lastActiveTimestamp,
      isVerified,
      calibrationBuckets,
    };
  }
}
