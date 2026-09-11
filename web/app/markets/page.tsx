"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { INITIAL_MARKETS, EventContractWindow } from "@/lib/data";

export default function MarketsPage() {
  const [assetFilter, setAssetFilter] = useState<string>("ALL");
  const [cadenceFilter, setCadenceFilter] = useState<string>("ALL");

  const filtered = INITIAL_MARKETS.filter((m) => {
    if (assetFilter !== "ALL" && m.asset !== assetFilter) return false;
    if (cadenceFilter !== "ALL" && m.interval !== cadenceFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-semibold">
                DREAMDEX CLOB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mt-1">
              ACTIVE EVENT CONTRACTS
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live binary prediction market order books settled on Somnia Shannon testnet.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Asset Filter */}
            <div className="flex items-center bg-surface-subtle p-1 border border-surface-border rounded">
              {["ALL", "BTC", "ETH", "SOL"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAssetFilter(a)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    assetFilter === a
                      ? "bg-surface-elevated text-brand font-bold border border-surface-border"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Cadence Filter */}
            <div className="flex items-center bg-surface-subtle p-1 border border-surface-border rounded">
              {["ALL", "5m", "15m"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCadenceFilter(c)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    cadenceFilter === c
                      ? "bg-surface-elevated text-brand font-bold border border-surface-border"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Markets Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-surface-border rounded-lg space-y-3">
            <span className="text-2xl">⏳</span>
            <h3 className="font-mono text-white text-sm font-semibold">No active Event Contracts detected.</h3>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              CrowdSignal is waiting for live DreamDEX markets matching your filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-surface-border rounded-lg shadow-terminal overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-subtle/80 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-medium">Market Contract</th>
                    <th className="py-3.5 px-4 font-medium">Window</th>
                    <th className="py-3.5 px-4 font-medium">Implied Probability</th>
                    <th className="py-3.5 px-4 font-medium">Open Interest</th>
                    <th className="py-3.5 px-4 font-medium">Traded Volume</th>
                    <th className="py-3.5 px-4 font-medium">Time Remaining</th>
                    <th className="py-3.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filtered.map((m) => {
                    const mins = Math.floor(m.secondsRemaining / 60);
                    const secs = m.secondsRemaining % 60;
                    const timeString = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

                    return (
                      <tr key={m.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{m.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-surface-subtle px-2 py-0.5 rounded border border-surface-border text-slate-300">
                            {m.interval}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">{m.upProbability.toFixed(1)}% UP</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-rose-400 font-medium">{m.downProbability.toFixed(1)}% DOWN</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white font-medium">
                          ${m.openInterestUsd.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          ${m.volumeUsd.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-bold text-brand">
                          {timeString}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/market/${m.id}`}
                            className="py-1.5 px-3 bg-surface-subtle hover:bg-brand hover:text-black border border-surface-border rounded transition-colors text-slate-200"
                          >
                            Inspect Signal →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
