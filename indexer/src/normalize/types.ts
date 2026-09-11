export type AssetSymbol = "BTC" | "ETH" | "SOL" | "SOMI";

export type OutcomeDirection = "UP" | "DOWN";

export type QuantitativeMarketRegime =
  | "STABLE"
  | "TRENDING"
  | "INFORMATION_SHOCK"
  | "HIGH_UNCERTAINTY"
  | "LIQUIDITY_FRAGILE";

/**
 * Raw observed market state directly from touch book, order depth, or events.
 * Strict boundary: zero derived models here.
 */
export interface ObservedMarketWindow {
  marketId: string;
  asset: AssetSymbol;
  symbol: string;
  intervalSec: number;
  openPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  lastPrice?: number;
  bidDepth?: number; // Total units resting at or near best bid
  askDepth?: number; // Total units resting at or near best ask
  openInterestUsd?: number;
  openInterestUp?: number;
  openInterestDown?: number;
  cumulativeQuoteVolume: number;
  tradeCount: number;
  status: "Listed" | "Trading" | "Locked" | "Finalized" | "Voided";
  expiry: number;
  timestamp: number;
  blockNumber?: number;
}

// Backward-compatibility alias
export type RawMarketWindow = ObservedMarketWindow;

export interface RawTradeFill {
  fillId: string;
  marketId: string;
  trader: `0x${string}`;
  direction: OutcomeDirection;
  price: number; // 0 to 1
  size: number;  // contract count
  quoteAmount: number; // USD value
  timestamp: number;
  blockNumber?: number;
}

/**
 * Microstructure metrics extracted from order book depth
 */
export interface MicrostructureMetrics {
  midPrice: number;
  spread: number;
  relativeSpread: number;
  queueImbalance: number; // -1 to +1
  orderFlowImbalance?: number;
  microPrice: number; // Order-book informed fair estimator
  micropriceAdjustment: number; // microPrice - midPrice
}

/**
 * Latent probability filtered state
 */
export interface LatentProbabilityState {
  latentProbability: number;     // Filtered fair probability in [0.01, 0.99]
  uncertaintyLower: number;      // 95% Credible interval lower bound
  uncertaintyUpper: number;      // 95% Credible interval upper bound
  uncertaintyWidth: number;      // upperBound - lowerBound
  velocityBpsPerMin: number;     // First derivative of latent belief
  accelerationBpsPerMin2: number;// Second derivative of latent belief
}

/**
 * Information theory & entropy metrics
 */
export interface InformationMetrics {
  entropy: number;               // Binary Shannon entropy in bits [0, 1]
  entropyChange: number;         // Delta H compared to prior period
  informationGain: number;       // KL Divergence or information arrival (bits)
  informationVelocity: number;   // dH/dt (bits per minute)
}

/**
 * Change-point detection state
 */
export interface ChangepointState {
  changePointProbability: number;// [0, 1] probability of structural regime change
  runLength: number;             // Time-steps in current regime
  marketRegime: QuantitativeMarketRegime;
}

/**
 * Participant concentration analytics
 */
export interface ConcentrationMetrics {
  top1Share: number;             // Share of total positioning by largest wallet
  top5Share: number;
  top10Share: number;
  hhi: number;                   // Herfindahl-Hirschman Index [0, 1]
  effectiveParticipantCount: number; // Neff = 1 / HHI
  signalIndependenceScore: number;   // [0, 1] penalizing extreme whale concentration
}

/**
 * Cryptographic signal provenance tracking
 */
export interface SignalProvenance {
  algorithmVersion: string;      // e.g. "CS-PROB-2.0"
  inputSnapshotHash: `0x${string}`;
  signalHash: `0x${string}`;
  timestamp: number;
  blockNumber?: number;
}

/**
 * Authoritative quantitative market signal record
 */
export interface CalculatedMarketSignal {
  asset: AssetSymbol;
  assetKey: `0x${string}`;
  
  // Implied touch & Microstructure
  midProbability: number;
  microProbability: number;
  micropriceAdjustment: number;
  spread: number;
  relativeSpread: number;
  queueImbalance: number;

