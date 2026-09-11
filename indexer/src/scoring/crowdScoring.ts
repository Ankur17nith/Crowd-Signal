import { keccak256, toHex } from "viem";
import { AssetSymbol, CalculatedMarketSignal, RawMarketWindow } from "../normalize/types.js";

export interface SignalHistoryPoint {
  upProbability: number;
  velocity: number;
  timestamp: number;
}

export class CrowdScoringEngine {
  private history: Map<AssetSymbol, SignalHistoryPoint[]> = new Map();

  public calculateSignal(
    asset: AssetSymbol,
    windows: RawMarketWindow[],
    nowSeconds: number = Math.floor(Date.now() / 1000)
  ): CalculatedMarketSignal {
    const assetKey = keccak256(toHex(asset));

    // 1. Filter active / trading windows
    const active = windows.filter(
      (w) => w.asset === asset && (w.status === "Trading" || w.status === "Listed") && w.expiry > nowSeconds
    );

    if (active.length === 0) {
      // Return neutral baseline with 0 confidence
      return {
        asset,
        assetKey,
        upProbability: 0.5,
        upProbabilityBps: 5000,
        downProbabilityBps: 5000,
        capitalSkew: 0,
        capitalSkewBps: 0,
        confidenceScore: 0,
        velocityBpsPerMin: 0,
        accelerationBpsPerMin2: 0,
        openInterestUsd: 0,
        totalVolumeUsd: 0,
        activeWindowCount: 0,
        marketRegime: "NEUTRAL",
        timestamp: nowSeconds,
      };
    }

    // 2. Aggregate Implied Probability & Capital Skew
    let totalWeight = 0;
    let weightedProbSum = 0;
    let totalOiUp = 0;
    let totalOiDown = 0;
    let totalOi = 0;
    let totalVolume = 0;
    let bestSpreadSum = 0;
    let spreadCount = 0;

    for (const w of active) {
      // Determine per-window implied probability
      let p = 0.5;
      if (w.bestBid !== undefined && w.bestAsk !== undefined && w.bestAsk >= w.bestBid) {
        p = (w.bestBid + w.bestAsk) / 2;
        bestSpreadSum += w.bestAsk - w.bestBid;
        spreadCount++;
      } else if (w.lastPrice !== undefined) {
        p = w.lastPrice;
      }

      // Ensure valid range (0, 1)
      p = Math.max(0.01, Math.min(0.99, p));

      // Weight by window liquidity + base weight
      const weight = Math.max(1, Math.sqrt(w.openInterestUsd + 10));
      weightedProbSum += p * weight;
      totalWeight += weight;

      totalOiUp += w.openInterestUp;
      totalOiDown += w.openInterestDown;
      totalOi += w.openInterestUsd;
      totalVolume += w.cumulativeQuoteVolume;
    }

    const upProb = totalWeight > 0 ? weightedProbSum / totalWeight : 0.5;
    const upProbabilityBps = Math.round(upProb * 10000);
    const downProbabilityBps = 10000 - upProbabilityBps;

    // Capital Skew = (OI_UP - OI_DOWN) / (Total_OI + 1)
    const rawSkew = totalOiUp + totalOiDown > 0 ? (totalOiUp - totalOiDown) / (totalOiUp + totalOiDown) : 0;
    const clampedSkew = Math.max(-1, Math.min(1, rawSkew));
    const capitalSkewBps = Math.round(clampedSkew * 10000);

    // 3. Probability Velocity & Acceleration
    const assetHistory = this.history.get(asset) || [];
    let velocityBpsPerMin = 0;
    let accelerationBpsPerMin2 = 0;

    if (assetHistory.length > 0) {
      const prev = assetHistory[assetHistory.length - 1];
      const deltaMinutes = Math.max(0.05, (nowSeconds - prev.timestamp) / 60);
      const deltaProb = upProb - prev.upProbability;
      const rawVelocityBpsPerMin = (deltaProb * 10000) / deltaMinutes;
      velocityBpsPerMin = Math.round(Math.max(-5000, Math.min(5000, rawVelocityBpsPerMin)));

      const deltaVelocity = (velocityBpsPerMin - prev.velocity) / deltaMinutes;
      accelerationBpsPerMin2 = Math.round(Math.max(-5000, Math.min(5000, deltaVelocity)));
    }

    // Update history (keep last 50 data points)
    assetHistory.push({
      upProbability: upProb,
      velocity: velocityBpsPerMin,
      timestamp: nowSeconds,
    });
    if (assetHistory.length > 50) assetHistory.shift();
    this.history.set(asset, assetHistory);

    // 4. Multi-Factor Market Confidence Score (0 - 100)
    // Component A: Open Interest & Participation (max 30)
    const oiScore = Math.min(30, Math.round(Math.log10(totalOi + 1) * 6));

    // Component B: Spread Tightness (max 30)
    const avgSpread = spreadCount > 0 ? bestSpreadSum / spreadCount : 0.1;
    const spreadScore = Math.min(30, Math.max(0, Math.round((1 - avgSpread / 0.15) * 30)));

    // Component C: Active Window Count & Volume (max 25)
    const windowScore = Math.min(15, active.length * 5);
    const volumeScore = Math.min(10, Math.round(Math.log10(totalVolume + 1) * 2));

    // Component D: Data Freshness (max 15)
    const freshnessScore = 15;

    const confidenceScore = Math.max(10, Math.min(100, oiScore + spreadScore + windowScore + volumeScore + freshnessScore));

    // 5. Market Regime
    let marketRegime: "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH_VOLATILITY" = "NEUTRAL";
    if (Math.abs(velocityBpsPerMin) >= 800) {
      marketRegime = "HIGH_VOLATILITY";
    } else if (upProbabilityBps >= 5800 && capitalSkewBps >= 1000) {
      marketRegime = "BULLISH";
    } else if (upProbabilityBps <= 4200 && capitalSkewBps <= -1000) {
      marketRegime = "BEARISH";
    }

    return {
      asset,
      assetKey,
      upProbability: Number(upProb.toFixed(4)),
      upProbabilityBps,
      downProbabilityBps,
      capitalSkew: Number(clampedSkew.toFixed(4)),
      capitalSkewBps,
      confidenceScore,
      velocityBpsPerMin,
      accelerationBpsPerMin2,
      openInterestUsd: Math.round(totalOi),
      totalVolumeUsd: Math.round(totalVolume),
      activeWindowCount: active.length,
      marketRegime,
      timestamp: nowSeconds,
    };
  }
}
