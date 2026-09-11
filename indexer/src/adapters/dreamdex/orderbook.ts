export interface CanonicalOrderbookSnapshot {
  marketId: string;
  timestamp: number;
  bestBid?: number;
  bestAsk?: number;
  midpoint?: number;
  spread?: number;
  relativeSpread?: number;
  bidDepth?: number;
  askDepth?: number;
  queueImbalance?: number;
  microprice?: number;
}

export class DreamDexOrderbookAdapter {
  /**
   * Compute standard microstructure metrics from observed quotes and depth
   */
  public static computeMicrostructure(
    marketId: string,
    bestBid?: number,
    bestAsk?: number,
    bidDepth?: number,
    askDepth?: number,
    timestamp = Math.floor(Date.now() / 1000)
  ): CanonicalOrderbookSnapshot {
    if (bestBid === undefined || bestAsk === undefined) {
      return {
        marketId,
        timestamp,
        bestBid,
        bestAsk,
      };
    }

    const midpoint = (bestBid + bestAsk) / 2;
    const spread = Math.max(0, bestAsk - bestBid);
    const relativeSpread = midpoint > 0 ? spread / midpoint : 0;

    let queueImbalance: number | undefined = undefined;
    let microprice: number | undefined = undefined;

    if (bidDepth !== undefined && askDepth !== undefined && (bidDepth + askDepth) > 0) {
      // Queue imbalance in [-1, 1]
      queueImbalance = (bidDepth - askDepth) / (bidDepth + askDepth);

      // Stoikov (2018) order-book weighted microprice
      microprice = (bestAsk * bidDepth + bestBid * askDepth) / (bidDepth + askDepth);
      // Bound to valid probability domain
      microprice = Math.max(0.01, Math.min(0.99, microprice));
    }

    return {
      marketId,
      timestamp,
      bestBid,
      bestAsk,
      midpoint,
      spread,
      relativeSpread,
      bidDepth,
      askDepth,
      queueImbalance,
      microprice,
    };
  }
}
