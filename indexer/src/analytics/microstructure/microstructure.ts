import { MicrostructureMetrics, ObservedMarketWindow } from "../../normalize/types.js";

/**
 * Market Microstructure Engine
 * Implements order-book queue imbalance, spread dynamics, and order-book-informed microprice estimation.
 * Reference: Stoikov, S. (2018). "The Micro-Price: A High-Frequency Estimator of Future Prices."
 */
export class MicrostructureEngine {
  /**
   * Calculate microstructure metrics for a single market window with depth information
   */
  public static calculateWindowMicrostructure(window: ObservedMarketWindow): MicrostructureMetrics {
    const bid = window.bestBid ?? window.lastPrice ?? 0.5;
    const ask = window.bestAsk ?? window.lastPrice ?? 0.5;
    
    // Midpoint
    const midPrice = (bid + ask) / 2;
    const spread = Math.max(0, ask - bid);
    const relativeSpread = midPrice > 0 ? spread / midPrice : 0;

    // Queue depth imbalance
    const bidDepth = window.bidDepth ?? 100;
    const askDepth = window.askDepth ?? 100;
    const totalDepth = bidDepth + askDepth;
    
    // Imbalance in [-1, +1]: positive means excess bid demand, negative means excess ask supply
    const queueImbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;

    // Microprice: order-book informed fair estimator
    // P_micro = P_mid + (QueueImbalance * spread / 2)
    const rawMicroPrice = midPrice + (queueImbalance * spread) / 2;
    const microPrice = Math.max(0.01, Math.min(0.99, rawMicroPrice));
    const micropriceAdjustment = microPrice - midPrice;

    return {
      midPrice: Number(midPrice.toFixed(4)),
      spread: Number(spread.toFixed(4)),
      relativeSpread: Number(relativeSpread.toFixed(4)),
      queueImbalance: Number(queueImbalance.toFixed(4)),
      microPrice: Number(microPrice.toFixed(4)),
      micropriceAdjustment: Number(micropriceAdjustment.toFixed(4)),
    };
  }

  /**
   * Aggregate microstructure across multiple active windows for an asset
   */
  public static aggregateMicrostructure(windows: ObservedMarketWindow[]): MicrostructureMetrics {
    if (windows.length === 0) {
      return {
        midPrice: 0.5,
        spread: 0.02,
        relativeSpread: 0.04,
        queueImbalance: 0,
        microPrice: 0.5,
        micropriceAdjustment: 0,
      };
    }

    let totalWeight = 0;
    let weightedMid = 0;
    let weightedMicro = 0;
    let weightedSpread = 0;
    let weightedImbalance = 0;

    for (const w of windows) {
      const metrics = this.calculateWindowMicrostructure(w);
      const weight = Math.max(1, Math.sqrt((w.cumulativeQuoteVolume || 10) + 1));

      weightedMid += metrics.midPrice * weight;
      weightedMicro += metrics.microPrice * weight;
      weightedSpread += metrics.spread * weight;
      weightedImbalance += metrics.queueImbalance * weight;
      totalWeight += weight;
    }

    const midPrice = totalWeight > 0 ? weightedMid / totalWeight : 0.5;
    const microPrice = totalWeight > 0 ? weightedMicro / totalWeight : 0.5;
    const spread = totalWeight > 0 ? weightedSpread / totalWeight : 0.02;
    const relativeSpread = midPrice > 0 ? spread / midPrice : 0.04;
    const queueImbalance = totalWeight > 0 ? weightedImbalance / totalWeight : 0;

    return {
      midPrice: Number(midPrice.toFixed(4)),
      spread: Number(spread.toFixed(4)),
      relativeSpread: Number(relativeSpread.toFixed(4)),
      queueImbalance: Number(queueImbalance.toFixed(4)),
      microPrice: Number(microPrice.toFixed(4)),
      micropriceAdjustment: Number((microPrice - midPrice).toFixed(4)),
    };
  }
}
