import { NextResponse } from "next/server";
import { INITIAL_SIGNALS } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get("asset") || "BTC").toUpperCase();

  const signal = INITIAL_SIGNALS[asset] || INITIAL_SIGNALS.BTC;

  return NextResponse.json({
    asset: signal.asset,
    symbol: signal.symbol,
    
    // Probabilities
    midProbability: Number((signal.midProbability / 100).toFixed(4)),
    microProbability: Number((signal.microProbability / 100).toFixed(4)),
    micropriceAdjustmentPp: signal.micropriceAdjustment,
    upProbability: Number((signal.upProbability / 100).toFixed(4)),
    downProbability: Number((signal.downProbability / 100).toFixed(4)),
    upProbabilityBps: Math.round(signal.upProbability * 100),
    downProbabilityBps: Math.round(signal.downProbability * 100),
    
    // Bayesian Credible Interval
    uncertaintyInterval: [
      Number((signal.uncertaintyInterval[0] / 100).toFixed(4)),
      Number((signal.uncertaintyInterval[1] / 100).toFixed(4)),
    ],
    uncertaintyWidthPp: signal.uncertaintyWidth,

    // Information Dynamics
    entropyBits: signal.entropy,
    informationVelocityBitsPerMin: signal.informationVelocity,
    changePointProbability: signal.changePointProbability,

    // Microstructure
    spread: signal.spread,
    relativeSpread: signal.relativeSpread,
    queueImbalance: signal.queueImbalance,

    // Capital & Concentration
    openInterestUsd: signal.openInterestUsd,
    capitalSkew: Number((signal.capitalSkew / 100).toFixed(4)),
    effectiveParticipants: signal.effectiveParticipants,
    concentrationHhi: signal.concentrationHhi,
    signalIndependence: signal.signalIndependence,

    // Momentum & Regime
    confidence: signal.confidence,
    velocityPerMin: signal.velocityPerMin,
    marketRegime: signal.marketRegime,

    // Cryptographic Provenance
    provenance: signal.provenance,
    timestamp: Math.floor(Date.now() / 1000),
  });
}
