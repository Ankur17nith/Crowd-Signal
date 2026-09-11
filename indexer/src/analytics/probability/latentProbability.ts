import { LatentProbabilityState } from "../../normalize/types.js";

/**
 * Latent Bayesian Probability Engine
 * Filters noisy order-book quotes into a continuous latent probability state with
 * exact 95% posterior credible intervals and online momentum estimation.
 * 
 * Implemented via online recursive Bayesian state-space filtering in logit belief space:
 * x_t = logit(\theta_t), y_t = x_t + \epsilon_t, where \epsilon_t ~ N(0, R_t).
 */
export class LatentProbabilityFilter {
  private x: number = 0; // State estimate in logit space (0 = 50% probability)
  private pCov: number = 0.25; // Estimation error variance in logit space
  private lastUpdateTimestamp: number = 0;
  private prevProbability: number = 0.5;
  private prevVelocity: number = 0;

  // Model parameters (CS-PROB-2.0)
  private readonly processVarianceRate = 0.0005; // Q rate per second
  private readonly minObservationVariance = 0.01; // Base observation noise floor

  constructor(initialProbability: number = 0.5) {
    const clamped = Math.max(0.01, Math.min(0.99, initialProbability));
    this.x = Math.log(clamped / (1 - clamped));
    this.prevProbability = clamped;
  }

  /**
   * Recursive Bayesian update with incoming observed probability and market depth
   */
  public update(
    observedProbability: number,
    relativeSpread: number,
    marketDepth: number,
    currentTimestamp: number
  ): LatentProbabilityState {
    const pObs = Math.max(0.01, Math.min(0.99, observedProbability));
    const y = Math.log(pObs / (1 - pObs)); // Convert observation to logit space

    const dt = this.lastUpdateTimestamp > 0 ? Math.max(1, currentTimestamp - this.lastUpdateTimestamp) : 1;
    this.lastUpdateTimestamp = currentTimestamp;

    // 1. Time Update (Predict Step)
    const q = this.processVarianceRate * dt;
    const pPrior = this.pCov + q;
    const xPrior = this.x;

    // 2. Measurement Update (Correct Step)
    // Observation variance increases with wider spreads and lower order depth
    const r = Math.max(
      this.minObservationVariance,
      (relativeSpread * 2) / Math.sqrt(Math.max(10, marketDepth))
    );

    const kalmanGain = pPrior / (pPrior + r);
    this.x = xPrior + kalmanGain * (y - xPrior);
    this.pCov = (1 - kalmanGain) * pPrior;

    // 3. Map back to probability domain [0, 1] via logistic sigmoid
    const latentProb = 1 / (1 + Math.exp(-this.x));

    // 4. Exact 95% Credible Interval in logit space mapped monotonically to probability
    const zScore = 1.96;
    const stdErr = Math.sqrt(this.pCov);
    const lowerLogit = this.x - zScore * stdErr;
    const upperLogit = this.x + zScore * stdErr;

    const uncertaintyLower = 1 / (1 + Math.exp(-lowerLogit));
    const uncertaintyUpper = 1 / (1 + Math.exp(-upperLogit));
    const uncertaintyWidth = uncertaintyUpper - uncertaintyLower;

    // 5. Velocity & Acceleration in bps/min
    const deltaMinutes = dt / 60;
    const deltaProb = latentProb - this.prevProbability;
    const rawVelocityBpsPerMin = deltaMinutes > 0 ? (deltaProb * 10000) / deltaMinutes : 0;
    const velocityBpsPerMin = Math.round(Math.max(-5000, Math.min(5000, rawVelocityBpsPerMin)));

    const deltaVelocity = deltaMinutes > 0 ? (velocityBpsPerMin - this.prevVelocity) / deltaMinutes : 0;
    const accelerationBpsPerMin2 = Math.round(Math.max(-5000, Math.min(5000, deltaVelocity)));

    this.prevProbability = latentProb;
    this.prevVelocity = velocityBpsPerMin;

    return {
      latentProbability: Number(latentProb.toFixed(4)),
      uncertaintyLower: Number(uncertaintyLower.toFixed(4)),
      uncertaintyUpper: Number(uncertaintyUpper.toFixed(4)),
      uncertaintyWidth: Number(uncertaintyWidth.toFixed(4)),
      velocityBpsPerMin,
      accelerationBpsPerMin2,
    };
  }

  public getLatentProbability(): number {
    return 1 / (1 + Math.exp(-this.x));
  }
}
