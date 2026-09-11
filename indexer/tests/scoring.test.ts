import { describe, it, expect } from "vitest";
import { CrowdScoringEngine } from "../src/scoring/crowdScoring.js";
import { RawMarketWindow } from "../src/normalize/types.js";
import { DivergenceScoringEngine } from "../src/scoring/divergence.js";

describe("CrowdScoringEngine", () => {
  const engine = new CrowdScoringEngine();

  it("calculates implied probability and capital skew from active windows", () => {
    const now = 1700000000;
    const windows: RawMarketWindow[] = [
      {
        marketId: "m1",
        asset: "BTC",
        symbol: "BTC-15M",
        intervalSec: 900,
        bestBid: 0.63,
        bestAsk: 0.65,
        openInterestUsd: 100000,
        openInterestUp: 65000,
        openInterestDown: 35000,
        cumulativeQuoteVolume: 50000,
        tradeCount: 120,
        status: "Trading",
        expiry: now + 500,
        timestamp: now,
      },
    ];

    const signal = engine.calculateSignal("BTC", windows, now);
    expect(signal.upProbability).toBeCloseTo(0.64, 2);
    expect(signal.upProbabilityBps).toBe(6400);
    expect(signal.downProbabilityBps).toBe(3600);
    expect(signal.capitalSkewBps).toBe(3000); // (65k - 35k)/100k = +0.30
    expect(signal.marketRegime).toBe("BULLISH");
    expect(signal.confidenceScore).toBeGreaterThanOrEqual(50);
  });

  it("calculates probability velocity across successive cycles", () => {
    const t1 = 1700000000;
    const t2 = 1700000060; // 1 minute later

    const windows1: RawMarketWindow[] = [
      {
        marketId: "m1",
        asset: "BTC",
        symbol: "BTC-15M",
        intervalSec: 900,
        bestBid: 0.50,
        bestAsk: 0.50,
        openInterestUsd: 50000,
        openInterestUp: 25000,
        openInterestDown: 25000,
        cumulativeQuoteVolume: 10000,
        tradeCount: 50,
        status: "Trading",
        expiry: t1 + 500,
        timestamp: t1,
      },
    ];

    const windows2: RawMarketWindow[] = [
      {
        marketId: "m1",
        asset: "BTC",
        symbol: "BTC-15M",
        intervalSec: 900,
        bestBid: 0.572,
        bestAsk: 0.572,
        openInterestUsd: 55000,
        openInterestUp: 35000,
        openInterestDown: 20000,
        cumulativeQuoteVolume: 15000,
        tradeCount: 70,
        status: "Trading",
        expiry: t2 + 440,
        timestamp: t2,
      },
    ];

    engine.calculateSignal("BTC", windows1, t1);
    const signal2 = engine.calculateSignal("BTC", windows2, t2);

    // Probability jumped from 50.0% to 57.2% in 1 minute -> velocity ~ +7.2% / min (+720 bps/min)
    expect(signal2.velocityBpsPerMin).toBeCloseTo(720, -1);
  });
});

describe("DivergenceScoringEngine", () => {
  it("computes divergence when crowd is more bullish than verified predictors", () => {
    const crowdUpBps = 6400; // 64% UP
    const activeCalls = [
      {
        trader: "0x1" as `0x${string}`,
        direction: "UP" as const,
        confidence: 0.48, // 48% UP
        predictorScore: 90,
        isVerified: true,
      },
      {
        trader: "0x2" as `0x${string}`,
        direction: "DOWN" as const,
        confidence: 0.52, // 48% UP
        predictorScore: 85,
        isVerified: true,
      },
    ];

    const divergence = DivergenceScoringEngine.calculateDivergence("BTC", crowdUpBps, activeCalls);
    expect(divergence.divergenceBps).toBeGreaterThan(1500); // 64% vs 48% -> ~16% divergence
    expect(divergence.interpretation).toContain("Crowd is significantly more bullish");
  });
});
