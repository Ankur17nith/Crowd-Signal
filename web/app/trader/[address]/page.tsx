"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useTraderProfile } from "@/lib/queries";
import { PredictorProfile } from "@/lib/data";

export default function TraderProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const resolvedParams = use(params);
  const targetAddress = resolvedParams.address;

  const { data: predictor, isLoading } = useTraderProfile(targetAddress);

  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [activeChartRange, setActiveChartRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  const handleCopy = () => {
    if (!predictor) return;
    navigator.clipboard.writeText(predictor.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !predictor) {
    return (
      <div className="flex flex-col w-full gap-6 p-12 text-center border border-[#292929] rounded bg-[#141414]">
        <div className="text-[#A1A1A1] font-mono text-[14px]">
          {isLoading ? "Fetching trader reputation and calibration records..." : `No prediction history or reputation observations recorded for ${targetAddress} on Somnia Shannon.`}
        </div>
        <Link href="/leaderboard" className="text-[#4DA3FF] text-[13px] hover:underline">
          ← Return to Leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292929]">
        <div className="flex items-center gap-2 text-[12px] text-[#A1A1A1]">
          <Link
            href="/leaderboard"
            className="hover:text-[#F5F5F5] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Verified Predictors</span>
          </Link>
          <span>/</span>
          <span className="text-[#F5F5F5] font-mono tabular-nums">
            {predictor.address.slice(0, 8)}...{predictor.address.slice(-6)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#707070] text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
          <span>Oracle Sync: Real-time</span>
          <span>·</span>
          <span className="font-mono tabular-nums">Block #18,409,219</span>
        </div>
      </div>

      {/* Profile Identity Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-[#F5F5F5] text-[11px] font-medium">
              Top 1% Calibrated
            </span>
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-[#A1A1A1] text-[11px]">
              Somnia Shannon
            </span>
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-[#A1A1A1] text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#4DA3FF]">
                verified
              </span>
              Verified On-Chain
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="w-12 h-12 rounded bg-[#141414] border border-[#292929] flex items-center justify-center text-[#F5F5F5] text-[16px] font-mono font-semibold">
              0x
            </div>
            <div className="flex flex-col">
              <h1 className="text-[24px] font-semibold text-[#F5F5F5] tracking-tight font-mono tabular-nums">
                {predictor.address}
              </h1>
              <div className="flex items-center gap-3 text-[#A1A1A1] text-[13px] mt-0.5">
                <span>
                  <strong className="text-[#F5F5F5] font-medium tabular-nums">1,420</strong> followers
                </span>
                <span>·</span>
                <span>
                  Following <strong className="text-[#F5F5F5] font-medium tabular-nums">14</strong>
                </span>
                <span>·</span>
                <span>Joined Feb 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className="h-9 px-4 rounded bg-[#202020] hover:bg-[#2A2A2A] border border-[#292929] text-[#F5F5F5] text-[13px] font-medium transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFollowing ? "check" : "add"}
            </span>
            <span>{isFollowing ? "Following" : "Follow"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 rounded bg-[#141414] hover:bg-[#202020] border border-[#292929] text-[#A1A1A1] hover:text-[#F5F5F5] text-[13px] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>{copied ? "Copied!" : "Copy Address"}</span>
          </button>

          <a
            href={`https://shannon-explorer.somnia.network/address/${predictor.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-4 rounded bg-[#141414] hover:bg-[#202020] border border-[#292929] text-[#A1A1A1] hover:text-[#F5F5F5] text-[13px] transition-colors flex items-center gap-1.5"
          >
            <span>Somnia Explorer</span>
            <span className="material-symbols-outlined text-[15px]">north_east</span>
          </a>
        </div>
      </div>

      {/* Primary Score Showcase (Cardless horizontal rhythm) */}
      <div className="py-6 border-y border-[#292929]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-6 divide-y lg:divide-y-0 lg:divide-x divide-[#202020]">
          {/* Big Score Metric */}
          <div className="flex flex-col gap-1 pr-4">
            <span className="text-[11px] font-mono text-[#707070] tracking-wider uppercase">
              Predictor Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[32px] text-[#F5F5F5] font-mono font-semibold tabular-nums leading-none">
                {predictor.predictorScore}
              </span>
              <span className="text-[13px] text-[#707070] font-mono">/ 100</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              <span className="text-[11px] text-[#4DA3FF] uppercase font-medium tracking-wide">
                Exceptional Tier
              </span>
            </div>
          </div>

          {/* Accuracy Metric */}
          <div className="flex flex-col gap-1 pt-4 lg:pt-0 lg:px-4">
            <span className="text-[11px] font-mono text-[#707070] tracking-wider uppercase">
              Historical Accuracy
            </span>
            <div className="mt-1">
              <span className="text-[24px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                {predictor.accuracy.toFixed(1)}%
              </span>
            </div>
            <span className="text-[13px] text-[#707070] tabular-nums mt-1 font-mono">
              {Math.round((predictor.accuracy * predictor.resolvedPredictions) / 100)} correct / {predictor.resolvedPredictions} total
            </span>
          </div>

          {/* Calibration Metric */}
          <div className="flex flex-col gap-1 pt-4 lg:pt-0 lg:px-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#707070] tracking-wider uppercase">
                Calibration
              </span>
              <span
                className="material-symbols-outlined text-[15px] text-[#707070] cursor-help"
                title="Measures match between subjective confidence and observed probability"
              >
                info
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[24px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                {predictor.calibrationScore}
              </span>
              <span className="text-[12px] text-[#707070] font-mono">/ 100</span>
            </div>
            <span className="text-[13px] text-[#707070] tabular-nums mt-1 font-mono">
              Brier: {predictor.meanBrierScore.toFixed(3)} (Rel: {predictor.brierDecomposition.reliability.toFixed(3)})
            </span>
          </div>

          {/* Consistency Metric */}
          <div className="flex flex-col gap-1 pt-4 lg:pt-0 lg:px-4">
            <span className="text-[11px] font-mono text-[#707070] tracking-wider uppercase">
              Consistency & Credible Interval
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[24px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                {predictor.consistencyScore}
              </span>
              <span className="text-[12px] text-[#707070] font-mono">/ 100</span>
            </div>
            <span className="text-[12px] text-[#707070] mt-1 font-mono">
              95% CI: [{predictor.credibleInterval[0]}% - {predictor.credibleInterval[1]}%]
            </span>
          </div>

          {/* Market-Relative Alpha Metric */}
          <div className="flex flex-col gap-1 pt-4 lg:pt-0 lg:pl-4">
            <span className="text-[11px] font-mono text-[#707070] tracking-wider uppercase">
              Market Alpha (BSS)
            </span>
            <div className="mt-1">
              <span className={`text-[24px] font-mono font-semibold tabular-nums ${
                predictor.marketRelativeSkill >= 0 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
              }`}>
                {predictor.marketRelativeSkill >= 0 ? `+${predictor.marketRelativeSkill.toFixed(3)}` : predictor.marketRelativeSkill.toFixed(3)}
              </span>
            </div>
            <span className="text-[12px] text-[#707070] mt-1 font-mono">
              Trend: <strong className="text-[#F5F5F5]">{predictor.skillTrend}</strong> (Recency: {predictor.recencyWeightedSkill.toFixed(3)})
            </span>
          </div>
        </div>
      </div>

      {/* Calculation Details Accordion */}
      <div className="rounded border border-[#292929] bg-[#141414] overflow-hidden">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1A1A1A] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#707070]">
              functions
            </span>
            <span className="text-[13px] font-medium text-[#F5F5F5]">
              How this Predictor Score is calculated
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#707070]">Algorithmic Weighting v2.1</span>
            <span
              className={`material-symbols-outlined text-[18px] text-[#707070] transition-transform duration-200 ${
                accordionOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </div>
        </button>

        {accordionOpen && (
          <div className="px-4 py-4 border-t border-[#292929] bg-[#0D0D0D]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#F5F5F5] uppercase font-mono font-semibold">
                  1. Accuracy (35%)
                </span>
                <p className="text-[#707070] text-[12px] leading-relaxed">
                  Binary win-rate baseline across binary and interval prediction markets resolved via multi-oracle consensus.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#F5F5F5] uppercase font-mono font-semibold">
                  2. Calibration (35%)
                </span>
                <p className="text-[#707070] text-[12px] leading-relaxed">
                  Standard quadratic Brier scoring penalizing overconfident predictions that fail and rewarding proportional uncertainty.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#F5F5F5] uppercase font-mono font-semibold">
                  3. Consistency (20%)
                </span>
                <p className="text-[#707070] text-[12px] leading-relaxed">
                  Rolling 30-day Sharpe of prediction accuracy to guard against intermittent luck and single-event spikes.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#F5F5F5] uppercase font-mono font-semibold">
                  4. Sample Size (10%)
                </span>
                <p className="text-[#707070] text-[12px] leading-relaxed">
                  Bayesian Wilson lower-bound interval scaling up as historical call count crosses critical confidence thresholds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calibration Curve Chart */}
        <div className="lg:col-span-7 flex flex-col p-6 rounded-lg bg-[#141414] border border-[#292929] gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#F5F5F5]">
                Accuracy & Calibration Curve
              </h2>
              <p className="text-[12px] text-[#707070]">
                Rolling cumulative accuracy benchmarked against 65% network mean
              </p>
            </div>
            {/* Time Range Selector */}
            <div className="inline-flex rounded bg-[#0D0D0D] p-0.5 border border-[#202020] self-start sm:self-auto text-[11px] font-mono">
              {(["7D", "30D", "90D", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveChartRange(r)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeChartRange === r
                      ? "bg-[#202020] text-[#F5F5F5] font-medium"
                      : "text-[#707070] hover:text-[#F5F5F5]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-[240px] bg-[#0D0D0D] rounded border border-[#202020] p-3">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 540 200">
              {/* Gridlines */}
              <line stroke="#1A1A1A" strokeDasharray="2 2" strokeWidth="1" x1="30" x2="520" y1="40" y2="40" />
              <text fill="#707070" fontSize="9" fontFamily="monospace" x="25" y="43" textAnchor="end">80%</text>

              <line stroke="#1A1A1A" strokeDasharray="2 2" strokeWidth="1" x1="30" x2="520" y1="90" y2="90" />
              <text fill="#707070" fontSize="9" fontFamily="monospace" x="25" y="93" textAnchor="end">70%</text>

              <line stroke="#292929" strokeWidth="1" x1="30" x2="520" y1="140" y2="140" />
              <text fill="#A1A1A1" fontSize="9" fontFamily="monospace" x="25" y="143" textAnchor="end">60%</text>

              {/* Network Average Line (dashed) */}
              <line stroke="#707070" strokeDasharray="4 3" strokeWidth="1.5" x1="30" x2="520" y1="115" y2="115" />

              {/* Predictor Curve */}
              <path
                d="M 30 130 C 80 120, 140 100, 200 95 C 260 90, 320 85, 380 75 C 440 68, 480 65, 520 62"
                fill="none"
                stroke="#4DA3FF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="520" cy="62" fill="#4DA3FF" r="4" />
            </svg>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#707070] px-4 pt-1">
              <span>Day 1</span>
              <span>Day 8</span>
              <span>Day 15</span>
              <span>Day 22</span>
              <span className="text-[#4DA3FF]">Day 30 (71.4%)</span>
            </div>
          </div>
        </div>

        {/* Calibration Buckets Card */}
        <div className="lg:col-span-5 flex flex-col p-6 rounded-lg bg-[#141414] border border-[#292929] justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#F5F5F5]">Brier Calibration</h2>
            <span className="text-[11px] font-mono text-[#4DA3FF]">0.112 (Low Error)</span>
          </div>
          <p className="text-[12px] text-[#707070]">
            Match between predicted probability confidence bucket and empirical outcome frequency.
          </p>

          <div className="space-y-3">
            {predictor.calibrationBuckets.map((bucket) => (
              <div key={bucket.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A1A1A1]">{bucket.label} Confidence Bucket</span>
                  <span className="text-[#F5F5F5]">{bucket.actualWinRate}% observed ({bucket.count} calls)</span>
                </div>
                <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#202020] flex">
                  <div
                    className="h-full bg-[#4DA3FF]"
                    style={{ width: `${bucket.actualWinRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded bg-[#0D0D0D] border border-[#202020] text-[11px] text-[#707070] leading-relaxed">
            Predictors are penalised quadratically when calling 90%+ confidence and resolving opposite.
          </div>
        </div>
      </div>

      {/* Prediction Ledger Table */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202020] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#F5F5F5]">
            Resolved Prediction Ledger
          </h2>
          <span className="text-[11px] text-[#707070] font-mono">Audited via DreamDEX</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#0D0D0D] border-b border-[#202020] text-[#707070] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Asset & Window</th>
                <th className="py-2.5 px-4">Direction</th>
                <th className="py-2.5 px-4 text-right">Confidence</th>
                <th className="py-2.5 px-4 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] text-[13px]">
              {predictor.history.map((h) => (
                <tr key={h.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#707070]">{h.date}</td>
                  <td className="py-3 px-4 font-medium text-[#F5F5F5]">
                    {h.asset} · {h.window} Event
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        h.prediction === "UP"
                          ? "bg-[#4DA3FF]/10 text-[#4DA3FF]"
                          : "bg-[#E7A94B]/10 text-[#E7A94B]"
                      }`}
                    >
                      {h.prediction}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[12px] text-[#F5F5F5] tabular-nums">
                    {h.confidence}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        h.outcome === "Correct"
                          ? "bg-[#4DA3FF]/10 text-[#4DA3FF]"
                          : "bg-[#202020] text-[#707070]"
                      }`}
                    >
                      {h.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
