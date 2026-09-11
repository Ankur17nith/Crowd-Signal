import { InformationMetrics } from "../../normalize/types.js";

/**
 * Information Theory Engine
 * Calculates binary Shannon entropy, information velocity (dH/dt), and relative entropy (Kullback-Leibler divergence).
 * Distinguishes whether probability movement represents genuine uncertainty compression vs speculative noise.
 */
export class InformationTheoryEngine {
  private prevEntropy: number = 1.0;
  private prevProbability: number = 0.5;
  private prevTimestamp: number = 0;

  /**
   * Compute binary Shannon entropy in bits [0, 1]
   * H(p) = -p * log2(p) - (1 - p) * log2(1 - p)
   */
  public static calculateBinaryEntropy(probability: number): number {
    const p = Math.max(0.0001, Math.min(0.9999, probability));
    const term1 = p * Math.log2(p);
    const term2 = (1 - p) * Math.log2(1 - p);
    return -(term1 + term2);
  }

  /**
   * Calculate Kullback-Leibler Divergence D_KL(P_t || P_prior) in bits
   */
  public static calculateKLDivergence(pCurrent: number, pPrior: number): number {
    const p = Math.max(0.0001, Math.min(0.9999, pCurrent));
    const q = Math.max(0.0001, Math.min(0.9999, pPrior));

    const kl = p * Math.log2(p / q) + (1 - p) * Math.log2((1 - p) / (1 - q));
    return Math.max(0, kl);
  }

  /**
   * Evaluate online information metrics for streaming belief updates
   */
  public update(probability: number, currentTimestamp: number): InformationMetrics {
    const currentEntropy = InformationTheoryEngine.calculateBinaryEntropy(probability);
    const dt = this.prevTimestamp > 0 ? Math.max(1, currentTimestamp - this.prevTimestamp) : 1;
    const deltaMinutes = dt / 60;

    const entropyChange = this.prevTimestamp > 0 ? currentEntropy - this.prevEntropy : 0;
    const informationGain = this.prevTimestamp > 0
      ? InformationTheoryEngine.calculateKLDivergence(probability, this.prevProbability)
      : 0;

    const informationVelocity = deltaMinutes > 0 ? entropyChange / deltaMinutes : 0;

    this.prevEntropy = currentEntropy;
    this.prevProbability = probability;
    this.prevTimestamp = currentTimestamp;

    return {
      entropy: Number(currentEntropy.toFixed(4)),
      entropyChange: Number(entropyChange.toFixed(4)),
      informationGain: Number(informationGain.toFixed(4)),
      informationVelocity: Number(informationVelocity.toFixed(4)),
    };
  }
}
