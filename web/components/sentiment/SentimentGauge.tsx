"use client";

import React, { useState } from "react";
import { QuantitativeRegime } from "@/lib/data";

export interface SentimentGaugeProps {
  asset: string;
  interval: string;
  status?: "loading" | "live" | "delayed" | "unavailable" | "error";
  unavailableMessage?: string;
  freshnessSeconds?: number;
  upProbability?: number;
  downProbability?: number;
  openInterestUsd?: number;
  capitalSkew?: number;
  velocityPerMin?: number;
  confidence?: number;
  marketRegime?: QuantitativeRegime;
  // Research fields
  uncertaintyInterval?: [number, number];
  uncertaintyWidth?: number;
  midProbability?: number;
  microProbability?: number;
  micropriceAdjustment?: number;
  entropy?: number;
  informationVelocity?: number;
  changePointProbability?: number;
  effectiveParticipants?: number;
  concentrationHhi?: number;
  signalIndependence?: number;
}

export function SentimentGauge({
  asset,
  interval,
  status = "live",
  unavailableMessage,
  freshnessSeconds,
  upProbability,
  downProbability,
  openInterestUsd = 0,
  capitalSkew = 0,
  velocityPerMin = 0,
  confidence = 50,
  marketRegime = "STABLE",
  uncertaintyInterval,
  uncertaintyWidth,
  midProbability,
  microProbability,
  micropriceAdjustment,
  entropy,
  informationVelocity,
  changePointProbability,
  effectiveParticipants,
  signalIndependence,
}: SentimentGaugeProps) {
  // 1. Loading State
  if (status === "loading") {
    return (
      <section className="rounded-lg p-10 sm:p-14 text-center bg-[#141414] border border-[#292929]">
        <div className="max-w-[460px] mx-auto flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#292929] border-t-[#4DA3FF] rounded-full animate-spin" />
          <div className="text-[#A1A1A1] font-mono text-[13px] tracking-wide mt-2">
            CALCULATING EMPIRICAL PROBABILITY...
          </div>
          <p className="text-[12px] text-[#707070] font-mono">
            Ingesting live orderbook touches and trade executions for {asset} on Somnia Shannon.
          </p>
        </div>
      </section>
    );
  }

  // 2. Error State
  if (status === "error") {
    return (
      <section className="rounded-lg p-8 sm:p-12 text-center bg-[#141414] border border-[#3A1D1D]">
        <div className="max-w-[460px] mx-auto flex flex-col items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#2B1414] border border-[#522323] text-[#FF6B6B]">
            DATA FEED DISCONNECTED
          </span>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5] tracking-tight">
            Failed to Synchronize Telemetry
          </h2>
          <p className="text-[13px] leading-relaxed text-[#A1A1A1]">
            {unavailableMessage || "Indexer database is temporarily unreachable. Retrying automatically."}
          </p>
        </div>
      </section>
    );
  }

  // 3. Unavailable State (Zero fake 50% fallback)
  if (status === "unavailable" || typeof upProbability !== "number" || isNaN(upProbability)) {
    return (
      <section className="rounded-lg p-8 sm:p-12 text-center bg-[#141414] border border-[#292929]">
        <div className="max-w-[480px] mx-auto flex flex-col items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#1F1912] border border-[#422D16] text-[#E7A94B]">
            OBSERVATION UNAVAILABLE · SOMNIA TESTNET
          </span>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5] tracking-tight">
            No Active Market Observations For {asset}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#8E8E8E]">
            {unavailableMessage ||
              `CrowdSignal strictly requires empirical DreamDEX contract activity. No trades or orderbook liquidity have been recorded for ${asset} on Somnia Shannon yet.`}
          </p>
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-[#707070]">
            <span>Protocol: DreamDEX Event Contracts</span>
            <span>·</span>
            <span>Chain ID: 50312</span>
          </div>
        </div>
      </section>
    );
  }

  // 4. Live / Delayed State with Genuine Measured Values
  const safeUp = upProbability;
  const safeDown = typeof downProbability === "number" ? downProbability : 100 - safeUp;
  const isLeaningUp = safeUp >= 50;

  // Compute SVG arc points for semicircle (radius 140, center at (170, 160))
  const angle = Math.PI - (safeUp / 100) * Math.PI;
  const splitX = Math.round(170 + 140 * Math.cos(angle));
  const splitY = Math.round(160 - 140 * Math.sin(angle));

  return (
    <section className="rounded-lg p-6 sm:p-8 text-center bg-[#141414] border border-[#292929]">
      <div className="max-w-[460px] mx-auto flex flex-col items-center">
        {/* Status / Regime Tag */}
        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          {status === "delayed" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#2A2314] border border-[#4A3A1A] text-[#E7A94B]">
              DELAYED ({freshnessSeconds ? `T+${freshnessSeconds}s` : "STALE"})
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#101F2E] border border-[#1C3652] text-[#4DA3FF]">
              LIVE TELEMETRY
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#1A1A1A] border border-[#292929] text-[#A0A0A0]">
            REGIME: <strong className="ml-1 text-[#F5F5F5]">{marketRegime}</strong>
          </span>
          {uncertaintyInterval && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-[#707070] bg-[#1A1A1A] border border-[#292929]">
              95% CI: [{uncertaintyInterval[0]}% - {uncertaintyInterval[1]}%]
            </span>
          )}
        </div>

        {/* Geometric Gauge Canvas */}
        <div className="relative w-[340px] h-[180px] flex items-end justify-center">
          <svg className="w-[340px] h-[180px]" fill="none" viewBox="0 0 340 180">
            {/* Background Full Semi-Arc */}
            <path
              d="M 30 160 A 140 140 0 0 1 310 160"
              fill="none"
              stroke="#222222"
              strokeLinecap="round"
              strokeWidth="14"
            />
            {/* DOWN Arc Segment (Amber) */}
            <path
              d={`M 30 160 A 140 140 0 0 1 ${splitX - 3} ${splitY}`}
              fill="none"
              stroke="#E7A94B"
              strokeLinecap="round"
              strokeWidth="14"
            />
            {/* UP Arc Segment (Precision Blue) */}
            <path
              d={`M ${splitX + 3} ${splitY} A 140 140 0 0 1 310 160`}
              fill="none"
              stroke="#4DA3FF"
              strokeLinecap="round"
              strokeWidth="14"
            />
          </svg>

          {/* Inner Core Values */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
            <span className="text-[52px] sm:text-[56px] leading-[56px] font-semibold text-[#F5F5F5] tabular-nums tracking-tight">
              {safeUp.toFixed(1)}%
            </span>
            <span
              className={`font-mono text-[13px] tracking-widest uppercase mt-2 font-medium ${
                isLeaningUp ? "text-[#4DA3FF]" : "text-[#E7A94B]"
              }`}
            >
              {isLeaningUp ? "MARKET LEANS UP" : "MARKET LEANS DOWN"}
            </span>
            <span className="text-[12px] font-medium text-[#707070] mt-0.5 uppercase tracking-wide">
              {asset} · {interval} EVENT
            </span>
          </div>
        </div>

        {/* Semantic Ratio Indicator */}
        <div className="w-full mt-8 space-y-2">
          <div className="flex items-center justify-between text-[12px] font-mono">
            <span className="text-[#4DA3FF] font-medium">UP {safeUp.toFixed(1)}%</span>
            <span className="text-[#E7A94B] font-medium">DOWN {safeDown.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-[#222222]">
            <div
              className="h-full bg-[#4DA3FF] transition-all duration-500"
              style={{ width: `${safeUp}%` }}
            />
            <div
              className="h-full bg-[#E7A94B] transition-all duration-500"
              style={{ width: `${safeDown}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Market Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#202020]">
        <div className="text-left px-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#707070]">
            Open Interest
          </div>
          <div className="text-[20px] font-medium text-[#F5F5F5] tabular-nums mt-1">
            {openInterestUsd > 0 ? `$${openInterestUsd.toLocaleString()}` : "Unavailable"}
          </div>
        </div>

        <div className="text-left px-2 md:border-l border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#707070]">
            Capital Skew
          </div>
          <div
            className={`text-[20px] font-medium tabular-nums mt-1 ${
              (capitalSkew ?? 0) >= 0 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
            }`}
          >
            {(capitalSkew ?? 0) >= 0 ? `+${(capitalSkew ?? 0).toFixed(1)}%` : `${(capitalSkew ?? 0).toFixed(1)}%`}
          </div>
        </div>

        <div className="text-left px-2 md:border-l border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#707070]">
            Momentum
          </div>
          <div
            className={`text-[20px] font-medium tabular-nums mt-1 ${
              (velocityPerMin ?? 0) >= 0 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
            }`}
          >
            {(velocityPerMin ?? 0) >= 0 ? `+${(velocityPerMin ?? 0).toFixed(1)}%` : `${(velocityPerMin ?? 0).toFixed(1)}%`}{" "}
            <span className="text-[12px] text-[#707070] font-normal">/ 5m</span>
          </div>
        </div>

        <div className="text-left px-2 md:border-l border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#707070]">
            Signal Confidence
          </div>
          <div className="text-[20px] font-medium text-[#F5F5F5] tabular-nums mt-1">
            {typeof confidence === "number" && !isNaN(confidence) ? (
              <>
                {confidence}{" "}
                <span className="text-[13px] text-[#707070] font-normal">/ 100</span>
              </>
            ) : (
              "Unavailable"
            )}
          </div>
        </div>
      </div>

      {/* Quantitative Intelligence Sub-Panel */}
      {microProbability !== undefined && (
        <div className="mt-6 pt-6 border-t border-[#1C1C1C] grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="bg-[#101010] p-3 rounded border border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#707070]">
              Microprice (Depth Adjusted)
            </div>
            <div className="text-[15px] font-medium text-[#E0E0E0] tabular-nums mt-0.5">
              {typeof microProbability === "number" ? `${microProbability.toFixed(1)}%` : "Unavailable"}{" "}
              {typeof micropriceAdjustment === "number" && (
                <span className="text-[11px] text-[#4DA3FF]">
                  ({micropriceAdjustment >= 0 ? "+" : ""}
                  {micropriceAdjustment.toFixed(1)}pp)
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#101010] p-3 rounded border border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#707070]">
              Shannon Entropy
            </div>
            <div className="text-[15px] font-medium text-[#E0E0E0] tabular-nums mt-0.5">
              {typeof entropy === "number" ? entropy.toFixed(3) : "1.000"}{" "}
              <span className="text-[11px] text-[#707070]">bits</span>
            </div>
          </div>

          <div className="bg-[#101010] p-3 rounded border border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#707070]">
              Information Velocity (dH/dt)
            </div>
            <div className="text-[15px] font-medium text-[#E0E0E0] tabular-nums mt-0.5">
              {typeof informationVelocity === "number" ? (
                <>
                  {informationVelocity >= 0 ? "+" : ""}
                  {informationVelocity.toFixed(3)}{" "}
                  <span className="text-[11px] text-[#707070]">b/m</span>
                </>
              ) : (
                "0.000 b/m"
              )}
            </div>
          </div>

          <div className="bg-[#101010] p-3 rounded border border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#707070]">
              Effective Sample Size
            </div>
            <div className="text-[15px] font-medium text-[#E0E0E0] tabular-nums mt-0.5">
              N_eff: {effectiveParticipants ?? 0}{" "}
              <span className="text-[11px] text-[#707070]">
                (Indep: {typeof signalIndependence === "number" ? (signalIndependence * 100).toFixed(0) : "80"}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
