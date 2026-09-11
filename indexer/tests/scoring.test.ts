import { describe, it, expect } from "vitest";
import { CrowdScoringEngine } from "../src/scoring/crowdScoring.js";
import { ObservedMarketWindow } from "../src/normalize/types.js";
import { DivergenceScoringEngine } from "../src/scoring/divergence.js";
import { InformationTheoryEngine } from "../src/analytics/information/informationTheory.js";
import { MicrostructureEngine } from "../src/analytics/microstructure/microstructure.js";

describe("MicrostructureEngine", () => {
  it("computes order-book queue imbalance and microprice estimator", () => {
    const window: ObservedMarketWindow = {
      marketId: "w1",
      asset: "BTC",
      symbol: "BTC-15M",
      intervalSec: 900,
      bestBid: 0.60,
      bestAsk: 0.64, // spread = 0.04, mid = 0.62
      bidDepth: 300,  // excess bid demand
      askDepth: 100,
      cumulativeQuoteVolume: 50000,
      tradeCount: 100,
      status: "Trading",
      expiry: 1800000000,
      timestamp: 1700000000,
    };

    const metrics = MicrostructureEngine.calculateWindowMicrostructure(window);
    expect(metrics.midPrice).toBe(0.62);
    expect(metrics.spread).toBe(0.04);
    // Queue Imbalance: (300 - 100) / (300 + 100) = +0.50
    expect(metrics.queueImbalance).toBe(0.50);
    // Microprice: 0.62 + (0.50 * 0.04 / 2) = 0.62 + 0.01 = 0.63
    expect(metrics.microPrice).toBe(0.63);
    expect(metrics.micropriceAdjustment).toBe(0.01);
  });
});

describe("InformationTheoryEngine", () => {
  it("calculates binary Shannon entropy correctly", () => {
    // 50/50 is maximum uncertainty (1.0 bit)
    expect(InformationTheoryEngine.calculateBinaryEntropy(0.5)).toBeCloseTo(1.0, 3);

    // Near 0 or 1 is low uncertainty
    const entropy90 = InformationTheoryEngine.calculateBinaryEntropy(0.9);
    expect(entropy90).toBeLessThan(0.5);
    expect(entropy90).toBeGreaterThan(0.4);

    // Symmetric: H(p) == H(1-p)
    expect(InformationTheoryEngine.calculateBinaryEntropy(0.8)).toBeCloseTo(
      InformationTheoryEngine.calculateBinaryEntropy(0.2),
      5
    );
  });
});

describe("CrowdScoringEngine CS-PROB-2.0", () => {
  it("calculates latent probability, uncertainty bounds, and cryptographic provenance", () => {
    const engine = new CrowdScoringEngine();
    const now = 1700000000;
    const windows: ObservedMarketWindow[] = [
      {
        marketId: "m1",
        asset: "BTC",
        symbol: "BTC-15M",
        intervalSec: 900,
        bestBid: 0.63,
        bestAsk: 0.65,
        bidDepth: 200,
        askDepth: 200,
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
    expect(signal.upProbability).toBeCloseTo(0.64, 1);
    expect(signal.uncertaintyLower).toBeLessThan(signal.upProbability);
    expect(signal.uncertaintyUpper).toBeGreaterThan(signal.upProbability);
    expect(signal.entropy).toBeLessThan(1.0);
    expect(signal.provenance.algorithmVersion).toBe("CS-PROB-2.0");
    expect(signal.provenance.signalHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});

describe("DivergenceScoringEngine", () => {
  it("computes divergence and effective predictor count", () => {
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
        confidence: 0.55, // 45% UP
        predictorScore: 85,
        isVerified: true,
      },
    ];

    const div = DivergenceScoringEngine.calculateDivergence("BTC", crowdUpBps, activeCalls, 1700000000);
    expect(div.divergencePercent).toBeGreaterThan(15);
    expect(div.interpretation).toContain("Crowd is significantly more bullish");
    expect(div.effectivePredictorCount).toBeGreaterThan(1.5);
  });
});
