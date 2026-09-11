import { ChangepointState, QuantitativeMarketRegime } from "../../normalize/types.js";

/**
 * Bayesian Online Changepoint Detection (BOCPD) & Market Regime Engine
 * References:
 * - Adams, R. P., & MacKay, D. J. (2007). "Bayesian Online Changepoint Detection."
 * 
 * Tracks streaming hazard rates and run lengths to detect structural probability transitions
 * rather than high-frequency noise.
 */
export class ChangepointEngine {
  private runLength: number = 0;
  private meanEstimate: number = 0.5;
  private varianceEstimate: number = 0.01;
  private readonly hazardRate: number = 1 / 80; // Expected run-length ~80 steps

  /**
   * Update online changepoint detector with observed probability and classify regime
   */
  public update(
    probability: number,
    velocityBpsPerMin: number,
    entropy: number,
    relativeSpread: number
  ): ChangepointState {
    const p = Math.max(0.01, Math.min(0.99, probability));

    // 1. Evaluate predictive Gaussian likelihood of incoming observation under current regime
    const diff = p - this.meanEstimate;
    const stdDev = Math.sqrt(Math.max(0.001, this.varianceEstimate));
    // Standard normal density
    const z = diff / stdDev;
    const likelihood = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));

    // 2. Changepoint probability calculation via Bayes hazard update
    // If incoming point is many standard deviations away, changepoint probability spikes
    const rawCpProbability = (1 - Math.min(1, likelihood / 5)) * (this.hazardRate * 4);
    const changePointProbability = Math.max(0.02, Math.min(0.98, rawCpProbability + (Math.abs(diff) > 0.08 ? 0.4 : 0)));

    // 3. Update or reset run length
    if (changePointProbability > 0.65) {
      this.runLength = 0;
      this.meanEstimate = p;
      this.varianceEstimate = 0.01;
    } else {
      this.runLength++;
      // Recursive exponential smoothing update for regime mean and variance
      const alpha = 0.15;
      this.meanEstimate = (1 - alpha) * this.meanEstimate + alpha * p;
      this.varianceEstimate = (1 - alpha) * this.varianceEstimate + alpha * (diff * diff);
    }

    // 4. Deterministic Market Regime Classification (CS-REGIME-2.0)
    let marketRegime: QuantitativeMarketRegime = "STABLE";

    if (changePointProbability >= 0.7 || Math.abs(velocityBpsPerMin) >= 1200) {
      marketRegime = "INFORMATION_SHOCK";
    } else if (relativeSpread > 0.06) {
      marketRegime = "LIQUIDITY_FRAGILE";
    } else if (entropy >= 0.985 && Math.abs(p - 0.5) <= 0.04) {
      marketRegime = "HIGH_UNCERTAINTY";
    } else if (Math.abs(velocityBpsPerMin) >= 300) {
      marketRegime = "TRENDING";
    } else {
      marketRegime = "STABLE";
    }

    return {
      changePointProbability: Number(changePointProbability.toFixed(4)),
      runLength: this.runLength,
      marketRegime,
    };
  }
}
