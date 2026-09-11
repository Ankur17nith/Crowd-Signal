"use client";

import React from "react";
import Link from "next/link";
import { EventContractWindow } from "@/lib/data";

interface ActiveMarketsTableProps {
  markets: EventContractWindow[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  showFilters?: boolean;
}

export function ActiveMarketsTable({
  markets,
  selectedFilter = "all",
  onFilterChange,
  showFilters = true,
}: ActiveMarketsTableProps) {
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-[20px] font-semibold text-[#F5F5F5]">Active Markets</h2>

        {showFilters && (
          <div className="inline-flex p-0.5 rounded text-[12px] bg-[#141414] border border-[#292929]">
            {["all", "15m", "1h", "24h"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilterChange?.(f)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedFilter === f
                    ? "bg-[#292929] text-white font-medium"
                    : "text-[#707070] hover:text-[#A1A1A1]"
                }`}
              >
                {f === "all" ? "All Assets" : f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg bg-[#141414] border border-[#292929]">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-[#202020]">
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070]">
                Asset & Window
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070] min-w-[200px]">
                Direction & Probability
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070] text-right">
                Open Interest
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070] text-right">
                5m Mom.
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070] text-right">
                Status
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#707070] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-[13px] divide-y divide-[#1A1A1A]">
            {markets.map((market) => {
              const isUp = market.upProbability >= 50;
              const momentum = isUp ? +7.2 : -2.8;

              return (
                <tr
                  key={market.id}
                  className="hover:bg-[#1A1A1A] transition-colors group"
                >
                  <td className="py-3.5 px-4 font-medium text-[#F5F5F5]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#202020] flex items-center justify-center text-[11px] text-[#F5F5F5] font-semibold">
                        {getAssetIcon(market.asset)}
                      </div>
                      <div>
                        <span className="font-medium text-[#F5F5F5]">
                          {market.asset} / USD
                        </span>
                        <div className="text-[11px] text-[#707070] font-normal">
                          {market.interval} window
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-[220px]">
                      <span className="font-mono text-[11px] text-[#4DA3FF] tabular-nums whitespace-nowrap">
                        UP {market.upProbability.toFixed(1)}%
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden flex bg-[#222222]">
                        <div
                          className="h-full bg-[#4DA3FF]"
                          style={{ width: `${market.upProbability}%` }}
                        />
                        <div
                          className="h-full bg-[#E7A94B]"
                          style={{ width: `${market.downProbability}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[#E7A94B] tabular-nums whitespace-nowrap">
                        {market.downProbability.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right tabular-nums text-[#F5F5F5] font-medium">
                    ${(market.openInterestUsd / 1000).toFixed(1)}K
                  </td>

                  <td
                    className={`py-3.5 px-4 text-right tabular-nums font-medium ${
                      momentum >= 0 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
                    }`}
                  >
                    {momentum >= 0 ? `+${momentum}%` : `${momentum}%`}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[12px] tabular-nums text-[#A1A1A1]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-[#4DA3FF]" />
                    {formatTimeRemaining(market.secondsRemaining)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/market/${market.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2A2A2A] text-[#F5F5F5] text-[12px] transition-colors"
                    >
                      <span>Inspect</span>
                      <span className="text-[#707070] group-hover:text-white transition-colors">
                        →
                      </span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
