import { MarketSignal, DivergenceData, QuantitativeRegime } from "./data";

export interface DemoState {
  step: number;
  prob: number;
  sentiment: QuantitativeRegime;
  predictorConsensus: number;
  divergence: number;
  skew: number;
  velocity: number;
}

const DEMO_STEPS: DemoState[] = [
  {
    step: 0,
    prob: 42.0,
    sentiment: "HIGH_UNCERTAINTY",
    predictorConsensus: 44.0,
    divergence: 2.0,
    skew: -3.5,
    velocity: 0.8,
  },
  {
    step: 1,
    prob: 48.0,
    sentiment: "STABLE",
    predictorConsensus: 46.0,
    divergence: 2.0,
    skew: 5.2,
    velocity: 2.4,
  },
  {
    step: 2,
    prob: 57.0,
    sentiment: "TRENDING",
    predictorConsensus: 49.0,
    divergence: 8.0,
    skew: 18.4,
    velocity: 5.6,
  },
  {
    step: 3,
    prob: 64.2,
    sentiment: "TRENDING",
    predictorConsensus: 52.0,
    divergence: 12.2,
    skew: 28.4,
    velocity: 7.2,
  },
];

export class DemoSimulator {
  private currentStep = 3;

  public getCurrentDemoState(): DemoState {
    return DEMO_STEPS[this.currentStep];
  }

  public nextStep(): DemoState {
    this.currentStep = (this.currentStep + 1) % DEMO_STEPS.length;
    return DEMO_STEPS[this.currentStep];
  }

  public applyToSignal(baseSignal: MarketSignal): MarketSignal {
    const s = this.getCurrentDemoState();
    return {
      ...baseSignal,
      upProbability: s.prob,
      downProbability: Number((100 - s.prob).toFixed(1)),
      marketRegime: s.sentiment,
      capitalSkew: s.skew,
      velocityPerMin: s.velocity,
    };
  }

  public applyToDivergence(baseDivergence: DivergenceData): DivergenceData {
    const s = this.getCurrentDemoState();
    return {
      ...baseDivergence,
      crowdUpProbability: Math.round(s.prob),
      topPredictorConsensus: Math.round(s.predictorConsensus),
      divergencePercent: Number(s.divergence.toFixed(1)),
      interpretation:
        s.divergence >= 10
          ? `Crowd is significantly more bullish (+${s.divergence.toFixed(1)}%) than historically accurate predictors.`
          : `Mild divergence (+${s.divergence.toFixed(1)}%): Crowd and top predictors remain within normal band.`,
    };
  }
}
