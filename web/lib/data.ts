export type QuantitativeRegime =
  | "STABLE"
  | "TRENDING"
  | "INFORMATION_SHOCK"
  | "HIGH_UNCERTAINTY"
  | "LIQUIDITY_FRAGILE"
  | "UNAVAILABLE";

export interface MarketSignal {
  asset: "BTC" | "ETH" | "SOL" | "SOMI";
  symbol: string;
  
  // Implied & Microstructure
  midProbability: number;
  microProbability: number;
  micropriceAdjustment: number;
  spread: number;
  relativeSpread: number;
  queueImbalance: number;

  // Latent filtered belief & uncertainty interval
  upProbability: number;        // e.g. 64.2
  downProbability: number;      // e.g. 35.8
  uncertaintyInterval: [number, number]; // e.g. [61.8, 66.4]
  uncertaintyWidth: number;     // e.g. 4.6 (±2.3pp)
  
  // Information dynamics
  entropy: number;              // bits [0, 1]
  informationVelocity: number;  // bits/min
  changePointProbability: number;// 0 - 1

  // Capital & Concentration
  openInterestUsd: number;
  capitalSkew: number;          // e.g. +28.4%
  effectiveParticipants: number;// N_eff
  concentrationHhi: number;     // HHI
  signalIndependence: number;   // 0 - 1

  // Momentum & Regime
  change24h: number;            // e.g. +7.1%
  velocityPerMin: number;       // e.g. +7.2%/min
  confidence: number;           // 0 - 100
  marketRegime: QuantitativeRegime;
  activeWindowCount: number;
  totalVolumeUsd: number;
  lastUpdatedSecondsAgo: number;

  // Provenance
  provenance: {
    algorithmVersion: string;
    inputSnapshotHash: string;
    signalHash: string;
    timestamp: number;
  };
}

export interface EventContractWindow {
  id: string;
  asset: "BTC" | "ETH" | "SOL" | "SOMI";
  title: string;
  interval: string;
  upProbability?: number;
  downProbability?: number;
  microPrice?: number;
  spread: number;
  queueImbalance: number;
  openInterestUsd: number;
  volumeUsd: number;
  secondsRemaining: number;
  status: "Trading" | "Locked" | "Resolved";
  openPrice: number;
  currentTouchBid: number;
  currentTouchAsk: number;
  poolAddress: string;
}

export interface PredictorProfile {
  address: string;
  ensOrShort: string;
  predictorScore: number;
  accuracy: number;
  totalPredictions: number;
  resolvedPredictions: number;
  
  // Bayesian Shrinkage & Credible Intervals
  bayesianAccuracyMean: number;
  credibleInterval: [number, number]; // [lower, upper]

  // Proper Scoring & Market-Relative Alpha
  marketRelativeSkill: number;   // Brier Skill Score vs Market Baseline
  meanBrierScore: number;
  brierDecomposition: {
    reliability: number;         // Calibration error
    resolution: number;          // Discrimination
    uncertainty: number;         // Outcome entropy
  };

  // Recency & Trends
  recencyWeightedSkill: number;
  skillTrend: "IMPROVING" | "STABLE" | "DECLINING";

  calibrationScore: number;
  consistencyScore: number;
  currentStreak: number;
  maxStreak: number;
  isVerified: boolean;
  rank: number;
  followed?: boolean;
  recentForm: number;

  calibrationBuckets: {
    label: string;
    actualWinRate: number;
    expectedConfidence: number;
    count: number;
  }[];
  history: {
    id: string;
    date: string;
    asset: string;
    window: string;
    prediction: "UP" | "DOWN";
    confidence: number;
    marketProbabilityAtCall: number;
    brierSkillScore: number;
    outcome: "Correct" | "Incorrect" | "Pending";
  }[];
}

export interface DivergenceData {
  asset: "BTC" | "ETH";
  crowdUpProbability: number;
  topPredictorConsensus: number;
  divergencePercent: number;
  effectivePredictorCount: number;
  persistenceScore: number;
  interpretation: string;
  topPredictorCount: number;
}

// --- Discriminated API Contracts (CS-API-2.0) ---
export type ApiDataStatus = "live" | "delayed" | "unavailable" | "error";

export type MarketSignalResponse =
  | {
      status: "live" | "delayed";
      data: MarketSignal;
      freshnessSeconds: number;
      elapsedMs: number;
      source: "SQLITE_WAL" | "FIXTURE_DEMO";
    }
  | {
      status: "unavailable";
      asset: string;
      message: string;
      elapsedMs: number;
      source?: string;
    }
  | {
      status: "error";
      asset: string;
      error: string;
      elapsedMs: number;
    };

export type ActiveMarketsResponse =
  | {
      status: "live" | "delayed";
      markets: EventContractWindow[];
      count: number;
      elapsedMs: number;
    }
  | {
      status: "unavailable";
      markets: EventContractWindow[];
      count: 0;
      message: string;
      elapsedMs: number;
    }
  | {
      status: "error";
      markets: EventContractWindow[];
      count: 0;
      error: string;
      elapsedMs: number;
    };

export type DivergenceResponse =
  | {
      status: "live" | "delayed";
      data: DivergenceData;
      elapsedMs: number;
    }
  | {
      status: "unavailable";
      asset: string;
      message: string;
      elapsedMs: number;
    }
  | {
      status: "error";
      asset: string;
      error: string;
      elapsedMs: number;
    };

export type LeaderboardResponse =
  | {
      status: "live" | "delayed";
      predictors: PredictorProfile[];
      count: number;
      elapsedMs: number;
    }
  | {
      status: "unavailable";
      predictors: PredictorProfile[];
      count: 0;
      message: string;
      elapsedMs: number;
    }
  | {
      status: "error";
      predictors: PredictorProfile[];
      count: 0;
      error: string;
      elapsedMs: number;
    };

export interface OverviewAggregateResponse {
  signal: MarketSignalResponse;
  divergence: DivergenceResponse;
  markets: ActiveMarketsResponse;
  elapsedMs: number;
}

export const ONCHAIN_FEED_STATUS = {
  contractAddress: "0xC526aB481079549320e8549e390C8B1D471804E1",
  network: "Somnia Shannon Testnet",
  chainId: 50312,
  status: "ACTIVE",
  explorerUrl: "https://shannon-explorer.somnia.network/address/0xC526aB481079549320e8549e390C8B1D471804E1",
};

