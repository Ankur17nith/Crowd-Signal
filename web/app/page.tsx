"use client";

import React, { useState } from "react";
import { SentimentGauge } from "@/components/sentiment/SentimentGauge";
import { CrowdVsPredictors } from "@/components/dashboard/CrowdVsPredictors";
import { ActiveMarketsTable } from "@/components/markets/ActiveMarketsTable";
import { SettlementFeed } from "@/components/sentiment/SettlementFeed";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { useOverview } from "@/lib/queries";

export default function OverviewPage() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH">("BTC");

  // Single aggregated query eliminating request waterfalls (CS-PERF-2.0)
  const { data: overview, isLoading, error } = useOverview(selectedAsset);

  const signalResp = overview?.signal;
  const divResp = overview?.divergence;
  const marketsResp = overview?.markets;

  const signal = (signalResp?.status === "live" || signalResp?.status === "delayed") ? signalResp.data : null;
  const divergence = (divResp?.status === "live" || divResp?.status === "delayed") ? divResp.data : null;
  const markets = (marketsResp?.status === "live" || marketsResp?.status === "delayed") ? marketsResp.markets : [];

  const gaugeStatus = isLoading
    ? "loading"
    : error
    ? "error"
    : signalResp?.status === "live"
    ? "live"
    : signalResp?.status === "delayed"
    ? "delayed"
    : "unavailable";

  return (
    <div className="max-w-[1080px] w-full mx-auto space-y-10">
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-[#292929]">
        <div className="space-y-1">
          <h1 className="text-[32px] leading-[38px] font-semibold text-[#F5F5F5] tracking-tight">
            CrowdSignal
          </h1>
          <div className="font-mono text-[14px] text-[#A1A1A1] uppercase tracking-wider">
            Live Event Intelligence
          </div>
          <p className="text-[14px] leading-relaxed text-[#707070] pt-1">
            Capital-backed expectations derived from DreamDEX Event Contracts on Somnia.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          {/* Segmented Control */}
          <div className="inline-flex p-0.5 rounded bg-[#0A0A0A] border border-[#292929]">
            <button
              type="button"
              onClick={() => setSelectedAsset("BTC")}
              className={`px-3 py-1 rounded text-[13px] font-medium transition-colors ${
                selectedAsset === "BTC"
                  ? "bg-[#292929] text-white"
                  : "text-[#707070] hover:text-[#A1A1A1]"
              }`}
            >
              BTC
            </button>
            <button
              type="button"
              onClick={() => setSelectedAsset("ETH")}
              className={`px-3 py-1 rounded text-[13px] font-medium transition-colors ${
                selectedAsset === "ETH"
                  ? "bg-[#292929] text-white"
                  : "text-[#707070] hover:text-[#A1A1A1]"
              }`}
            >
              ETH
            </button>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded text-[12px] font-mono text-[#A1A1A1] bg-[#141414] border border-[#292929]">
            <span className={`w-[6px] h-[6px] rounded-full inline-block ${gaugeStatus === "live" ? "bg-[#4DA3FF]" : gaugeStatus === "delayed" ? "bg-[#E7A94B]" : "bg-[#707070]"}`} />
            <span>{gaugeStatus === "live" ? "Live · Shannon" : gaugeStatus === "delayed" ? "Delayed Feed" : "Somnia Shannon"}</span>
          </div>
        </div>
      </header>

      {/* 2. Primary Sentiment Centerpiece (The Sentiment Gauge) */}
      <SentimentGauge
        asset={selectedAsset}
        interval="15 MIN"
        status={gaugeStatus}
        unavailableMessage={signalResp?.status === "unavailable" ? signalResp.message : undefined}
        freshnessSeconds={signalResp?.status === "delayed" ? signalResp.freshnessSeconds : undefined}
        upProbability={signal?.upProbability}
        downProbability={signal?.downProbability}
        openInterestUsd={signal?.openInterestUsd}
        capitalSkew={signal?.capitalSkew}
        velocityPerMin={signal?.velocityPerMin}
        confidence={signal?.confidence}
        marketRegime={signal?.marketRegime}
        uncertaintyInterval={signal?.uncertaintyInterval}
        uncertaintyWidth={signal?.uncertaintyWidth}
        midProbability={signal?.midProbability}
        microProbability={signal?.microProbability}
        micropriceAdjustment={signal?.micropriceAdjustment}
        entropy={signal?.entropy}
        informationVelocity={signal?.informationVelocity}
        changePointProbability={signal?.changePointProbability}
        effectiveParticipants={signal?.effectiveParticipants}
        concentrationHhi={signal?.concentrationHhi}
        signalIndependence={signal?.signalIndependence}
      />

      {/* 3. Crowd vs. Verified Predictors (Signature Divergence Feature) */}
      {signal && (
        <CrowdVsPredictors
          crowdUpProbability={signal.upProbability}
          crowdVolumeUsd={signal.totalVolumeUsd}
          crowdWalletsCount={Math.round(signal.effectiveParticipants || 0)}
          verifiedUpProbability={divergence?.topPredictorConsensus ?? signal.upProbability}
          verifiedVolumeUsd={signal.openInterestUsd}
          verifiedWalletsCount={divergence?.topPredictorCount ?? 0}
          divergencePp={divergence?.divergencePercent ?? 0}
          divergenceDirection={
            (divergence?.divergencePercent ?? 0) === 0
              ? "CONSENSUS_ALIGNED"
              : signal.upProbability > (divergence?.topPredictorConsensus ?? signal.upProbability)
              ? "BULLISH_SKEW"
              : "BEARISH_SKEW"
          }
          commentary={divergence?.interpretation || "Aligning signals across market observations."}
        />
      )}

      {/* 4. Active Event Markets */}
      <ActiveMarketsTable markets={markets} />

      {/* 5. Recent Settlements */}
      <SettlementFeed />

      {/* 6. How CrowdSignal Works */}
      <HowItWorks />
    </div>
  );
}
