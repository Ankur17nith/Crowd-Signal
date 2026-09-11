export type AssetSymbol = "BTC" | "ETH" | "SOL" | "SOMI";

export type OutcomeDirection = "UP" | "DOWN";

export interface RawMarketWindow {
  marketId: string;
  asset: AssetSymbol;
  symbol: string;
  intervalSec: number;
  openPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  lastPrice?: number;
  openInterestUsd: number;
  openInterestUp: number;
  openInterestDown: number;
  cumulativeQuoteVolume: number;
  tradeCount: number;
  status: "Listed" | "Trading" | "Locked" | "Finalized" | "Voided";
  expiry: number;
  timestamp: number;
}

export interface RawTradeFill {
  fillId: string;
  marketId: string;
  trader: `0x${string}`;
  direction: OutcomeDirection;
  price: number; // 0 to 1
  size: number;  // contract count
  quoteAmount: number; // USD value
  timestamp: number;
}

export interface CalculatedMarketSignal {
  asset: AssetSymbol;
  assetKey: `0x${string}`;
  upProbability: number;         // 0 - 1
  upProbabilityBps: number;      // 0 - 10000
  downProbabilityBps: number;    // 0 - 10000
  capitalSkew: number;           // -1 to +1
  capitalSkewBps: number;        // -10000 to +10000
  confidenceScore: number;       // 0 - 100
  velocityBpsPerMin: number;     // bps per minute
  accelerationBpsPerMin2: number;// bps per minute^2
  openInterestUsd: number;
  totalVolumeUsd: number;
  activeWindowCount: number;
  marketRegime: "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH_VOLATILITY";
  timestamp: number;
}

export interface CalculatedTraderReputation {
  address: `0x${string}`;
  totalPredictions: number;
  resolvedPredictions: number;
  correctPredictions: number;
  accuracy: number;             // 0 - 1
  accuracyBps: number;          // 0 - 10000
  predictorScore: number;       // 0 - 100 (Wilson lower-bound adjusted)
  calibrationScore: number;     // 0 - 100 (Brier-derived)
  consistencyScore: number;     // 0 - 100
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
  timestamp: number;
}
