"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { INITIAL_PREDICTORS, PredictorProfile } from "@/lib/data";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"Overall" | "30 Days" | "7 Days" | "BTC" | "ETH">("Overall");
  const [minPredictions, setMinPredictions] = useState<number>(0);

  const tabs: ("Overall" | "30 Days" | "7 Days" | "BTC" | "ETH")[] = [
    "Overall",
    "30 Days",
    "7 Days",
    "BTC",
    "ETH",
  ];

  // Sorted strictly by statistical Predictor Score (not raw win rate!)
  const filtered = [...INITIAL_PREDICTORS]
    .filter((p) => p.resolvedPredictions >= minPredictions)
    .sort((a, b) => b.predictorScore - a.predictorScore);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-semibold">
                REPUTATION REGISTRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mt-1">
              VERIFIED PREDICTORS
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-xl">
              Find wallets with demonstrated Event Contract prediction skill. Ranked by Bayesian Wilson confidence, Brier
              calibration, and streak consistency — never by raw win rate or luck alone.
            </p>
          </div>

          {/* Methodology Callout Badge */}
          <div className="p-3 bg-surface border border-surface-border rounded text-xs font-mono max-w-xs">
            <span className="text-brand font-bold block text-[11px]">ANTI-GAMING RULE</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              A 2/2 lucky trader ranks below a 165/231 veteran predictor due to statistical sample size penalties.
            </p>
          </div>
        </div>

        {/* Tab Strip & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Time & Asset Tabs */}
          <div className="flex items-center bg-surface-subtle p-1 border border-surface-border rounded font-mono text-xs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === tab
                    ? "bg-surface-elevated text-brand font-bold border border-surface-border"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Min Prediction Filter */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Min Predictions:</span>
            <select
              value={minPredictions}
              onChange={(e) => setMinPredictions(Number(e.target.value))}
              className="bg-surface-subtle border border-surface-border text-slate-200 py-1.5 px-3 rounded font-mono text-xs outline-none focus:border-brand"
            >
              <option value={0}>All Sample Sizes</option>
              <option value={10}>&gt;= 10 Predictions (Verified only)</option>
              <option value={50}>&gt;= 50 Predictions</option>
              <option value={100}>&gt;= 100 Predictions</option>
            </select>
          </div>
        </div>

        {/* Predictors Table */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle/80 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-medium">Rank</th>
                  <th className="py-3.5 px-4 font-medium">Wallet Address</th>
                  <th className="py-3.5 px-4 font-medium">Predictor Score</th>
                  <th className="py-3.5 px-4 font-medium">Directional Accuracy</th>
                  <th className="py-3.5 px-4 font-medium">Calibration</th>
                  <th className="py-3.5 px-4 font-medium">Predictions (Resolved)</th>
                  <th className="py-3.5 px-4 font-medium">Consistency</th>
                  <th className="py-3.5 px-4 font-medium text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((p, index) => {
                  return (
                    <tr
                      key={p.address}
                      className={`hover:bg-surface-elevated/50 transition-colors ${
                        !p.isVerified ? "opacity-60 bg-surface-subtle/30" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-bold text-white">
                        <span
                          className={`inline-block w-6 text-center ${
                            index === 0
                              ? "text-brand"
                              : index === 1
                              ? "text-slate-200"
                              : index === 2
                              ? "text-amber-500"
                              : "text-slate-400"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/trader/${p.address}`}
                            className="text-white hover:text-brand transition-colors font-medium"
                          >
                            {p.ensOrShort}
                          </Link>
                          {p.isVerified ? (
                            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-semibold">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9px] bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded" title="Sample size < 10 calls">
                              LOW SAMPLE
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-base font-black ${
                              p.predictorScore >= 80
                                ? "text-brand"
                                : p.predictorScore >= 60
                                ? "text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {p.predictorScore}
                          </span>
                          <span className="text-[10px] text-slate-500">/ 100</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-emerald-400">
                        {p.accuracy.toFixed(1)}%
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-cyan-400 font-medium">{p.calibrationScore}</span>
                        <span className="text-slate-500 text-[10px]"> / 100</span>
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        {p.totalPredictions} ({p.resolvedPredictions})
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-slate-200 font-medium">{p.consistencyScore}</span>
                        <span className="text-slate-500 text-[10px]"> / 100</span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/trader/${p.address}`}
                          className="py-1 px-3 bg-surface-subtle hover:bg-surface-border border border-surface-border rounded text-slate-200 transition-colors"
                        >
                          Dossier →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
