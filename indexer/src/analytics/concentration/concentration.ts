import { ConcentrationMetrics } from "../../normalize/types.js";

/**
 * Participant Concentration & Effective Sample Size Engine
 * Answers: Is this truly a broad crowd signal or dominated by a small cartel of whale wallets?
 * Computes Herfindahl-Hirschman Index (HHI) and Effective Participant Count (N_eff = 1 / HHI).
 */
export class ConcentrationEngine {
  /**
   * Calculate concentration metrics given an array of capital exposures per wallet
   */
  public static calculateConcentration(walletExposures: { wallet: string; exposureUsd: number }[]): ConcentrationMetrics {
    if (walletExposures.length === 0) {
      return {
        top1Share: 0,
        top5Share: 0,
        top10Share: 0,
        hhi: 0,
        effectiveParticipantCount: 0,
        signalIndependenceScore: 0.5,
      };
    }

    const totalExposure = walletExposures.reduce((sum, w) => sum + Math.abs(w.exposureUsd), 0);
    if (totalExposure === 0) {
      return {
        top1Share: 0,
        top5Share: 0,
        top10Share: 0,
        hhi: 0,
        effectiveParticipantCount: walletExposures.length,
        signalIndependenceScore: 0.8,
      };
    }

    // Sort descending by capital exposure
    const sorted = [...walletExposures]
      .map((w) => Math.abs(w.exposureUsd) / totalExposure)
      .sort((a, b) => b - a);

    const top1Share = sorted[0] || 0;
    const top5Share = sorted.slice(0, 5).reduce((a, b) => a + b, 0);
    const top10Share = sorted.slice(0, 10).reduce((a, b) => a + b, 0);

    // Herfindahl-Hirschman Index HHI = sum(s_i^2)
    const hhi = sorted.reduce((sum, s) => sum + s * s, 0);

    // Effective Participant Count N_eff = 1 / HHI
    const effectiveParticipantCount = hhi > 0 ? 1 / hhi : sorted.length;

    // Signal Independence Score penalizes heavy concentration
    const rawIndependence = Math.max(0.05, Math.min(1.0, (1 - top1Share * 0.8) * Math.min(1.0, effectiveParticipantCount / 20)));
    const signalIndependenceScore = Number(rawIndependence.toFixed(4));

    return {
      top1Share: Number(top1Share.toFixed(4)),
      top5Share: Number(top5Share.toFixed(4)),
      top10Share: Number(top10Share.toFixed(4)),
      hhi: Number(hhi.toFixed(4)),
      effectiveParticipantCount: Number(effectiveParticipantCount.toFixed(1)),
      signalIndependenceScore,
    };
  }

  /**
   * Derive estimated concentration from market trade count and volume when wallet-level granular logs are buffered
   */
  public static estimateFromAggregates(tradeCount: number, volumeUsd: number): ConcentrationMetrics {
    if (tradeCount <= 0) {
      return {
        top1Share: 1.0,
        top5Share: 1.0,
        top10Share: 1.0,
        hhi: 1.0,
        effectiveParticipantCount: 1,
        signalIndependenceScore: 0.1,
      };
    }

    // Power-law approximation for limit order markets: N_eff ~ sqrt(tradeCount) * 1.8
    const estimatedNeff = Math.max(1, Math.min(tradeCount, Math.round(Math.sqrt(tradeCount) * 1.8)));
    const hhi = 1 / estimatedNeff;
    const top1Share = Math.min(0.8, Math.max(0.08, 1.8 / Math.sqrt(tradeCount + 2)));
    const top5Share = Math.min(0.95, top1Share * 2.5);
    const top10Share = Math.min(1.0, top1Share * 3.8);

    const signalIndependenceScore = Number(Math.max(0.1, Math.min(0.95, 1 - top1Share)).toFixed(4));

    return {
      top1Share: Number(top1Share.toFixed(4)),
      top5Share: Number(top5Share.toFixed(4)),
      top10Share: Number(top10Share.toFixed(4)),
      hhi: Number(hhi.toFixed(4)),
      effectiveParticipantCount: estimatedNeff,
      signalIndependenceScore,
    };
  }
}
