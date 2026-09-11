"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { CalibrationChart } from "@/components/reputation/CalibrationChart";
import { INITIAL_PREDICTORS, PredictorProfile } from "@/lib/data";

interface TraderPageProps {
  params: Promise<{ address: string }>;
}

export default function TraderProfilePage({ params }: TraderPageProps) {
  const resolvedParams = use(params);
  const [isFollowing, setIsFollowing] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState<"All" | "Correct" | "Incorrect" | "BTC" | "ETH">("All");

  const predictor =
    INITIAL_PREDICTORS.find(
      (p) => p.address.toLowerCase() === resolvedParams.address.toLowerCase()
    ) || INITIAL_PREDICTORS[0];

  const filteredHistory = predictor.history.filter((h) => {
    if (outcomeFilter === "All") return true;
    if (outcomeFilter === "Correct") return h.outcome === "Correct";
    if (outcomeFilter === "Incorrect") return h.outcome === "Incorrect";
    if (outcomeFilter === "BTC") return h.asset === "BTC";
    if (outcomeFilter === "ETH") return h.asset === "ETH";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <span>/</span>
          <span className="text-brand font-medium">{predictor.ensOrShort}</span>
        </div>

        {/* Predictor Dossier Header */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                <span>PREDICTOR VERIFIED DOSSIER</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
                <span>{predictor.address}</span>
                {predictor.isVerified ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    VERIFIED SKILL
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/30">
                    UNVERIFIED (LOW SAMPLE)
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Statistical prediction profile registered on Somnia Shannon `ReputationRegistry.sol`.
              </p>
            </div>

            {/* Follow Predictor Toggle */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`py-2 px-4 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors border ${
                isFollowing
                  ? "bg-surface-elevated text-emerald-400 border-emerald-500/40"
                  : "bg-brand text-black hover:bg-brand-subtle border-transparent"
              }`}
            >
              {isFollowing ? "✓ Following Predictor" : "Follow Predictor"}
            </button>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-6 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Predictor Score</span>
              <div className="text-2xl font-black text-brand mt-1">
                {predictor.predictorScore}
                <span className="text-xs font-normal text-slate-500"> / 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Accuracy</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {predictor.accuracy}%
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Predictions</span>
              <div className="text-2xl font-black text-white mt-1">
                {predictor.totalPredictions}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Resolved</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {predictor.resolvedPredictions}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Calibration</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {predictor.calibrationScore}
                <span className="text-xs font-normal text-slate-500"> / 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Consistency</span>
              <div className="text-2xl font-black text-slate-200 mt-1">
                {predictor.consistencyScore}
                <span className="text-xs font-normal text-slate-500"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Breakdown & Plain English Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-xs">
          <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">DIRECTIONAL ACCURACY</span>
            <span className="text-xl font-bold text-emerald-400 block">{predictor.accuracy}%</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Percentage of calls correctly predicting final settlement direction.
            </p>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">CALIBRATION</span>
            <span className="text-xl font-bold text-amber-400 block">{predictor.calibrationScore}</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Measures whether stated confidence aligns with actual realized outcomes.
            </p>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">CONSISTENCY</span>
            <span className="text-xl font-bold text-slate-200 block">{predictor.consistencyScore}</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Low variance across rolling prediction windows; avoids rewarding single lucky streaks.
            </p>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">SAMPLE SIZE</span>
            <span className="text-xl font-bold text-cyan-400 block">{predictor.resolvedPredictions}</span>
            <p className="text-[11px] text-slate-400 font-sans">
              High statistical significance based on Wilson confidence intervals.
            </p>
          </div>

          <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">RECENT FORM</span>
            <span className="text-xl font-bold text-brand block">{predictor.recentForm}</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Exponential moving average over the last 10 completed market calls.
            </p>
          </div>
        </div>

        {/* Calibration Visualization Component */}
        <section aria-label="Predictor Calibration Chart">
          <CalibrationChart buckets={predictor.calibrationBuckets} />
        </section>

        {/* Prediction History Table */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                VERIFIABLE AUDIT LEDGER
              </span>
              <h3 className="text-base font-mono font-bold text-white mt-0.5">
                HISTORICAL PREDICTION LEDGER
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-subtle p-1 border border-surface-border rounded font-mono text-xs">
              {(["All", "Correct", "Incorrect", "BTC", "ETH"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOutcomeFilter(filter)}
                  className={`px-3 py-1 rounded transition-colors ${
                    outcomeFilter === filter
                      ? "bg-surface-elevated text-brand font-bold border border-surface-border"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle/80 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Asset</th>
                  <th className="py-3 px-4 font-medium">Window</th>
                  <th className="py-3 px-4 font-medium">Prediction</th>
                  <th className="py-3 px-4 font-medium">Stated Confidence</th>
                  <th className="py-3 px-4 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{h.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{h.asset}</td>
                    <td className="py-3 px-4 text-slate-300">{h.window}</td>
                    <td className="py-3 px-4">
                      <span className={h.prediction === "UP" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {h.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">{h.confidence}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          h.outcome === "Correct"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : h.outcome === "Incorrect"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
