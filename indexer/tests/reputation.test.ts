import { describe, it, expect } from "vitest";
import { ReputationEngineV2, EvaluatedCallInput } from "../src/scoring/reputation.js";

describe("ReputationEngineV2", () => {
  it("rewards veteran sample size over lucky 2-win streak via Wilson lower bound", () => {
    // Lucky trader: 2 predictions, 2 wins (100%)
    const luckyWilson = ReputationEngineV2.calculateWilsonLowerBound(2, 2);

    // Veteran predictor: 231 predictions, 165 wins (71.4%)
    const veteranWilson = ReputationEngineV2.calculateWilsonLowerBound(165, 231);

    // Key thesis: Veteran lower-bound confidence must exceed the lucky trader
    expect(veteranWilson).toBeGreaterThan(luckyWilson);
    expect(veteranWilson).toBeGreaterThan(0.65);
    expect(luckyWilson).toBeLessThan(0.40); // 2/2 has large binomial uncertainty
  });

  it("calculates Bayesian Beta-Binomial shrinkage with exact credible intervals", () => {
    // Lucky trader: 2/2 wins
    const luckyBayes = ReputationEngineV2.calculateBayesianShrinkage(2, 2);
    // (2 + 2) / (2 + 4) = 4/6 = 0.6667
    expect(luckyBayes.posteriorMean).toBeCloseTo(0.667, 2);
    expect(luckyBayes.credibleLower).toBeLessThan(0.40);

    // Veteran: 165/231 wins (71.4%)
    const veteranBayes = ReputationEngineV2.calculateBayesianShrinkage(165, 231);
    expect(veteranBayes.posteriorMean).toBeCloseTo(0.71, 1);
    // Veteran interval is tight
    expect(veteranBayes.credibleUpper - veteranBayes.credibleLower).toBeLessThan(0.15);
  });

  it("evaluates Sanders/Murphy 3-part Brier decomposition", () => {
    const calls: EvaluatedCallInput[] = [];
    // Well-calibrated predictions: in 75% confidence bucket, wins ~75% of the time (15/20)
    for (let i = 0; i < 20; i++) {
      calls.push({
        predictionId: `p_75_${i}`,
        asset: "BTC",
        marketId: "m1",
        direction: "UP",
        predictorConfidence: 0.75,
        marketProbabilityAtCall: 0.52,
        actualOutcome: i < 15 ? "UP" : "DOWN",
        timestamp: 1700000000 + i * 3600,
      });
    }
    // in 65% confidence bucket, wins ~65% of the time (13/20)
    for (let i = 0; i < 20; i++) {
      calls.push({
        predictionId: `p_65_${i}`,
        asset: "BTC",
        marketId: "m1",
        direction: "UP",
        predictorConfidence: 0.65,
        marketProbabilityAtCall: 0.52,
        actualOutcome: i < 13 ? "UP" : "DOWN",
        timestamp: 1700000000 + (20 + i) * 3600,
      });
    }

    const evaluation = ReputationEngineV2.evaluatePredictor(
      "0x1111111111111111111111111111111111111111" as `0x${string}`,
      40,
      calls
    );

    expect(evaluation.reliability).toBeLessThan(0.02); // Excellent calibration (< 0.02)
    expect(evaluation.resolution).toBeGreaterThanOrEqual(0);
    expect(evaluation.uncertainty).toBeGreaterThan(0.15);
    expect(evaluation.marketRelativeSkill).toBeGreaterThan(0); // Outperformed 52% baseline
  });

  it("penalizes predicting obvious consensus over incremental skill", () => {
    // Predictor A: Predicts 91% when market is already 90% (trivial edge)
    const callA: EvaluatedCallInput = {
      predictionId: "a1",
      asset: "BTC",
      marketId: "m1",
      direction: "UP",
      predictorConfidence: 0.91,
      marketProbabilityAtCall: 0.90,
      actualOutcome: "UP",
      timestamp: 1700000000,
    };

    // Predictor B: Predicts 82% when market was 51% (strong non-consensus insight)
    const callB: EvaluatedCallInput = {
      predictionId: "b1",
      asset: "BTC",
      marketId: "m2",
      direction: "UP",
      predictorConfidence: 0.82,
      marketProbabilityAtCall: 0.51,
      actualOutcome: "UP",
      timestamp: 1700000000,
    };

    const evalA = ReputationEngineV2.evaluatePredictor("0xA" as `0x${string}`, 1, [callA]);
    const evalB = ReputationEngineV2.evaluatePredictor("0xB" as `0x${string}`, 1, [callB]);

    // Brier skill score vs market should be significantly higher for B because B generated true alpha
    expect(evalB.marketRelativeSkill).toBeGreaterThan(evalA.marketRelativeSkill);
  });
});
