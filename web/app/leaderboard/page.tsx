"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLeaderboard } from "@/lib/queries";
import { PredictorProfile } from "@/lib/data";

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("All Time");
  const [selectedAsset, setSelectedAsset] = useState<string>("All Assets");
  const [minCalls, setMinCalls] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const { data: leaderboardData, isLoading } = useLeaderboard();
  const predictors = leaderboardData?.predictors || [];

  const toggleFollow = (addr: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [addr]: !prev[addr],
    }));
  };

  const filteredPredictors = useMemo(() => {
    return predictors.filter((p) => {
      if (p.resolvedPredictions < minCalls) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchAddr = p.address.toLowerCase().includes(q);
        const matchEns = p.ensOrShort.toLowerCase().includes(q);
        if (!matchAddr && !matchEns) return false;
      }
      return true;
    });
  }, [predictors, minCalls, searchQuery]);

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-[#292929]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#707070] uppercase tracking-wider">
            Protocol Registry
          </span>
          <span className="text-[#292929] text-[11px]">/</span>
          <span className="text-[11px] text-[#F5F5F5] font-medium">Predictor Ranking</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
          <div>
            <h1 className="text-[28px] font-semibold text-[#F5F5F5] tracking-tight">
              Verified Predictors
            </h1>
            <p className="text-[13px] text-[#A1A1A1] max-w-2xl mt-1">
              Find wallets with demonstrated prediction skill. Ranking considers accuracy, calibration, consistency and sample size — never raw win rate alone.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#141414] border border-[#292929]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              <span className="text-[11px] font-mono text-[#A1A1A1] tabular-nums">
                Block #18,942,014
              </span>
            </div>
            <button
              type="button"
              onClick={() => alert("Exporting verified predictor registry CSV...")}
              className="h-8 px-3 rounded bg-[#141414] hover:bg-[#202020] text-[#F5F5F5] border border-[#292929] text-[12px] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-[#707070]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Methodology Banner */}
      <div className="p-4 bg-[#141414] border border-[#292929] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <span className="material-symbols-outlined text-[#F5F5F5] text-[18px] shrink-0 mt-0.5 md:mt-0">
            functions
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#A1A1A1]">
            <span className="text-[#F5F5F5] font-semibold uppercase tracking-wide text-[11px]">
              Reputation Model:
            </span>
            <code className="px-2 py-0.5 rounded bg-[#0D0D0D] text-[#F5F5F5] font-mono text-[11px] border border-[#202020]">
              Score = 0.35(Acc) + 0.35(Brier) + 0.20(Const) + 0.10(Vol)
            </code>
            <span className="hidden lg:inline text-[#292929]">•</span>
            <span className="hidden lg:inline text-[#707070]">
              Strict quadratic penalty for overconfident mispredictions.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[12px]">
          <span className="text-[#707070] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
            Somnia Settlement Proof
          </span>
          <Link
            href="/docs"
            className="text-[#F5F5F5] hover:text-[#4DA3FF] transition-colors flex items-center gap-0.5 underline decoration-[#292929] underline-offset-4"
          >
            <span>Verify Spec</span>
            <span className="material-symbols-outlined text-[13px]">north_east</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-2.5 bg-[#141414] border border-[#292929] rounded-lg flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Segment */}
          <div className="flex items-center bg-[#0D0D0D] p-0.5 rounded border border-[#202020]">
            {["All Time", "90D", "30D", "7D"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? "bg-[#202020] text-white"
                    : "text-[#707070] hover:text-[#F5F5F5]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#292929] hidden sm:block" />

          {/* Asset Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[#707070] uppercase px-1">Asset:</span>
            <div className="flex items-center bg-[#0D0D0D] p-0.5 rounded border border-[#202020]">
              {["All Assets", "BTC", "ETH"].map((asset) => (
                <button
                  key={asset}
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedAsset === asset
                      ? "bg-[#202020] text-white"
                      : "text-[#707070] hover:text-[#F5F5F5]"
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-[#292929] hidden md:block" />

          {/* Min Calls Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[#707070] uppercase px-1">Min Calls:</span>
            <div className="flex items-center bg-[#0D0D0D] p-0.5 rounded border border-[#202020]">
              {[10, 25, 50, 100].map((calls) => (
                <button
                  key={calls}
                  type="button"
                  onClick={() => setMinCalls(calls)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    minCalls === calls
                      ? "bg-[#202020] text-white"
                      : "text-[#707070] hover:text-[#F5F5F5]"
                  }`}
                >
                  {calls}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full xl:w-72">
          <span className="material-symbols-outlined text-[16px] text-[#707070] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wallet 0x or ENS..."
            className="w-full h-8 pl-8 pr-3 bg-[#0D0D0D] border border-[#202020] rounded text-[12px] font-mono text-[#F5F5F5] placeholder-[#707070] focus:outline-none focus:border-[#4DA3FF]"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#141414] border border-[#292929] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[940px]">
            <thead>
              <tr className="bg-[#0D0D0D] border-b border-[#202020] text-[#707070] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 pl-4 pr-2 w-12 text-center">#</th>
                <th className="py-3 px-4">Predictor</th>
                <th className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-[#F5F5F5]">
                    Score
                    <span className="material-symbols-outlined text-[13px] text-[#4DA3FF]">
                      arrow_downward
                    </span>
                  </span>
                </th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Calibration (Brier)</th>
                <th className="py-3 px-4 text-right">Market Alpha (BSS)</th>
                <th className="py-3 px-4 text-right">Resolved Calls</th>
                <th className="py-3 px-4 text-right">Consistency</th>
                <th className="py-3 px-4 text-center w-36">30D Trend</th>
                <th className="py-3 pr-4 pl-2 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] text-[13px]">
              {filteredPredictors.map((p, idx) => {
                const isFollowing = !!followingMap[p.address];
                return (
                  <tr key={p.address} className="hover:bg-[#1A1A1A] transition-colors group">
                    <td className="py-3.5 pl-4 pr-2 text-center tabular-nums font-mono text-[12px] text-[#F5F5F5] font-medium">
                      {(idx + 1).toString().padStart(2, "0")}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-[#202020] border border-[#292929] flex items-center justify-center font-mono text-[11px] text-[#F5F5F5] shrink-0 font-semibold">
                          {p.address.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/trader/${p.address}`}
                              className="font-medium text-[#F5F5F5] group-hover:underline cursor-pointer"
                            >
                              {p.ensOrShort}
                            </Link>
                            {p.isVerified && (
                              <span
                                className="material-symbols-outlined text-[14px] text-[#4DA3FF]"
                                title="Verified Quantitative Model"
                              >
                                verified
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-[#707070] truncate">
                            {p.address.slice(0, 8)}...{p.address.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[20px] text-[#F5F5F5] font-semibold tabular-nums">
                        {p.predictorScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 text-[#4DA3FF] font-medium bg-[#4DA3FF]/10 px-1.5 py-0.5 rounded text-[12px]">
                        {p.accuracy.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-[#F5F5F5] font-mono text-[13px]">
                      {p.calibrationScore}
                      <span className="text-[#707070] text-[11px]">/100</span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-mono text-[13px]">
                      <span className={`font-medium ${p.marketRelativeSkill >= 0 ? "text-[#4DA3FF]" : "text-[#E7A94B]"}`}>
                        {p.marketRelativeSkill >= 0 ? `+${p.marketRelativeSkill.toFixed(3)}` : p.marketRelativeSkill.toFixed(3)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-[#F5F5F5] font-mono text-[13px]">
                      {p.resolvedPredictions}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-[#F5F5F5] font-mono text-[13px]">
                      {p.consistencyScore}
                      <span className="text-[#707070] text-[11px]">/100</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <svg
                        className="w-28 h-6 mx-auto text-[#4DA3FF] overflow-visible"
                        fill="none"
                        viewBox="0 0 100 24"
                      >
                        <path
                          d="M0,18 L16,16 L32,17 L48,11 L64,12 L80,7 L100,4"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        />
                        <circle cx="100" cy="4" fill="currentColor" r="2" />
                      </svg>
                    </td>

                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => toggleFollow(p.address)}
                        className={`h-7 px-3 rounded border text-[11px] font-medium transition-colors ${
                          isFollowing
                            ? "bg-[#202020] text-[#F5F5F5] border-[#292929] hover:bg-[#2A2A2A]"
                            : "bg-[#0D0D0D] text-[#A1A1A1] border-[#202020] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                        }`}
                      >
                        {isFollowing ? "Following" : "+ Follow"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
