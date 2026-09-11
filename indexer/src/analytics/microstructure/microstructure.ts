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
    const bid = window.bestBid ?? window.lastPrice;
    const ask = window.bestAsk ?? window.lastPrice;
    
    if (bid === undefined || ask === undefined) {
      return {
        midPrice: 0,
        spread: 0,
        relativeSpread: 0,
        queueImbalance: 0,
        microPrice: 0,
        micropriceAdjustment: 0,
      };
    }

    // Midpoint
    const midPrice = (bid + ask) / 2;
    const spread = Math.max(0, ask - bid);
    const relativeSpread = midPrice > 0 ? spread / midPrice : 0;

    // Queue depth imbalance
    const bidDepth = window.bidDepth ?? 0;
    const askDepth = window.askDepth ?? 0;
    const totalDepth = bidDepth + askDepth;
    
    // Imbalance in [-1, +1]: positive means excess bid demand, negative means excess ask supply
    const queueImbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;

    // Microprice: order-book informed fair estimator
    // P_micro = P_mid + (QueueImbalance * spread / 2)
    const rawMicroPrice = midPrice + (queueImbalance * spread) / 2;
    const microPrice = Math.max(0.001, Math.min(0.999, rawMicroPrice));
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
    const validWindows = windows.filter(
      (w) => (w.bestBid !== undefined && w.bestAsk !== undefined) || (w.lastPrice !== undefined && w.lastPrice > 0)
    );

    if (validWindows.length === 0) {
      return {
        midPrice: 0,
        spread: 0,
        relativeSpread: 0,
        queueImbalance: 0,
        microPrice: 0,
        micropriceAdjustment: 0,
      };
    }

    let totalWeight = 0;
    let weightedMid = 0;
    let weightedMicro = 0;
    let weightedSpread = 0;
    let weightedImbalance = 0;

    for (const w of validWindows) {
      const metrics = this.calculateWindowMicrostructure(w);
      const weight = Math.max(1, Math.sqrt((w.cumulativeQuoteVolume || 1) + 1));

      weightedMid += metrics.midPrice * weight;
      weightedMicro += metrics.microPrice * weight;
      weightedSpread += metrics.spread * weight;
      weightedImbalance += metrics.queueImbalance * weight;
      totalWeight += weight;
    }

    const midPrice = totalWeight > 0 ? weightedMid / totalWeight : 0;
    const microPrice = totalWeight > 0 ? weightedMicro / totalWeight : 0;
    const spread = totalWeight > 0 ? weightedSpread / totalWeight : 0;
    const relativeSpread = midPrice > 0 ? spread / midPrice : 0;
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
