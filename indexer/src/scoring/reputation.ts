import { CalculatedTraderReputation } from "../normalize/types.js";

export interface TraderResolvedCall {
  predictionId: string;
  asset: string;
  direction: "UP" | "DOWN";
  confidence: number; // 0.50 - 1.00
  actualOutcome: "UP" | "DOWN";
  isCorrect: boolean;
  timestamp: number;
}

export class ReputationScoringEngine {
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
   * Brier score calibration (0 - 100)
   */
  public static calculateCalibration(calls: TraderResolvedCall[]): {
    calibrationScore: number;
    buckets: CalculatedTraderReputation["calibrationBuckets"];
  } {
    if (calls.length === 0) {
      return { calibrationScore: 50, buckets: [] };
    }

    // Bucket definitions: 50-60%, 60-70%, 70-80%, 80-90%, 90-100%
    const bucketDefs = [
      { min: 0.5, max: 0.6, label: "50-60%", expected: 0.55 },
      { min: 0.6, max: 0.7, label: "60-70%", expected: 0.65 },
      { min: 0.7, max: 0.8, label: "70-80%", expected: 0.75 },
      { min: 0.8, max: 0.9, label: "80-90%", expected: 0.85 },
      { min: 0.9, max: 1.01, label: "90-100%", expected: 0.95 },
    ];

    const bucketData = bucketDefs.map((b) => ({
      ...b,
      calls: [] as TraderResolvedCall[],
    }));

    let brierSum = 0;
    for (const call of calls) {
      const outcome = call.isCorrect ? 1 : 0;
      brierSum += Math.pow(call.confidence - outcome, 2);

      for (const b of bucketData) {
        if (call.confidence >= b.min && call.confidence < b.max) {
          b.calls.push(call);
          break;
        }
      }
    }

    const meanBrier = brierSum / calls.length; // 0 (perfect) to 1 (worst)
    // Scale Brier into 0 - 100 score: 0.25 (random guessing on binary) -> 50 score
    const calibrationScore = Math.round(Math.max(0, Math.min(100, (1 - meanBrier * 1.6) * 100)));

    const buckets = bucketData.map((b) => {
      const count = b.calls.length;
      const wins = b.calls.filter((c) => c.isCorrect).length;
      const winRate = count > 0 ? Number((wins / count).toFixed(3)) : b.expected;
      return {
        confidenceRange: b.label,
        predictedCount: count,
        actualWinRate: winRate,
        expectedConfidence: b.expected,
      };
    });

    return { calibrationScore, buckets };
  }

  /**
   * Consistency score (0 - 100) based on variance of rolling win rate & streak volatility
   */
  public static calculateConsistency(calls: TraderResolvedCall[]): number {
    if (calls.length < 5) return Math.min(50, calls.length * 10);

    // Calculate rolling chunks of 5 predictions
    const chunkSize = 5;
    const chunkWinRates: number[] = [];
    for (let i = 0; i <= calls.length - chunkSize; i += 2) {
      const slice = calls.slice(i, i + chunkSize);
      const wins = slice.filter((c) => c.isCorrect).length;
      chunkWinRates.push(wins / chunkSize);
    }

    if (chunkWinRates.length < 2) return 60;

    const mean = chunkWinRates.reduce((a, b) => a + b, 0) / chunkWinRates.length;
    const variance = chunkWinRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / chunkWinRates.length;
    const stdDev = Math.sqrt(variance);

    // Standard deviation < 0.15 indicates high consistency (80+ score)
    const consistencyScore = Math.round(Math.max(20, Math.min(100, 100 - stdDev * 200)));
    return consistencyScore;
  }

  /**
   * Complete reputation evaluation
   */
  public static evaluatePredictor(
    address: `0x${string}`,
    totalPredictions: number,
    calls: TraderResolvedCall[]
  ): CalculatedTraderReputation {
    const resolved = calls.length;
    const correct = calls.filter((c) => c.isCorrect).length;
    const accuracy = resolved > 0 ? correct / resolved : 0;
    const accuracyBps = Math.round(accuracy * 10000);

    // Calculate Streaks
    let currentStreak = 0;
    let maxStreak = 0;
    for (let i = calls.length - 1; i >= 0; i--) {
      if (calls[i].isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    let tempStreak = 0;
    for (const c of calls) {
      if (c.isCorrect) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // 1. Wilson Lower Bound Score (0 - 100)
    const wilson = this.calculateWilsonLowerBound(correct, resolved);
    const wilsonScore = wilson * 100;

    // 2. Calibration
    const { calibrationScore, buckets } = this.calculateCalibration(calls);

    // 3. Consistency
    const consistencyScore = this.calculateConsistency(calls);

    // 4. Composite Score
    // Weight: 50% Wilson (penalizes low sample size), 30% Calibration, 20% Consistency
    const composite = wilsonScore * 0.5 + calibrationScore * 0.3 + consistencyScore * 0.2;
    const predictorScore = Math.round(Math.max(0, Math.min(100, composite)));

    // Minimum 10 predictions and 60 score for Verified badge
    const isVerified = resolved >= 10 && predictorScore >= 60;

    const lastActiveTimestamp = calls.length > 0 ? calls[calls.length - 1].timestamp : Math.floor(Date.now() / 1000);

    return {
      address,
      totalPredictions,
      resolvedPredictions: resolved,
      correctPredictions: correct,
      accuracy: Number(accuracy.toFixed(4)),
      accuracyBps,
      predictorScore,
      calibrationScore,
      consistencyScore,
      currentStreak,
      maxStreak,
      lastActiveTimestamp,
      isVerified,
      calibrationBuckets: buckets,
    };
  }
}
