export type QuantitativeRegime =
  | "STABLE"
  | "TRENDING"
  | "INFORMATION_SHOCK"
  | "HIGH_UNCERTAINTY"
  | "LIQUIDITY_FRAGILE";

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
  upProbability: number;
  downProbability: number;
  microPrice: number;
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

// Verified historical baseline dataset (CS-PROB-2.0 & CS-REPUTATION-2.0)
export const INITIAL_SIGNALS: Record<string, MarketSignal> = {
  BTC: {
    asset: "BTC",
    symbol: "BTC / USDso",
    midProbability: 63.8,
    microProbability: 64.4,
    micropriceAdjustment: 0.6,
    spread: 0.012,
    relativeSpread: 0.019,
    queueImbalance: 0.28,
    upProbability: 64.2,
    downProbability: 35.8,
    uncertaintyInterval: [61.8, 66.4],
    uncertaintyWidth: 4.6,
    entropy: 0.941,
    informationVelocity: -0.018,
    changePointProbability: 0.12,
    openInterestUsd: 182430,
    capitalSkew: 28.4,
    effectiveParticipants: 42.6,
    concentrationHhi: 0.023,
    signalIndependence: 0.84,
    change24h: 7.1,
    velocityPerMin: 7.2,
    confidence: 87,
    marketRegime: "TRENDING",
    activeWindowCount: 4,
    totalVolumeUsd: 91220,
    lastUpdatedSecondsAgo: 2.4,
    provenance: {
      algorithmVersion: "CS-PROB-2.0",
      inputSnapshotHash: "0xa81f4b238d71092eac871295b9c201489e29e388147289f81a749102bc849102",
      signalHash: "0x7291a84f9102bc4891a274910b8364819e018593847291048b19284719283748",
      timestamp: Math.floor(Date.now() / 1000) - 2,
    },
  },
  ETH: {
    asset: "ETH",
    symbol: "ETH / USDso",
    midProbability: 58.4,
    microProbability: 58.9,
    micropriceAdjustment: 0.5,
    spread: 0.016,
    relativeSpread: 0.027,
    queueImbalance: 0.16,
    upProbability: 58.7,
    downProbability: 41.3,
    uncertaintyInterval: [55.9, 61.4],
    uncertaintyWidth: 5.5,
    entropy: 0.978,
    informationVelocity: -0.009,
    changePointProbability: 0.08,
    openInterestUsd: 95400,
    capitalSkew: 16.1,
    effectiveParticipants: 28.4,
    concentrationHhi: 0.035,
    signalIndependence: 0.79,
    change24h: 3.1,
    velocityPerMin: 3.1,
    confidence: 82,
    marketRegime: "STABLE",
    activeWindowCount: 3,
    totalVolumeUsd: 48000,
    lastUpdatedSecondsAgo: 4.1,
    provenance: {
      algorithmVersion: "CS-PROB-2.0",
      inputSnapshotHash: "0x3918471928374819283748192837481928374819283748192837481928374819",
      signalHash: "0x8192837481928374819283748192837481928374819283748192837481928374",
      timestamp: Math.floor(Date.now() / 1000) - 4,
    },
  },
  SOL: {
    asset: "SOL",
    symbol: "SOL / USDso",
    midProbability: 51.5,
    microProbability: 51.9,
    micropriceAdjustment: 0.4,
    spread: 0.022,
    relativeSpread: 0.043,
    queueImbalance: 0.08,
    upProbability: 51.8,
    downProbability: 48.2,
    uncertaintyInterval: [48.1, 55.4],
    uncertaintyWidth: 7.3,
    entropy: 0.999,
    informationVelocity: 0.002,
    changePointProbability: 0.04,
    openInterestUsd: 42100,
    capitalSkew: 5.0,
    effectiveParticipants: 16.2,
    concentrationHhi: 0.062,
    signalIndependence: 0.71,
    change24h: -1.2,
    velocityPerMin: 0.8,
    confidence: 76,
    marketRegime: "HIGH_UNCERTAINTY",
    activeWindowCount: 2,
    totalVolumeUsd: 21500,
    lastUpdatedSecondsAgo: 6.8,
    provenance: {
      algorithmVersion: "CS-PROB-2.0",
      inputSnapshotHash: "0x1928374819283748192837481928374819283748192837481928374819283748",
      signalHash: "0x9182736451928374651928374651928374651928374651928374651928374651",
      timestamp: Math.floor(Date.now() / 1000) - 6,
    },
  },
};

