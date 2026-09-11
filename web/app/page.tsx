"use client";

import React, { useState } from "react";
import { SentimentGauge } from "@/components/sentiment/SentimentGauge";
import { CrowdVsPredictors } from "@/components/dashboard/CrowdVsPredictors";
import { ActiveMarketsTable } from "@/components/markets/ActiveMarketsTable";
import { SettlementFeed } from "@/components/sentiment/SettlementFeed";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { INITIAL_WINDOWS, INITIAL_SIGNALS } from "@/lib/data";

export default function OverviewPage() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH">("BTC");

  // Get current market signal for chosen asset
  const activeSignal =
    INITIAL_SIGNALS[selectedAsset] || INITIAL_SIGNALS["BTC"];

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
            <span className="w-[6px] h-[6px] rounded-full inline-block bg-[#4DA3FF]" />
            <span>Live · Testnet</span>
          </div>
        </div>
      </header>

      {/* 2. Primary Sentiment Centerpiece (The Sentiment Gauge) */}
      <SentimentGauge
        asset={activeSignal.asset}
        interval="15 MIN"
        upProbability={activeSignal.upProbability}
        downProbability={activeSignal.downProbability}
        openInterestUsd={activeSignal.openInterestUsd}
        capitalSkew={activeSignal.capitalSkew}
        velocityPerMin={activeSignal.velocityPerMin}
        confidence={activeSignal.confidence}
        marketRegime={activeSignal.marketRegime}
        uncertaintyInterval={activeSignal.uncertaintyInterval}
        uncertaintyWidth={activeSignal.uncertaintyWidth}
        midProbability={activeSignal.midProbability}
        microProbability={activeSignal.microProbability}
        micropriceAdjustment={activeSignal.micropriceAdjustment}
        entropy={activeSignal.entropy}
        informationVelocity={activeSignal.informationVelocity}
        changePointProbability={activeSignal.changePointProbability}
        effectiveParticipants={activeSignal.effectiveParticipants}
        concentrationHhi={activeSignal.concentrationHhi}
        signalIndependence={activeSignal.signalIndependence}
      />

      {/* 3. Crowd vs. Verified Predictors (Signature Divergence Feature) */}
      <CrowdVsPredictors
        crowdUpProbability={activeSignal.upProbability}
        crowdVolumeUsd={activeSignal.totalVolumeUsd}
        crowdWalletsCount={1420}
        verifiedUpProbability={49.1}
        verifiedVolumeUsd={84120}
        verifiedWalletsCount={48}
        divergencePp={Math.abs(activeSignal.upProbability - 49.1)}
        divergenceDirection="BEARISH_SKEW"
        commentary="Smart money holds contrarian bias against general retail optimism."
      />

      {/* 4. Active Event Markets */}
      <ActiveMarketsTable markets={INITIAL_WINDOWS} />

      {/* 5. Recent Settlements */}
      <SettlementFeed />

      {/* 6. How CrowdSignal Works */}
      <HowItWorks />
    </div>
  );
}
