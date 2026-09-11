# CrowdSignal Data Model Specification

## 1. On-Chain Data Model (Solidity Storage)

### 1.1 `MarketSignal` Struct (`SentimentPublisher.sol`)
Stored in `mapping(bytes32 => MarketSignal) private _signals;`

```solidity
struct MarketSignal {
    uint16 upProbabilityBps;      // Implied probability in BPS (0 - 10000). e.g. 6420 = 64.20%
    int16 capitalSkewBps;         // Directional open interest bias in BPS (-10000 to +10000). e.g. +2840 = +28.40%
    uint16 confidenceScore;       // Statistical confidence score (0 - 100)
    int16 velocityBpsPerMin;      // Rolling 1m rate of change in BPS/min. e.g. +720 = +7.2%/min
    int16 accelerationBpsPerMin2; // Rolling 1m second derivative in BPS/min²
    uint64 timestamp;             // Unix timestamp of calculation
    uint64 openInterestUsd;       // Total active capital commitment in USD (scaled to whole units)
    uint64 totalVolumeUsd;        // Cumulative traded volume in USD
    uint32 activeWindowCount;     // Number of active concurrent contract windows aggregated
}
```

### 1.2 `PredictorReputation` Struct (`ReputationRegistry.sol`)
Stored in `mapping(address => PredictorReputation) private _reputations;`

```solidity
struct PredictorReputation {
    uint32 totalPredictions;       // Lifetime orders/predictions placed
    uint32 resolvedPredictions;    // Predictions matched against finalized outcomes
    uint32 correctPredictions;     // Directionally winning predictions
    uint16 predictorScore;         // Composite Bayesian-Wilson score (0 - 100)
    uint16 accuracyBps;            // Historical directional win rate in BPS (0 - 10000)
    uint16 calibrationScore;       // Probability calibration score (0 - 100)
    uint16 consistencyScore;       // Temporal stability score (0 - 100)
    uint32 currentStreak;          // Current consecutive wins
    uint32 maxStreak;              // Lifetime peak consecutive wins
    uint64 lastActiveTimestamp;    // Timestamp of last recorded call
}
```

---

## 2. Off-Chain Indexer Data Model (Database / Store)

### 2.1 Market Window Record (`RawMarketWindow`)
```typescript
interface RawMarketWindow {
  marketId: string;              // Unique Somnia market identifier
  asset: "BTC" | "ETH" | "SOL";  // Base underlying asset
  symbol: string;                // e.g. "BTC-15M-UPDOWN"
  intervalSec: number;           // Cadence in seconds (e.g. 300, 900)
  openPrice: number;             // Opening strike reference price
  bestBid?: number;              // Current top bid on order book (0 to 1)
  bestAsk?: number;              // Current top ask on order book (0 to 1)
  lastPrice?: number;            // Last matched fill price
  openInterestUsd: number;       // Combined escrow collateral
  openInterestUp: number;        // UP-side escrowed collateral
  openInterestDown: number;      // DOWN-side escrowed collateral
  cumulativeQuoteVolume: number; // Volume in USDso
  tradeCount: number;            // Fill count
  status: "Trading" | "Locked" | "Finalized" | "Voided";
  expiry: number;                // Expiration timestamp
  timestamp: number;
}
```

### 2.2 Resolved Prediction Call Record (`TraderResolvedCall`)
```typescript
interface TraderResolvedCall {
  predictionId: string;
  trader: `0x${string}`;
  asset: "BTC" | "ETH" | "SOL";
  direction: "UP" | "DOWN";
  confidence: number;            // Stated or price-implied probability (0.50 to 1.00)
  actualOutcome: "UP" | "DOWN";  // Settled oracle result
  isCorrect: boolean;
  stakeUsd: number;
  timestamp: number;
}
```

### 2.3 Crowd vs Predictor Divergence (`CrowdVsPredictorDivergence`)
```typescript
interface CrowdVsPredictorDivergence {
  asset: "BTC" | "ETH" | "SOL";
  crowdUpProbabilityBps: number;  // Whole market implied probability (e.g. 6400)
  predictorConsensusBps: number;  // Consensus of verified predictors (e.g. 4800)
  divergenceBps: number;          // Absolute difference (e.g. 1600)
  divergencePercent: number;      // e.g. 16.0%
  interpretation: string;         // Plain English synthesis
  topPredictorCount: number;      // Count of verified predictors in consensus
  timestamp: number;
}
```
