"use client";

import React from "react";
import Link from "next/link";
import { MarketSignal } from "@/lib/data";

interface LiveCrowdSignalProps {
  signal: MarketSignal;
}

export function LiveCrowdSignal({ signal }: LiveCrowdSignalProps) {
  const isBullish = signal.upProbability >= 50;

  return (
    <div className="w-full bg-surface border border-surface-border rounded-lg shadow-terminal p-6 sm:p-8 relative overflow-hidden">
      {/* Background Subtle Ambience */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBullish ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-surface-elevated border border-surface-border flex items-center justify-center font-mono font-bold text-sm text-brand">
            {signal.asset}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-lg text-white">{signal.symbol}</h2>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  isBullish
                    ? "bg-bull-tint border-bull-border text-bull"
                    : "bg-bear-tint border-bear-border text-bear"
                }`}
              >
                {signal.marketRegime}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Aggregated across {signal.activeWindowCount} active DreamDEX Event Contract windows
            </p>
          </div>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-surface-subtle px-3 py-1.5 rounded border border-surface-border">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseDot"></span>
          <span className="text-emerald-400 font-bold text-[11px]">LIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px]">Updated {signal.lastUpdatedSecondsAgo}s ago</span>
        </div>
      </div>

      {/* Central Implied Probability Visualization */}
      <div className="py-8 my-2 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-2">
          Capital-Weighted Implied Probability
        </span>

        <div className="flex items-baseline gap-6 my-1">
          {/* UP Probability */}
          <div className="text-right">
            <span className="text-xs font-mono font-semibold text-emerald-400 block tracking-wider">UP</span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-emerald-400 text-glow-bull">
              {signal.upProbability.toFixed(1)}%
            </div>
          </div>

          <div className="text-2xl font-mono text-slate-600 pb-2">/</div>

          {/* DOWN Probability */}
          <div className="text-left">
            <span className="text-xs font-mono font-semibold text-rose-400 block tracking-wider">DOWN</span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-rose-400">
              {signal.downProbability.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Dual Gauge Bar */}
        <div className="w-full max-w-xl mt-4">
          <div className="h-3 w-full bg-surface-elevated rounded-full overflow-hidden flex border border-surface-border">
            <div
              style={{ width: `${signal.upProbability}%` }}
              className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            />
            <div
              style={{ width: `${signal.downProbability}%` }}
              className="h-full bg-rose-500 transition-all duration-700 ease-out"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1.5 px-1">
            <span>UP probability</span>
            <span>DOWN probability</span>
          </div>
        </div>
      </div>

      {/* Under-Gauge Financial Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-border/80 font-mono text-xs">
        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Open Interest</span>
          <span className="text-base font-bold text-white mt-0.5 block">
            ${signal.openInterestUsd.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Real capital escrowed</span>
        </div>

        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Capital Skew</span>
          <span className={`text-base font-bold mt-0.5 block ${signal.capitalSkew >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {signal.capitalSkew >= 0 ? `+${signal.capitalSkew.toFixed(1)}%` : `${signal.capitalSkew.toFixed(1)}%`}
          </span>
          <span className="text-[10px] text-slate-400">Directional bias</span>
        </div>

        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">24h Momentum</span>
          <span className="text-base font-bold text-brand mt-0.5 block">
            +{signal.velocityPerMin.toFixed(1)}% / min
          </span>
          <span className="text-[10px] text-slate-400">Velocity rate</span>
        </div>

        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Market Confidence</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold text-cyan-400">{signal.confidence}</span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">HIGH LIQUIDITY</span>
        </div>
      </div>

      {/* Button Action Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/market/btc-15m-01"
            className="py-2.5 px-5 bg-brand hover:bg-brand-subtle text-black font-mono font-bold text-xs rounded uppercase tracking-wider transition-colors shadow-highlight"
          >
            View BTC Signal →
          </Link>
          <Link
            href="/markets"
            className="py-2.5 px-4 bg-surface-elevated hover:bg-surface-border text-slate-200 font-mono text-xs rounded border border-surface-border transition-colors"
          >
            View All Markets
          </Link>
        </div>

        <Link
          href="/developers"
          className="text-xs font-mono text-slate-400 hover:text-brand transition-colors flex items-center gap-1.5"
        >
          <span>For Developers & Smart Contracts</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
