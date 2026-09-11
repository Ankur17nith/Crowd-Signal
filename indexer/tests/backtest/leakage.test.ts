import { describe, it, expect } from "vitest";
import { CrowdScoringEngine } from "../../src/scoring/crowdScoring.js";
import { ObservedMarketWindow } from "../../src/normalize/types.js";
import { ReputationEngineV2, EvaluatedCallInput } from "../../src/scoring/reputation.js";

describe("Causality & Look-Ahead Leakage Prevention", () => {
  it("strictly prevents future market windows or settlements from affecting past calculations", () => {
    const tCurrent = 1700000000;
    const tFuture = 1700003600; // 1 hour in the future

    const currentWindow: ObservedMarketWindow = {
      marketId: "w_past",
      asset: "BTC",
      symbol: "BTC-15M",
      intervalSec: 900,
      bestBid: 0.52,
      bestAsk: 0.54,
      cumulativeQuoteVolume: 20000,
      tradeCount: 40,
      status: "Trading",
      expiry: tCurrent + 600,
      timestamp: tCurrent,
    };

    const futureWindow: ObservedMarketWindow = {
      marketId: "w_future",
      asset: "BTC",
      symbol: "BTC-15M",
      intervalSec: 900,
      bestBid: 0.85,
      bestAsk: 0.89, // Massive future jump
      cumulativeQuoteVolume: 80000,
      tradeCount: 150,
      status: "Trading",
      expiry: tFuture + 600,
      timestamp: tFuture, // Future timestamp!
    };

    // Instantiate two clean engines
    const engine1 = new CrowdScoringEngine();
    const engine2 = new CrowdScoringEngine();

    const signalWithoutFuture = engine1.calculateSignal("BTC", [currentWindow], tCurrent);
    const signalWithFutureIncluded = engine2.calculateSignal("BTC", [currentWindow, futureWindow], tCurrent);

    // Assert exact invariance: future window (timestamp > tCurrent) is strictly ignored
    expect(signalWithFutureIncluded.upProbabilityBps).toBe(signalWithoutFuture.upProbabilityBps);
    expect(signalWithFutureIncluded.confidenceScore).toBe(signalWithoutFuture.confidenceScore);
  });

  it("ensures predictor evaluations only use market state observed at the moment of prediction", () => {
    const call: EvaluatedCallInput = {
      predictionId: "p1",
      asset: "BTC",
      marketId: "m1",
      direction: "UP",
      predictorConfidence: 0.70,
      marketProbabilityAtCall: 0.50, // Recorded at t=100
      actualOutcome: "UP",
      timestamp: 1700000100,
    };

    // Evaluate predictor
    const evalResult = ReputationEngineV2.evaluatePredictor(
      "0x123" as `0x${string}`,
      1,
      [call],
      1700000200
    );

    // Predictor called 0.70 when market was 0.50. Outcome = 1.
    // BS_pred = (0.70 - 1)^2 = 0.09
    // BS_market = (0.50 - 1)^2 = 0.25
    // Skill = 1 - (0.09 / 0.25) = 1 - 0.36 = +0.64
    expect(evalResult.marketRelativeSkill).toBeCloseTo(0.64, 2);
  });
});
