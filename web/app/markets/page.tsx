"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useActiveMarkets } from "@/lib/queries";

export default function MarketsPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("All Assets");
  const [selectedLifecycle, setSelectedLifecycle] = useState<"live" | "settled">("live");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("15m");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: marketsData, isLoading } = useActiveMarkets();
  const markets = marketsData?.markets || [];

  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      if (selectedAsset !== "All Assets" && m.asset !== selectedAsset) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchAsset = m.asset.toLowerCase().includes(q);
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchId = m.id.toLowerCase().includes(q);
        if (!matchAsset && !matchTitle && !matchId) return false;
      }
      return true;
    });
  }, [markets, selectedAsset, searchQuery]);

  const totalOpenInterest = useMemo(() => {
    return markets.reduce((sum, m) => sum + (m.openInterestUsd || 0), 0);
  }, [markets]);

  const totalVolume = useMemo(() => {
    return markets.reduce((sum, m) => sum + (m.volumeUsd || 0), 0);
  }, [markets]);

  const getAssetIcon = (asset: string) => {
    switch (asset) {
      case "BTC":
        return "₿";
      case "ETH":
        return "Ξ";
      case "SOL":
        return "S";
      default:
        return "●";
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#292929]">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-semibold text-[#F5F5F5] tracking-tight">Markets</h1>
          <p className="text-[13px] text-[#A1A1A1]">
            Live Event Contract intelligence derived from DreamDEX smart contracts on Somnia.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141414] text-[#A1A1A1] border border-[#292929] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
            Telemetry Synchronized
          </span>
          <span className="text-[11px] font-mono text-[#707070]">
            Somnia Shannon (50312)
          </span>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-[#141414] border border-[#292929] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A1A1A1] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Active Open Interest</span>
            <span className="material-symbols-outlined text-[16px] text-[#707070]">pie_chart</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
              {totalOpenInterest > 0 ? `$${totalOpenInterest.toLocaleString()}` : "Unavailable"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#292929] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A1A1A1] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Signal Volume</span>
            <span className="material-symbols-outlined text-[16px] text-[#707070]">stacked_bar_chart</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
              {totalVolume > 0 ? `$${totalVolume.toLocaleString()}` : "$0"}
            </span>
            <span className="text-[11px] text-[#707070] tabular-nums">{markets.length} active</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#292929] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A1A1A1] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Contracts</span>
            <span className="material-symbols-outlined text-[16px] text-[#707070]">tune</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">{markets.length}</span>
            <span className="text-[11px] text-[#707070]">Observed on Somnia</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#292929] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A1A1A1] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4DA3FF]">Status</span>
            <span className="material-symbols-outlined text-[16px] text-[#4DA3FF]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-semibold text-[#F5F5F5]">
              {markets.length > 0 ? "Trading Active" : "Awaiting Events"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="p-2 rounded-lg bg-[#141414] border border-[#292929] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Asset Selector */}
          <div className="inline-flex rounded bg-[#0D0D0D] p-0.5 border border-[#202020]">
            {["All Assets", "BTC", "ETH", "SOL"].map((asset) => (
              <button
                key={asset}
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  selectedAsset === asset
                    ? "bg-[#202020] text-white"
                    : "text-[#707070] hover:text-[#F5F5F5]"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#292929] hidden sm:block" />

          {/* Lifecycle Toggle */}
          <div className="inline-flex rounded bg-[#0D0D0D] p-0.5 border border-[#202020]">
            <button
              type="button"
              onClick={() => setSelectedLifecycle("live")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1.5 transition-colors ${
                selectedLifecycle === "live"
                  ? "bg-[#202020] text-white"
                  : "text-[#707070] hover:text-[#F5F5F5]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              Live Events
            </button>
            <button
              type="button"
              onClick={() => setSelectedLifecycle("settled")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                selectedLifecycle === "settled"
                  ? "bg-[#202020] text-white"
                  : "text-[#707070] hover:text-[#F5F5F5]"
              }`}
            >
              Settled Contracts
            </button>
          </div>

          <div className="h-4 w-px bg-[#292929] hidden sm:block" />

          {/* Timeframe Filter */}
          <div className="inline-flex rounded bg-[#0D0D0D] p-0.5 border border-[#202020]">
            {["15m", "1h", "24h"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  selectedTimeframe === tf
                    ? "bg-[#202020] text-white"
                    : "text-[#707070] hover:text-[#F5F5F5]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#707070] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by contract or asset..."
            className="w-full h-8 pl-8 pr-3 text-[12px] bg-[#0D0D0D] border border-[#202020] text-[#F5F5F5] placeholder-[#707070] rounded focus:outline-none focus:border-[#4DA3FF]"
          />
        </div>
      </div>

      {/* Primary Markets Table */}
      <div className="rounded-lg bg-[#141414] border border-[#292929] overflow-hidden">
        <div className="overflow-x-auto">
          {filteredMarkets.length === 0 ? (
            <div className="p-12 text-center text-[#707070] font-mono text-[13px]">
              {isLoading ? "Synchronizing active contracts from Somnia Shannon..." : "No active event contracts matching query."}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-[#0D0D0D] text-[#707070] font-mono text-[11px] uppercase tracking-wider border-b border-[#202020]">
                  <th className="py-3 px-4 font-medium">Asset & Window</th>
                  <th className="py-3 px-4 font-medium min-w-[200px]">Direction & Probability</th>
                  <th className="py-3 px-4 font-medium">Consensus State</th>
                  <th className="py-3 px-4 font-medium text-right">Open Interest</th>
                  <th className="py-3 px-4 font-medium text-right">Spread</th>
                  <th className="py-3 px-4 font-medium">Expiration</th>
                  <th className="py-3 px-4 font-medium text-right">Contract</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-[#1A1A1A]">
                {filteredMarkets.map((market) => {
                  const isUp = market.upProbability >= 50;
                  const mins = Math.floor(market.secondsRemaining / 60);
                  const secs = market.secondsRemaining % 60;

                  return (
                    <tr key={market.id} className="hover:bg-[#1A1A1A] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-[#202020] flex items-center justify-center text-[11px] text-[#F5F5F5] font-semibold">
                            {getAssetIcon(market.asset)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F5F5F5]">{market.asset} / USD</div>
                            <div className="text-[11px] text-[#707070]">{market.interval} window</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 w-full max-w-[200px]">
                          <div className="flex justify-between font-mono text-[11px] tabular-nums">
                            <span className="text-[#4DA3FF] font-medium">
                              UP {market.upProbability.toFixed(1)}%
                            </span>
                            <span className="text-[#E7A94B] font-medium">
                              {market.downProbability.toFixed(1)}% DOWN
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#222222] flex overflow-hidden">
                            <div
                              className="bg-[#4DA3FF] h-full"
                              style={{ width: `${market.upProbability}%` }}
                            />
                            <div
                              className="bg-[#E7A94B] h-full"
                              style={{ width: `${market.downProbability}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            isUp
                              ? "bg-[#4DA3FF]/10 text-[#4DA3FF]"
                              : "bg-[#E7A94B]/10 text-[#E7A94B]"
                          }`}
                        >
                          {isUp ? "Bullish Skew" : "Bearish Skew"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-[#F5F5F5] font-medium">
                        {market.openInterestUsd > 0 ? `$${market.openInterestUsd.toLocaleString()}` : "Unavailable"}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums font-mono text-[#A1A1A1]">
                        {market.spread > 0 ? market.spread.toFixed(4) : "—"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
                          <span className="font-mono text-[12px] text-[#A1A1A1] tabular-nums">
                            {`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/market/${market.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2A2A2A] text-[#F5F5F5] text-[12px] transition-colors"
                        >
                          <span>Inspect</span>
                          <span className="text-[#707070] group-hover:text-white">→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
