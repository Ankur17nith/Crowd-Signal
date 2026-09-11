import { describe, it, expect } from "vitest";
import { ReputationScoringEngine, TraderResolvedCall } from "../src/scoring/reputation.js";

describe("ReputationScoringEngine", () => {
  it("rewards veteran sample size over lucky 2-win streak via Wilson lower bound", () => {
    // Lucky trader: 2 predictions, 2 wins (100%)
    const luckyWilson = ReputationScoringEngine.calculateWilsonLowerBound(2, 2);

    // Veteran predictor: 231 predictions, 165 wins (71.4%)
    const veteranWilson = ReputationScoringEngine.calculateWilsonLowerBound(165, 231);

    // Key thesis: Veteran lower-bound confidence must exceed the lucky trader
    expect(veteranWilson).toBeGreaterThan(luckyWilson);
    expect(veteranWilson).toBeGreaterThan(0.65);
    expect(luckyWilson).toBeLessThan(0.40); // 2/2 has huge uncertainty!
  });

  it("evaluates Brier calibration accurately", () => {
    // Well-calibrated calls: confidence matches outcomes
    const calibratedCalls: TraderResolvedCall[] = [
      { predictionId: "1", asset: "BTC", direction: "UP", confidence: 0.8, actualOutcome: "UP", isCorrect: true, timestamp: 1 },
      { predictionId: "2", asset: "BTC", direction: "UP", confidence: 0.8, actualOutcome: "UP", isCorrect: true, timestamp: 2 },
      { predictionId: "3", asset: "BTC", direction: "UP", confidence: 0.8, actualOutcome: "UP", isCorrect: true, timestamp: 3 },
      { predictionId: "4", asset: "BTC", direction: "UP", confidence: 0.8, actualOutcome: "UP", isCorrect: true, timestamp: 4 },
      { predictionId: "5", asset: "BTC", direction: "UP", confidence: 0.8, actualOutcome: "DOWN", isCorrect: false, timestamp: 5 }, // 4/5 = 80%
    ];

    const result = ReputationScoringEngine.calculateCalibration(calibratedCalls);
    expect(result.calibrationScore).toBeGreaterThanOrEqual(70);
    expect(result.buckets.length).toBe(5);
  });

  it("evaluates overall predictor score and verification eligibility", () => {
    const veteranCalls: TraderResolvedCall[] = [];
    for (let i = 0; i < 50; i++) {
      veteranCalls.push({
        predictionId: `c_${i}`,
        asset: "BTC",
        direction: "UP",
        confidence: 0.72,
        actualOutcome: i % 4 !== 0 ? "UP" : "DOWN", // 75% win rate
        isCorrect: i % 4 !== 0,
        timestamp: 1000 + i,
      });
    }

    const evaluation = ReputationScoringEngine.evaluatePredictor(
      "0x1234567890123456789012345678901234567890" as `0x${string}`,
      50,
      veteranCalls
    );

    expect(evaluation.accuracyBps).toBe(7400); // 37/50 = 74%
    expect(evaluation.predictorScore).toBeGreaterThan(65);
    expect(evaluation.isVerified).toBe(true); // >= 10 predictions and score >= 60
  });
});
