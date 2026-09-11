import { describe, it, expect } from "vitest";
import { LatentProbabilityFilter } from "../../src/analytics/probability/latentProbability.js";
import { InformationTheoryEngine } from "../../src/analytics/information/informationTheory.js";
import { ReputationEngineV2, EvaluatedCallInput } from "../../src/scoring/reputation.js";

describe("Quantitative Models vs Naive Baselines Backtest", () => {
  it("Model 1: Latent Bayesian Filter achieves lower tracking error under order-book noise than Raw Midpoint", () => {
    // True underlying probability evolution: steady drift from 0.50 to 0.60
    const trueProbabilities = [0.50, 0.52, 0.54, 0.56, 0.58, 0.60];
    // Noisy observed midpoints with high-frequency bid/ask bounce
    const noisyMidpoints = [0.50, 0.58, 0.49, 0.62, 0.53, 0.61];

    const filter = new LatentProbabilityFilter(0.50);
    let filterSquaredError = 0;
    let naiveSquaredError = 0;

    for (let i = 0; i < trueProbabilities.length; i++) {
      const trueP = trueProbabilities[i];
      const noisyP = noisyMidpoints[i];
      const filtered = filter.update(noisyP, 0.04, 200, 1700000000 + i * 10);

      naiveSquaredError += Math.pow(noisyP - trueP, 2);
      filterSquaredError += Math.pow(filtered.latentProbability - trueP, 2);
    }

    const naiveMse = naiveSquaredError / trueProbabilities.length;
    const filterMse = filterSquaredError / trueProbabilities.length;

    // Filter should smooth out bid-ask bounce, lowering MSE
    expect(filterMse).toBeLessThan(naiveMse);
  });

  it("Model 2: Market-Relative Brier Skill distinguishes genuine alpha from trivial favorite-picking", () => {
    // Trader 1 (Favorite picker): Bets on 10 overwhelming favorites (market prob 90%, stated confidence 91%).
    // 8 out of 10 win. Raw win rate is 80%.
    const callsFavorite: EvaluatedCallInput[] = [];
    for (let i = 0; i < 10; i++) {
      const isWin = i < 8;
      callsFavorite.push({
        predictionId: `fav_${i}`,
        asset: "BTC",
        marketId: `m_${i}`,
        direction: "UP",
        predictorConfidence: 0.91,
        marketProbabilityAtCall: 0.90,
        actualOutcome: isWin ? "UP" : "DOWN",
        timestamp: 1700000000 + i * 100,
      });
    }

    // Trader 2 (Alpha discoverer): Bets on 10 even-odds markets (market prob 50%, stated confidence 70%).
    // 8 out of 10 win.
    const callsAlpha: EvaluatedCallInput[] = [];
    for (let i = 0; i < 10; i++) {
      const isWin = i < 8;
      callsAlpha.push({
        predictionId: `alpha_${i}`,
        asset: "BTC",
        marketId: `m_${i}`,
        direction: "UP",
        predictorConfidence: 0.70,
        marketProbabilityAtCall: 0.50,
        actualOutcome: isWin ? "UP" : "DOWN",
        timestamp: 1700000000 + i * 100,
      });
    }

    const evalFavorite = ReputationEngineV2.evaluatePredictor("0xFAV" as `0x${string}`, 10, callsFavorite);
    const evalAlpha = ReputationEngineV2.evaluatePredictor("0xALPHA" as `0x${string}`, 10, callsAlpha);

    // Both have 80% accuracy
    expect(evalFavorite.accuracy).toBe(0.8);
    expect(evalAlpha.accuracy).toBe(0.8);

    // BUT Market-Relative Brier Skill: Alpha demonstrates true informational contribution over 50% baseline,
    // producing more than double the market-relative skill of the simple favorite picker!
    expect(evalAlpha.marketRelativeSkill).toBeGreaterThan(0.25);
    expect(evalAlpha.marketRelativeSkill).toBeGreaterThan(evalFavorite.marketRelativeSkill * 1.5);
  });

  it("Model 3: Information Velocity captures non-linear uncertainty compression", () => {
    // Case A: Probability moves 50% -> 55% (near maximum uncertainty, small entropy decrease)
    const h50 = InformationTheoryEngine.calculateBinaryEntropy(0.50);
    const h55 = InformationTheoryEngine.calculateBinaryEntropy(0.55);
    const deltaH_A = Math.abs(h55 - h50);

    // Case B: Probability moves 85% -> 90% (near certainty, larger entropy collapse per percentage point)
    const h85 = InformationTheoryEngine.calculateBinaryEntropy(0.85);
    const h90 = InformationTheoryEngine.calculateBinaryEntropy(0.90);
    const deltaH_B = Math.abs(h90 - h85);

    // In non-linear information space, shifting from 85% to 90% resolves more uncertainty than 50% to 55%
    expect(deltaH_B).toBeGreaterThan(deltaH_A);
  });
});
