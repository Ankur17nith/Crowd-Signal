"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useActiveMarkets } from "@/lib/queries";
import { EventContractWindow } from "@/lib/data";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const marketId = resolvedParams.id;

  const { data: marketsData, isLoading } = useActiveMarkets();
  const markets = marketsData?.markets || [];
  const market = markets.find((m) => m.id === marketId) || markets[0];

  const [activeChartTab, setActiveChartTab] = useState<
    "probability" | "openInterest" | "skew"
  >("probability");
  const [activeTimeRange, setActiveTimeRange] = useState<"1m" | "5m" | "all">("5m");

  if (isLoading || !market) {
    return (
      <div className="flex flex-col w-full gap-6 p-12 text-center border border-[#292929] rounded bg-[#141414]">
        <div className="text-[#A1A1A1] font-mono text-[14px]">
          {isLoading ? "Loading contract telemetry..." : `Market "${marketId}" is awaiting active observations or has concluded.`}
        </div>
        <Link href="/markets" className="text-[#4DA3FF] text-[13px] hover:underline">
          ← Return to Markets
        </Link>
      </div>
    );
  }

  const isUp = market.upProbability >= 50;
  const mins = Math.floor(market.secondsRemaining / 60);
  const secs = market.secondsRemaining % 60;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Section 1: Navigation & Breadcrumbs */}
      <nav className="flex items-center justify-between py-1 border-b border-[#292929] pb-3">
        <div className="flex items-center gap-2 text-[#A1A1A1] text-[12px]">
          <Link href="/markets" className="hover:text-[#F5F5F5] transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-[#F5F5F5]">{market.asset}-USD</span>
          <span>/</span>
          <span className="text-[#707070] font-mono">
            {market.interval} Event #{market.id.slice(-6)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#141414] border border-[#292929] text-[11px] text-[#F5F5F5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
            LIVE FEED
          </span>
          <span className="text-[#707070] text-[11px] font-mono">
            ID: {market.id.slice(0, 8)}...
          </span>
        </div>
      </nav>

      {/* Section 2: Market Detail Header */}
      <header className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[24px] font-semibold text-[#F5F5F5] tracking-tight">
              {market.asset} / USD
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#202020] text-[#A1A1A1] text-[11px] tracking-wider uppercase font-mono">
              {market.interval} EVENT
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#202020] text-[11px] text-[#F5F5F5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              <span className="font-mono tabular-nums">
                {`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`} remaining
              </span>
            </div>
          </div>
          <p className="text-[13px] text-[#707070]">
            Baseline Strike:{" "}
            <span className="text-[#F5F5F5] font-mono font-medium">
              ${market.openPrice.toLocaleString()} USD
            </span>{" "}
            at contract inception
          </p>
        </div>

        {/* Sentiment Split Indicator */}
        <div className="flex flex-col gap-2 min-w-[280px]">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#4DA3FF] font-mono font-semibold flex items-center gap-1">
              {market.upProbability.toFixed(1)}% UP
            </span>
            <span className="text-[#E7A94B] font-mono font-semibold flex items-center gap-1">
              {market.downProbability.toFixed(1)}% DOWN
            </span>
          </div>
          <div className="w-full h-2 rounded bg-[#222222] overflow-hidden flex">
            <div
              className="h-full bg-[#4DA3FF] transition-all duration-300"
              style={{ width: `${market.upProbability}%` }}
            />
            <div
              className="h-full bg-[#E7A94B] transition-all duration-300"
              style={{ width: `${market.downProbability}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[#707070] text-[11px]">
            <span>${((market.openInterestUsd * market.upProbability) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} Allocated</span>
            <span>${((market.openInterestUsd * market.downProbability) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} Allocated</span>
          </div>
        </div>
      </header>

      {/* Section 3: Key Market Metrics Bar */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col justify-between gap-1">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            Open Interest
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] text-[#F5F5F5] font-semibold tabular-nums">
              ${market.openInterestUsd.toLocaleString()}
            </span>
            <span className="text-[#707070] text-[11px]">USD</span>
          </div>
          <span className="text-[11px] text-[#707070]">+12.4% vs prev contract</span>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col justify-between gap-1">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            Capital Skew
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-[20px] font-semibold tabular-nums ${
                isUp ? "text-[#4DA3FF]" : "text-[#E7A94B]"
              }`}
            >
              {isUp ? "+28.4%" : "-14.2%"}
            </span>
          </div>
          <span
            className={`text-[11px] ${
              isUp ? "text-[#4DA3FF]" : "text-[#E7A94B]"
            }`}
          >
            {isUp ? "Bullish Structural Skew" : "Bearish Structural Skew"}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col justify-between gap-1">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            5m Momentum
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-[20px] font-semibold tabular-nums ${
                isUp ? "text-[#4DA3FF]" : "text-[#E7A94B]"
              }`}
            >
              {isUp ? "+7.2%" : "-2.8%"}
            </span>
            <span className="text-[#707070] text-[11px]">/ 5m</span>
          </div>
          <span className="text-[11px] text-[#707070]">
            {isUp ? "Accelerating UP trend" : "Decelerating trend"}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col justify-between gap-1">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            Signal Confidence
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] text-[#F5F5F5] font-semibold tabular-nums">
              87
            </span>
            <span className="text-[#707070] text-[11px]">/ 100</span>
          </div>
          <span className="text-[11px] text-[#4DA3FF]">High Participant Rigor</span>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col justify-between gap-1 col-span-2 md:col-span-1">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            Liquidity Pool
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#F5F5F5] font-mono truncate">
              0x3ecC...e388
            </span>
          </div>
          <span className="text-[11px] text-[#707070]">Somnia EventContract v1.2</span>
        </div>
      </section>

      {/* Section 4: Primary Chart Section */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-4">
        {/* Chart Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#202020]">
          <div className="flex items-center gap-1 p-0.5 rounded bg-[#0D0D0D] border border-[#202020]">
            <button
              type="button"
              onClick={() => setActiveChartTab("probability")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                activeChartTab === "probability"
                  ? "bg-[#202020] text-white"
                  : "text-[#707070] hover:text-[#F5F5F5]"
              }`}
            >
              Probability Over Time
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab("openInterest")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                activeChartTab === "openInterest"
                  ? "bg-[#202020] text-white"
                  : "text-[#707070] hover:text-[#F5F5F5]"
              }`}
            >
              Open Interest
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab("skew")}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                activeChartTab === "skew"
                  ? "bg-[#202020] text-white"
                  : "text-[#707070] hover:text-[#F5F5F5]"
              }`}
            >
              Capital Skew
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 rounded bg-[#0D0D0D] border border-[#202020]">
              {(["1m", "5m", "all"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveTimeRange(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activeTimeRange === r
                      ? "bg-[#202020] text-white"
                      : "text-[#707070] hover:text-[#F5F5F5]"
                  }`}
                >
                  {r === "all" ? "All Window" : r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pl-2">
              <span className="w-2.5 h-0.5 bg-[#4DA3FF]" />
              <span className="text-[11px] text-[#A1A1A1]">Implied UP Prob.</span>
              <span className="w-2.5 h-0.5 bg-[#707070] ml-2 border-t border-dashed" />
              <span className="text-[11px] text-[#707070]">Verified Consensus</span>
            </div>
          </div>
        </div>

        {/* Analytical Trajectory Visualizer (Inline High-Precision SVG) */}
        <div className="relative w-full h-[320px] bg-[#0D0D0D] rounded border border-[#202020] p-3 flex flex-col justify-between overflow-hidden">
          {/* Trajectory Overlay Info Box */}
          <div className="absolute top-4 left-4 z-10 p-2.5 rounded bg-[#1A1A1A] border border-[#292929] text-[#F5F5F5] flex flex-col gap-0.5 shadow-lg">
            <div className="text-[10px] text-[#707070] font-mono">
              Somnia Shannon · Event Window {market.interval}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-mono font-semibold text-[#4DA3FF]">
                {market.upProbability.toFixed(1)}% UP
              </span>
              <span className="text-[#707070] text-[11px] font-mono">
                Vol: ${(market.volumeUsd).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Precise Grid + Probability Curve Chart SVG */}
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 960 300">
            {/* Horizontal Grid Lines & Scale Markers */}
            <line stroke="#202020" strokeDasharray="2 2" strokeWidth="1" x1="40" x2="940" y1="30" y2="30" />
            <text fill="#707070" fontFamily="monospace" fontSize="10" textAnchor="end" x="30" y="34">80%</text>

            <line stroke="#202020" strokeDasharray="2 2" strokeWidth="1" x1="40" x2="940" y1="90" y2="90" />
            <text fill="#707070" fontFamily="monospace" fontSize="10" textAnchor="end" x="30" y="94">65%</text>

            {/* 50% Neutral Baseline Threshold */}
            <line stroke="#292929" strokeWidth="1.5" x1="40" x2="940" y1="150" y2="150" />
            <text fill="#A1A1A1" fontFamily="monospace" fontSize="10" textAnchor="end" x="30" y="154">50%</text>

            <line stroke="#202020" strokeDasharray="2 2" strokeWidth="1" x1="40" x2="940" y1="210" y2="210" />
            <text fill="#707070" fontFamily="monospace" fontSize="10" textAnchor="end" x="30" y="214">35%</text>

            <line stroke="#202020" strokeDasharray="2 2" strokeWidth="1" x1="40" x2="940" y1="270" y2="270" />
            <text fill="#707070" fontFamily="monospace" fontSize="10" textAnchor="end" x="30" y="274">20%</text>

            {/* Vertical Time Segments */}
            <line stroke="#1A1A1A" strokeWidth="1" x1="40" x2="40" y1="20" y2="280" />
            <line stroke="#1A1A1A" strokeWidth="1" x1="220" x2="220" y1="20" y2="280" />
            <line stroke="#1A1A1A" strokeWidth="1" x1="400" x2="400" y1="20" y2="280" />
            <line stroke="#1A1A1A" strokeWidth="1" x1="580" x2="580" y1="20" y2="280" />
            <line stroke="#1A1A1A" strokeWidth="1" x1="760" x2="760" y1="20" y2="280" />
            <line stroke="#1A1A1A" strokeWidth="1" x1="940" x2="940" y1="20" y2="280" />

            {/* Contrarian Top-10% Smart Curve (Secondary trace) */}
            <path
              d="M 40 148 C 120 152, 200 160, 280 155 C 360 150, 440 162, 520 158 C 600 152, 680 150, 760 153"
              fill="none"
              stroke="#707070"
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />

            {/* Primary Crowd Trajectory Curve */}
            <path
              d="M 40 150 C 90 145, 140 138, 200 130 C 260 122, 310 134, 380 120 C 440 108, 510 114, 580 102 C 640 92, 700 96, 760 93"
              fill="none"
              stroke="#4DA3FF"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Projection / Future dotted path */}
            <path
              d="M 760 93 L 940 93"
              fill="none"
              stroke="#292929"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />

            {/* Current Head Marker Anchor */}
            <circle cx="760" cy="93" fill="#4DA3FF" r="4" />
            <line stroke="#4DA3FF" strokeDasharray="2 2" strokeWidth="1" x1="760" x2="760" y1="20" y2="280" />
          </svg>

          {/* Time Axis Bottom Markers */}
          <div className="flex items-center justify-between text-[#707070] text-[11px] font-mono px-6">
            <span>00:00 (Open)</span>
            <span>03:00</span>
            <span>06:00</span>
            <span className="text-[#4DA3FF] font-medium">08:42 (Now)</span>
            <span>12:00</span>
            <span>15:00 (Exp)</span>
          </div>
        </div>
      </section>

      {/* Section 5: Crowd vs. Top Predictor Dissection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analysis Breakdown Card */}
        <div className="lg:col-span-8 bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h2 className="text-[16px] font-semibold text-[#F5F5F5]">
              Cohort Sentiment Dissection
            </h2>
            <span className="text-[11px] text-[#707070]">Live Weighting Model</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Broad Crowd Cohort */}
            <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#F5F5F5] font-medium">
                  Broad Crowd Expectation
                </span>
                <span className="text-[11px] text-[#707070] font-mono">1,420 Wallets</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[24px] font-mono font-semibold text-[#4DA3FF] tabular-nums">
                  64.2% UP
                </span>
                <span className="text-[12px] text-[#707070] font-mono">$182,450 Vol</span>
              </div>
              <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#4DA3FF]" style={{ width: "64.2%" }} />
              </div>
              <span className="text-[11px] text-[#707070] mt-1">
                Aggregated public distribution sentiment
              </span>
            </div>

            {/* Top 10% Calibrated Cohort */}
            <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#F5F5F5] font-medium">
                  Top 10% Calibrated Predictors
                </span>
                <span className="text-[11px] text-[#707070] font-mono">48 Wallets</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[24px] font-mono font-semibold text-[#E7A94B] tabular-nums">
                  49.1% UP
                </span>
                <span className="text-[12px] text-[#707070] font-mono">$84,120 Vol</span>
              </div>
              <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#E7A94B]" style={{ width: "49.1%" }} />
              </div>
              <span className="text-[11px] text-[#707070] mt-1">
                Calibrated by 90d historical Brier accuracy
              </span>
            </div>
          </div>

          {/* Divergence Callout */}
          <div className="p-3 rounded bg-[#0D0D0D] border border-[#202020] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#E7A94B] text-[20px] shrink-0 mt-0.5">
              query_stats
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-[#F5F5F5] font-semibold">
                Cohort Divergence Detected
              </span>
              <p className="text-[12px] text-[#A1A1A1] leading-relaxed">
                <span className="text-[#E7A94B] font-mono font-semibold">
                  15.1 pp Bearish Skew detected.
                </span>{" "}
                Smart money positions contrarian to retail sentiment. Historical signal inversion success rate in similar intervals is 68.4%.
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Notable Predictors */}
        <div className="lg:col-span-4 bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h2 className="text-[16px] font-semibold text-[#F5F5F5]">
              Top Verified Positions
            </h2>
            <span className="text-[11px] text-[#707070]">Ranked</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded bg-[#0D0D0D] border border-[#202020] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#202020] flex items-center justify-center text-[10px] font-mono text-[#F5F5F5] font-semibold">
                  1
                </span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-mono text-[#F5F5F5]">
                    0x71A...92F
                  </span>
                  <span className="text-[10px] text-[#707070]">Score 91 · 247 trades</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono font-semibold text-[#E7A94B]">
                  DOWN 78%
                </span>
                <span className="text-[10px] text-[#707070] font-mono">$12,500</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0D0D0D] border border-[#202020] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#202020] flex items-center justify-center text-[10px] font-mono text-[#F5F5F5] font-semibold">
                  2
                </span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-mono text-[#F5F5F5]">
                    0xA91...892
                  </span>
                  <span className="text-[10px] text-[#707070]">Score 86 · 148 trades</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono font-semibold text-[#4DA3FF]">
                  UP 54%
                </span>
                <span className="text-[10px] text-[#707070] font-mono">$8,900</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0D0D0D] border border-[#202020] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-[#202020] flex items-center justify-center text-[10px] font-mono text-[#F5F5F5] font-semibold">
                  3
                </span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-mono text-[#F5F5F5]">
                    0x3C4...18E
                  </span>
                  <span className="text-[10px] text-[#707070]">Score 82 · 189 trades</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono font-semibold text-[#E7A94B]">
                  DOWN 65%
                </span>
                <span className="text-[10px] text-[#707070] font-mono">$14,200</span>
              </div>
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="w-full py-2 rounded bg-[#0D0D0D] hover:bg-[#202020] border border-[#202020] text-[#A1A1A1] hover:text-[#F5F5F5] text-[12px] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View all 48 Calibrated Wallets</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Section 7: Contract Settlement Specification */}
      <footer className="bg-[#141414] border border-[#292929] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[#A1A1A1] text-[12px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#707070] text-[18px]">
            verified_user
          </span>
          <span>
            Expiration Strike:{" "}
            <span className="text-[#F5F5F5] font-mono font-medium">
              Block boundary #{market.id.slice(-5)}
            </span>{" "}
            on Somnia. Resolution via Pyth Network real-time price feed benchmark.
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/docs" className="hover:text-white transition-colors">
            Oracle Spec
          </Link>
          <a
            href="https://shannon-explorer.somnia.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Somnia Explorer
          </a>
          <Link href="/developers" className="hover:text-white transition-colors">
            Contract Interface
          </Link>
        </div>
      </footer>
    </div>
  );
}