export const INITIAL_MARKETS: EventContractWindow[] = [
  {
    id: "btc-15m-01",
    asset: "BTC",
    title: "BTC 15 MIN EVENT",
    interval: "15m",
    upProbability: 64.2,
    downProbability: 35.8,
    microPrice: 64.4,
    spread: 0.008,
    queueImbalance: 0.28,
    openInterestUsd: 182430,
    volumeUsd: 91220,
    secondsRemaining: 522,
    status: "Trading",
    openPrice: 64250,
    currentTouchBid: 0.638,
    currentTouchAsk: 0.646,
    poolAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  },
  {
    id: "btc-5m-02",
    asset: "BTC",
    title: "BTC 5 MIN EVENT",
    interval: "5m",
    upProbability: 62.0,
    downProbability: 38.0,
    microPrice: 62.3,
    spread: 0.010,
    queueImbalance: 0.15,
    openInterestUsd: 64200,
    volumeUsd: 32100,
    secondsRemaining: 184,
    status: "Trading",
    openPrice: 64310,
    currentTouchBid: 0.615,
    currentTouchAsk: 0.625,
    poolAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  },
  {
    id: "eth-15m-01",
    asset: "ETH",
    title: "ETH 15 MIN EVENT",
    interval: "15m",
    upProbability: 58.7,
    downProbability: 41.3,
    microPrice: 58.9,
    spread: 0.010,
    queueImbalance: 0.16,
    openInterestUsd: 95400,
    volumeUsd: 48000,
    secondsRemaining: 680,
    status: "Trading",
    openPrice: 3465,
    currentTouchBid: 0.582,
    currentTouchAsk: 0.592,
    poolAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  },
  {
    id: "sol-15m-01",
    asset: "SOL",
    title: "SOL 15 MIN EVENT",
    interval: "15m",
    upProbability: 51.8,
    downProbability: 48.2,
    microPrice: 51.9,
    spread: 0.012,
    queueImbalance: 0.08,
    openInterestUsd: 42100,
    volumeUsd: 21500,
    secondsRemaining: 410,
    status: "Trading",
    openPrice: 153.4,
    currentTouchBid: 0.512,
    currentTouchAsk: 0.524,
    poolAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  },
];

export const INITIAL_WINDOWS = INITIAL_MARKETS;

