"use client";

import React from "react";
import Link from "next/link";
import { INITIAL_SIGNALS } from "@/lib/data";

interface LiveTickerProps {
  signals?: typeof INITIAL_SIGNALS;
}

export function LiveTicker({ signals = INITIAL_SIGNALS }: LiveTickerProps) {
  const items = Object.values(signals);

  return (
    <div className="w-full border-b border-surface-border bg-surface-subtle/70 px-4 py-2 text-xs font-mono overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-8 min-w-max">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
          <span>LIVE MARKETS</span>
        </div>

        <div className="flex items-center gap-6">
          {items.map((sig) => {
            const isBullish = sig.upProbability >= 50;
            return (
              <Link
                key={sig.asset}
                href={`/market/${sig.asset.toLowerCase()}-15m-01`}
                className="flex items-center gap-2.5 px-2.5 py-1 rounded hover:bg-surface-elevated transition-colors"
              >
                <span className="font-bold text-white">{sig.asset}</span>
                <span className={isBullish ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                  UP {sig.upProbability.toFixed(1)}%
                </span>
                <span className="text-slate-400 text-[11px]">
                  {sig.velocityPerMin >= 0 ? `↑ +${sig.velocityPerMin.toFixed(1)}%` : `↓ ${sig.velocityPerMin.toFixed(1)}%`}
                </span>
                <span className="text-[10px] text-slate-500 bg-surface-border/50 px-1.5 py-0.5 rounded">
                  OI ${(sig.openInterestUsd / 1000).toFixed(0)}k
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
