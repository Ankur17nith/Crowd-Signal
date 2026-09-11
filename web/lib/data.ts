export interface MarketSignal {
  asset: "BTC" | "ETH" | "SOL" | "SOMI";
  symbol: string;
  upProbability: number;
  downProbability: number;
  openInterestUsd: number;
  capitalSkew: number; // e.g. +28.4%
  change24h: number;   // e.g. +7.1%
  velocityPerMin: number; // e.g. +7.2%/min
  confidence: number;  // 0 - 100
  marketRegime: "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH_VOLATILITY";
  activeWindowCount: number;
  totalVolumeUsd: number;
  lastUpdatedSecondsAgo: number;
}

export interface EventContractWindow {
  id: string;
  asset: "BTC" | "ETH" | "SOL" | "SOMI";
  title: string;
  interval: string;
  upProbability: number;
  downProbability: number;
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
    outcome: "Correct" | "Incorrect" | "Pending";
  }[];
}

export interface DivergenceData {
  asset: "BTC" | "ETH";
  crowdUpProbability: number;
  topPredictorConsensus: number;
  divergencePercent: number;
  interpretation: string;
  topPredictorCount: number;
}

// Initial authoritative data state
export const INITIAL_SIGNALS: Record<string, MarketSignal> = {
  BTC: {
    asset: "BTC",
    symbol: "BTC / USDso",
    upProbability: 64.2,
    downProbability: 35.8,
    openInterestUsd: 182430,
    capitalSkew: 28.4,
    change24h: 7.1,
    velocityPerMin: 7.2,
    confidence: 87,
    marketRegime: "BULLISH",
    activeWindowCount: 4,
    totalVolumeUsd: 91220,
    lastUpdatedSecondsAgo: 2.4,
  },
  ETH: {
    asset: "ETH",
    symbol: "ETH / USDso",
    upProbability: 58.7,
    downProbability: 41.3,
    openInterestUsd: 95400,
    capitalSkew: 16.1,
    change24h: 3.1,
    velocityPerMin: 3.1,
    confidence: 82,
    marketRegime: "BULLISH",
    activeWindowCount: 3,
    totalVolumeUsd: 48000,
    lastUpdatedSecondsAgo: 4.1,
  },
  SOL: {
    asset: "SOL",
    symbol: "SOL / USDso",
    upProbability: 51.8,
    downProbability: 48.2,
    openInterestUsd: 42100,
    capitalSkew: 5.0,
    change24h: -1.2,
    velocityPerMin: 0.8,
    confidence: 76,
    marketRegime: "NEUTRAL",
    activeWindowCount: 2,
    totalVolumeUsd: 21500,
    lastUpdatedSecondsAgo: 6.8,
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
    openInterestUsd: 182430,
    volumeUsd: 91220,
    secondsRemaining: 522, // 08:42
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
    openInterestUsd: 64200,
    volumeUsd: 32100,
    secondsRemaining: 184, // 03:04
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
    openInterestUsd: 95400,
    volumeUsd: 48000,
    secondsRemaining: 680, // 11:20
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
    openInterestUsd: 42100,
    volumeUsd: 21500,
    secondsRemaining: 410, // 06:50
    status: "Trading",
    openPrice: 153.4,
    currentTouchBid: 0.512,
    currentTouchAsk: 0.524,
    poolAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  },
];

export const INITIAL_PREDICTORS: PredictorProfile[] = [
  {
    address: "0x71A9908C8E645d9441faB8B33Af671239c36892F",
    ensOrShort: "0x71A...92F",
    predictorScore: 91,
    accuracy: 71.4,
    totalPredictions: 247,
    resolvedPredictions: 231,
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
      { id: "1", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 78, outcome: "Correct" },
      { id: "2", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 82, outcome: "Correct" },
      { id: "3", date: "Sep 11", asset: "ETH", window: "15m", prediction: "DOWN", confidence: 71, outcome: "Correct" },
      { id: "4", date: "Sep 11", asset: "BTC", window: "5m", prediction: "UP", confidence: 84, outcome: "Correct" },
      { id: "5", date: "Sep 10", asset: "BTC", window: "15m", prediction: "DOWN", confidence: 64, outcome: "Incorrect" },
      { id: "6", date: "Sep 10", asset: "ETH", window: "15m", prediction: "UP", confidence: 76, outcome: "Correct" },
    ],
  },
  {
    address: "0xA91C283F41982bde9204A841E3486a4392C10892",
    ensOrShort: "0xA91...892",
    predictorScore: 86,
    accuracy: 68.3,
    totalPredictions: 148,
    resolvedPredictions: 142,
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
      { id: "7", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 75, outcome: "Correct" },
      { id: "8", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 80, outcome: "Correct" },
      { id: "9", date: "Sep 10", asset: "ETH", window: "15m", prediction: "UP", confidence: 70, outcome: "Incorrect" },
    ],
  },
  {
    address: "0x72BC908221804B3519c8120dE3F57108947231A8",
    ensOrShort: "0x72B...1A8",
    predictorScore: 81,
    accuracy: 66.3,
    totalPredictions: 104,
    resolvedPredictions: 98,
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
      { id: "10", date: "Sep 11", asset: "BTC", window: "15m", prediction: "DOWN", confidence: 71, outcome: "Correct" },
      { id: "11", date: "Sep 10", asset: "ETH", window: "15m", prediction: "DOWN", confidence: 66, outcome: "Correct" },
    ],
  },
  {
    address: "0x91C80415A99B22c1076612DaF089E4160412891C",
    ensOrShort: "0x91C...91C",
    predictorScore: 77,
    accuracy: 64.1,
    totalPredictions: 82,
    resolvedPredictions: 78,
    calibrationScore: 78,
    consistencyScore: 76,
    currentStreak: 3,
    maxStreak: 7,
    isVerified: true,
    rank: 4,
    recentForm: 64,
    calibrationBuckets: [
      { label: "50%", actualWinRate: 52, expectedConfidence: 50, count: 15 },
      { label: "70%", actualWinRate: 63, expectedConfidence: 70, count: 40 },
    ],
    history: [
      { id: "12", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 68, outcome: "Correct" },
    ],
  },
  {
    // The "Lucky Trader" (2 predictions, 100% win rate -> Score 42, NOT verified)
    address: "0x38B5201A94C720a4b0811eE924C108529C0098F2",
    ensOrShort: "0x38B...8F2",
    predictorScore: 42,
    accuracy: 100.0,
    totalPredictions: 2,
    resolvedPredictions: 2,
    calibrationScore: 50,
    consistencyScore: 40,
    currentStreak: 2,
    maxStreak: 2,
    isVerified: false,
    rank: 15,
    recentForm: 50,
    calibrationBuckets: [],
    history: [
      { id: "13", date: "Sep 11", asset: "BTC", window: "15m", prediction: "UP", confidence: 95, outcome: "Correct" },
      { id: "14", date: "Sep 11", asset: "ETH", window: "15m", prediction: "UP", confidence: 90, outcome: "Correct" },
    ],
  },
];

export const INITIAL_DIVERGENCE: DivergenceData = {
  asset: "BTC",
  crowdUpProbability: 64,
  topPredictorConsensus: 48,
  divergencePercent: 16,
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
