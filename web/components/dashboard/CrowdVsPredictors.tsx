"use client";

import React from "react";
import Link from "next/link";
import { DivergenceData } from "@/lib/data";

interface CrowdVsPredictorsProps {
  divergence: DivergenceData;
}

export function CrowdVsPredictors({ divergence }: CrowdVsPredictorsProps) {
  return (
    <div className="w-full bg-surface border border-surface-border rounded-lg shadow-terminal p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-semibold">
              FLAGSHIP PRIMITIVE
            </span>
          </div>
          <h3 className="font-mono font-bold text-lg text-white mt-1">
            CROWD VS VERIFIED PREDICTORS
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Divergence between the broader market and traders with statistically verified prediction calibration.
          </p>
        </div>

        <Link
          href="/market/btc-15m-01"
          className="text-xs font-mono py-1.5 px-3 rounded bg-surface-subtle hover:bg-surface-elevated border border-surface-border text-slate-300 transition-colors"
        >
          Explore Divergence →
        </Link>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 font-mono">
        {/* Entire Crowd */}
        <div className="p-4 bg-surface-subtle border border-surface-border rounded flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Entire Market Crowd
            </span>
            <span className="text-3xl font-black text-white mt-2 block">
              UP {divergence.crowdUpProbability}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-3">
            Capital-backed expectation across all active order book participants.
          </p>
        </div>

        {/* Top Verified Predictors */}
        <div className="p-4 bg-surface-subtle border border-amber-500/30 rounded flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider block font-semibold">
                Verified Predictors Consensus
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                {divergence.topPredictorCount} WALLETS
              </span>
            </div>
            <span className="text-3xl font-black text-amber-300 mt-2 block">
              UP {divergence.topPredictorConsensus}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-3">
            Quadratic skill-weighted consensus of traders with Brier calibration &gt; 80.
          </p>
        </div>

        {/* Divergence Metric */}
        <div className="p-4 bg-surface-subtle border border-cyan-500/30 rounded flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-cyan-400 uppercase tracking-wider block font-semibold">
              Calculated Divergence
            </span>
            <span className="text-3xl font-black text-cyan-300 mt-2 block text-glow-cyan">
              {divergence.divergencePercent}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Status</span>
            <span className="text-xs text-white font-medium block">SIGNIFICANT DIVERGENCE</span>
          </div>
        </div>
      </div>

      {/* Natural Language Interpretation Banner */}
      <div className="p-3.5 bg-surface-elevated border border-surface-border rounded flex items-start gap-3">
        <div className="text-base text-amber-400 mt-0.5">ℹ</div>
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Intelligence Interpretation
          </span>
          <p className="text-xs text-slate-200 mt-0.5 font-medium">
            {divergence.interpretation}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
            Information discovery primitive. Not investment or financial advice.
          </span>
        </div>
      </div>
    </div>
  );
}