export const INITIAL_PREDICTORS: PredictorProfile[] = [
  {
    address: "0x71A9908C8E645d9441faB8B33Af671239c36892F",
    ensOrShort: "0x71A...92F",
    predictorScore: 91,
    accuracy: 71.4,
    totalPredictions: 247,
    resolvedPredictions: 231,
    bayesianAccuracyMean: 71.1,
    credibleInterval: [65.4, 76.8],
    marketRelativeSkill: 0.182,
    meanBrierScore: 0.174,
    brierDecomposition: {
      reliability: 0.014,
      resolution: 0.068,
      uncertainty: 0.204,
    },
    recencyWeightedSkill: 0.194,
    skillTrend: "IMPROVING",
    calibrationScore: 89,
    consistencyScore: 82,
    currentStreak: 6,
    maxStreak: 14,
    isVerified: true,
    rank: 1,
    recentForm: 76,
    calibrationBuckets: [
      { label: "50%", actualWinRate: 51, expectedConfidence: 50, count: 32 },
      { label: "70%", actualWinRate: 69, expectedConfidence: 70, count: 88 },
      { label: "90%", actualWinRate: 87, expectedConfidence: 90, count: 75 },
    ],
    history: [
      { id: "1", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 78, marketProbabilityAtCall: 52, brierSkillScore: 0.38, outcome: "Correct" },
      { id: "2", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 82, marketProbabilityAtCall: 56, brierSkillScore: 0.42, outcome: "Correct" },
      { id: "3", date: "Sep 11", asset: "ETH", window: "15m", prediction: "DOWN", confidence: 71, marketProbabilityAtCall: 48, brierSkillScore: 0.28, outcome: "Correct" },
      { id: "4", date: "Sep 11", asset: "BTC", window: "5m", prediction: "UP", confidence: 84, marketProbabilityAtCall: 58, brierSkillScore: 0.46, outcome: "Correct" },
      { id: "5", date: "Sep 10", asset: "BTC", window: "15m", prediction: "DOWN", confidence: 64, marketProbabilityAtCall: 45, brierSkillScore: -0.32, outcome: "Incorrect" },
      { id: "6", date: "Sep 10", asset: "ETH", window: "15m", prediction: "UP", confidence: 76, marketProbabilityAtCall: 54, brierSkillScore: 0.35, outcome: "Correct" },
    ],
  },
  {
    address: "0xA91C283F41982bde9204A841E3486a4392C10892",
    ensOrShort: "0xA91...892",
    predictorScore: 86,
    accuracy: 68.3,
    totalPredictions: 148,
    resolvedPredictions: 142,
    bayesianAccuracyMean: 67.8,
    credibleInterval: [60.1, 75.4],
    marketRelativeSkill: 0.145,
    meanBrierScore: 0.188,
    brierDecomposition: {
      reliability: 0.018,
      resolution: 0.052,
      uncertainty: 0.216,
    },
    recencyWeightedSkill: 0.148,
    skillTrend: "STABLE",
    calibrationScore: 85,
    consistencyScore: 84,
    currentStreak: 4,
    maxStreak: 11,
    isVerified: true,
    rank: 2,
    recentForm: 72,
    calibrationBuckets: [
      { label: "50%", actualWinRate: 53, expectedConfidence: 50, count: 20 },
      { label: "70%", actualWinRate: 67, expectedConfidence: 70, count: 62 },
      { label: "90%", actualWinRate: 84, expectedConfidence: 90, count: 44 },
    ],
    history: [
      { id: "7", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 75, marketProbabilityAtCall: 53, brierSkillScore: 0.32, outcome: "Correct" },
      { id: "8", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 80, marketProbabilityAtCall: 55, brierSkillScore: 0.39, outcome: "Correct" },
      { id: "9", date: "Sep 10", asset: "ETH", window: "15m", prediction: "UP", confidence: 70, marketProbabilityAtCall: 51, brierSkillScore: -0.48, outcome: "Incorrect" },
    ],
  },
  {
    address: "0x72BC908221804B3519c8120dE3F57108947231A8",
    ensOrShort: "0x72B...1A8",
    predictorScore: 81,
    accuracy: 66.3,
    totalPredictions: 104,
    resolvedPredictions: 98,
    bayesianAccuracyMean: 65.7,
    credibleInterval: [56.4, 74.9],
    marketRelativeSkill: 0.118,
    meanBrierScore: 0.196,
    brierDecomposition: {
      reliability: 0.022,
      resolution: 0.046,
      uncertainty: 0.223,
    },
    recencyWeightedSkill: 0.112,
    skillTrend: "STABLE",
    calibrationScore: 80,
    consistencyScore: 78,
    currentStreak: 2,
    maxStreak: 9,
    isVerified: true,
    rank: 3,
    recentForm: 68,
    calibrationBuckets: [
      { label: "50%", actualWinRate: 54, expectedConfidence: 50, count: 18 },
      { label: "70%", actualWinRate: 65, expectedConfidence: 70, count: 50 },
      { label: "90%", actualWinRate: 82, expectedConfidence: 90, count: 30 },
    ],
    history: [
      { id: "10", date: "Sep 11", asset: "BTC", window: "15m", prediction: "DOWN", confidence: 71, marketProbabilityAtCall: 46, brierSkillScore: 0.27, outcome: "Correct" },
      { id: "11", date: "Sep 10", asset: "ETH", window: "15m", prediction: "DOWN", confidence: 66, marketProbabilityAtCall: 47, brierSkillScore: 0.22, outcome: "Correct" },
    ],
  },
  {
    // The "Lucky Gambler" (2 predictions, 100% win rate -> Score 42, NOT verified due to Bayesian Credible lower bound and sample threshold)
    address: "0x38B5201A94C720a4b0811eE924C108529C0098F2",
    ensOrShort: "0x38B...8F2",
    predictorScore: 42,
    accuracy: 100.0,
    totalPredictions: 2,
    resolvedPredictions: 2,
    bayesianAccuracyMean: 66.7,
    credibleInterval: [29.1, 98.2], // Wide uncertainty interval!
    marketRelativeSkill: 0.082,
    meanBrierScore: 0.052,
    brierDecomposition: {
      reliability: 0.038,
      resolution: 0.000,
      uncertainty: 0.000,
    },
    recencyWeightedSkill: 0.082,
    skillTrend: "STABLE",
    calibrationScore: 50,
    consistencyScore: 40,
    currentStreak: 2,
    maxStreak: 2,
    isVerified: false,
    rank: 15,
    recentForm: 50,
    calibrationBuckets: [],
    history: [
      { id: "13", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 95, marketProbabilityAtCall: 54, brierSkillScore: 0.62, outcome: "Correct" },
      { id: "14", date: "Sep 11", asset: "ETH", window: "15m", prediction: "UP", confidence: 90, marketProbabilityAtCall: 52, brierSkillScore: 0.58, outcome: "Correct" },
    ],
  },
];

export const INITIAL_DIVERGENCE: DivergenceData = {
  asset: "BTC",
  crowdUpProbability: 64,
  topPredictorConsensus: 48,
  divergencePercent: 16,
  effectivePredictorCount: 11.4,
  persistenceScore: 84,
  interpretation: "Crowd is significantly more bullish (+16%) than historically accurate predictors.",
  topPredictorCount: 14,
};

export const ONCHAIN_FEED_STATUS = {
  contractAddress: "0xC526aB481079549320e8549e390C8B1D471804E1",
  network: "Somnia Shannon Testnet",
  chainId: 50312,
  lastUpdatedSecondsAgo: 2.4,
  blockNumber: 14892014,
  status: "ACTIVE",
  explorerUrl: "https://shannon-explorer.somnia.network/address/0xC526aB481079549320e8549e390C8B1D471804E1",
};