  // Latent Bayesian filtered probability
  upProbability: number;         // Primary filtered probability (0 - 1)
  upProbabilityBps: number;      // 0 - 10000 bps
  downProbabilityBps: number;    // 0 - 10000 bps
  uncertaintyLower: number;      // 95% credible bound lower
  uncertaintyUpper: number;      // 95% credible bound upper
  uncertaintyWidthBps: number;

  // Information dynamics
  entropy: number;               // Bits [0, 1]
  informationVelocity: number;   // dH/dt in bits/min
  changePointProbability: number;// [0, 1]

  // Capital and concentration
  capitalSkew: number;           // -1 to +1
  capitalSkewBps: number;        // -10000 to +10000 bps
  effectiveParticipantCount: number;
  concentrationHhi: number;
  signalIndependenceScore: number;

  // Confidence & Momentum
  confidenceScore: number;       // 0 - 100 composite
  velocityBpsPerMin: number;     // bps/min
  accelerationBpsPerMin2: number;
  openInterestUsd: number;
  totalVolumeUsd: number;
  activeWindowCount: number;
  marketRegime: QuantitativeMarketRegime;

  // Provenance
  provenance: SignalProvenance;
  timestamp: number;
}

/**
 * Historical prediction evaluation
 */
export interface EvaluatedPrediction {
  predictionId: string;
  asset: AssetSymbol;
  marketId: string;
  direction: OutcomeDirection;
  predictorConfidence: number;   // Stated subjective probability (0.50 - 1.00)
  marketProbabilityAtCall: number;// Market implied probability when call made
  actualOutcome: OutcomeDirection;
  isCorrect: boolean;
  brierScore: number;            // (predictorConfidence - outcome)^2
  marketBrierScore: number;      // (marketProbabilityAtCall - outcome)^2
  brierSkillScore: number;       // 1 - (BS_pred / BS_market)
  timestamp: number;
}

/**
 * Upgraded predictor reputation profile
 */
export interface CalculatedTraderReputation {
  address: `0x${string}`;
  totalPredictions: number;
  resolvedPredictions: number;
  correctPredictions: number;
  
  // Directional accuracy & Bayesian shrinkage
  accuracy: number;              // Raw observed accuracy [0, 1]
  accuracyBps: number;
  bayesianAccuracyMean: number;  // Beta-Binomial posterior mean
  credibleIntervalLower: number; // 95% Bayesian credible lower bound
  credibleIntervalUpper: number; // 95% Bayesian credible upper bound

  // Proper scoring rules
  meanBrierScore: number;        // [0, 1]
  marketRelativeSkill: number;   // Average Brier Skill Score vs Market baseline
  
  // Brier Decomposition (Murphy / Sanders)
  reliability: number;           // Calibration error (lower is better)
  resolution: number;            // Ability to discriminate (higher is better)
  uncertainty: number;           // Inherent outcome variance

  // Composite scoring & anti-gaming
  wilsonLowerBound: number;
  calibrationScore: number;      // 0 - 100
  consistencyScore: number;      // 0 - 100
  predictorScore: number;        // 0 - 100
  
  // Recency & trends
  recencyWeightedSkill: number;  // Exponential decay weighted skill
  skillTrend: "IMPROVING" | "STABLE" | "DECLINING";
  currentStreak: number;
  maxStreak: number;
  lastActiveTimestamp: number;
  isVerified: boolean;
  
  calibrationBuckets: {
    confidenceRange: string;
    predictedCount: number;
    actualWinRate: number;
    expectedConfidence: number;
  }[];
}

export interface CrowdVsPredictorDivergence {
  asset: AssetSymbol;
  crowdUpProbabilityBps: number;
  predictorConsensusBps: number;
  divergenceBps: number;
  divergencePercent: number; // e.g. 15.2%
  interpretation: string;
  topPredictorCount: number;
  effectivePredictorCount: number;
  persistenceScore: number;  // 0 - 100 reflecting duration of divergence
  timestamp: number;
}
