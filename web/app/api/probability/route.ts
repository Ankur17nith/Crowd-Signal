import { NextResponse } from "next/server";
import { INITIAL_SIGNALS } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get("asset") || "BTC").toUpperCase();

  const signal = INITIAL_SIGNALS[asset] || INITIAL_SIGNALS.BTC;

  return NextResponse.json({
    asset: signal.asset,
    symbol: signal.symbol,
    upProbability: Number((signal.upProbability / 100).toFixed(4)),
    downProbability: Number((signal.downProbability / 100).toFixed(4)),
    upProbabilityBps: Math.round(signal.upProbability * 100),
    downProbabilityBps: Math.round(signal.downProbability * 100),
    openInterestUsd: signal.openInterestUsd,
    capitalSkew: Number((signal.capitalSkew / 100).toFixed(4)),
    confidence: signal.confidence,
    velocityPerMin: signal.velocityPerMin,
    marketRegime: signal.marketRegime,
    timestamp: Math.floor(Date.now() / 1000),
  });
}
