"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div className="space-y-2 border-b border-surface-border pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-semibold">
              SPECIFICATION & FORMULAS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white uppercase">
            CROWDSIGNAL DOCUMENTATION
          </h1>
          <p className="text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
            Mathematical foundations, oracle data pipeline, and scoring algorithms powering CrowdSignal on Somnia Shannon.
          </p>
        </div>

        {/* Article 1: Core Problem & Product Thesis */}
        <article className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-4">
          <h2 className="text-lg font-mono font-bold text-white border-b border-surface-border pb-3">
            1. Core Problem & Product Thesis
          </h2>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            DreamDEX Event Contracts continuously create a capital-backed signal about what market participants expect to happen over short time windows (e.g. 5-minute or 15-minute UP/DOWN binary contracts). However, this valuable intelligence traditionally vanishes once the contract settles.
          </p>
          <div className="p-3 bg-surface-subtle border border-surface-border rounded font-mono text-xs text-brand">
            &quot;DreamDEX generates valuable information through real capital and real predictions. CrowdSignal extracts that information, transforms it into structured intelligence, makes it verifiable, and exposes it to humans and other applications.&quot;
          </div>
        </article>

        {/* Article 2: Mathematical Algorithms & Formulas */}
        <article className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-6">
          <h2 className="text-lg font-mono font-bold text-white border-b border-surface-border pb-3">
            2. Crowd Scoring Algorithms
          </h2>

          <div className="space-y-4 font-mono text-xs">
            {/* Formula 1 */}
            <div className="p-4 bg-surface-subtle border border-surface-border rounded space-y-2">
              <h3 className="text-sm font-bold text-white">A. Capital Skew vs. Implied Probability</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Open interest is not confused with probability. Implied probability is derived from crossing order book prices, whereas capital skew measures directional capital exposure:
              </p>
              <pre className="p-3 bg-background border border-surface-border rounded text-cyan-300 overflow-x-auto">
{`CapitalSkew = (OpenInterest_UP - OpenInterest_DOWN) / (TotalOpenInterest + ε)
CapitalSkew_Bps = clamp(round(CapitalSkew * 10000), -10000, 10000)`}
              </pre>
            </div>

            {/* Formula 2 */}
            <div className="p-4 bg-surface-subtle border border-surface-border rounded space-y-2">
              <h3 className="text-sm font-bold text-white">B. Probability Velocity & Acceleration</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Measures the rate of change of market expectations over rolling time windows:
              </p>
              <pre className="p-3 bg-background border border-surface-border rounded text-cyan-300 overflow-x-auto">
{`Velocity = (P_current - P_previous) / Δt_minutes
Acceleration = (Velocity_current - Velocity_previous) / Δt_minutes`}
              </pre>
            </div>

            {/* Formula 3 */}
            <div className="p-4 bg-surface-subtle border border-surface-border rounded space-y-2">
              <h3 className="text-sm font-bold text-white">C. Market Confidence Score (0 - 100)</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Multi-factor composite scoring liquidity depth, bid-ask spread tightness, open interest magnitude, and update recency:
              </p>
              <pre className="p-3 bg-background border border-surface-border rounded text-cyan-300 overflow-x-auto">
{`ConfidenceScore = min(100, Score_Liquidity + Score_Spread + Score_OpenInterest + Score_Freshness)`}
              </pre>
            </div>
          </div>
        </article>

        {/* Article 3: Verifiable Reputation Scoring */}
        <article className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-6">
          <h2 className="text-lg font-mono font-bold text-white border-b border-surface-border pb-3">
            3. Verifiable Predictor Reputation (Anti-Gaming)
          </h2>

          <div className="space-y-4 font-mono text-xs">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              CrowdSignal never ranks participants solely by raw win rate or profit-and-loss (PnL), preventing lucky streaks from distorting the intelligence layer.
            </p>

            <div className="p-4 bg-surface-subtle border border-surface-border rounded space-y-2">
              <h3 className="text-sm font-bold text-white">Wilson Score Confidence Interval Lower Bound</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                For sample size n and win count w (with z = 1.96 for 95% statistical confidence):
              </p>
              <pre className="p-3 bg-background border border-surface-border rounded text-emerald-300 overflow-x-auto">
{`p̂ = correct / total
Wilson = (p̂ + z²/(2n) - z * sqrt((p̂(1 - p̂)/n) + z²/(4n²))) / (1 + z²/n)`}
              </pre>
            </div>

            <div className="p-4 bg-surface-subtle border border-surface-border rounded space-y-2">
              <h3 className="text-sm font-bold text-white">Brier Score Calibration</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Evaluates whether stated confidence corresponds to actual realized binary settlement:
              </p>
              <pre className="p-3 bg-background border border-surface-border rounded text-amber-300 overflow-x-auto">
{`BrierScore = (1 / n) * Σ(confidence_i - actual_outcome_i)²
CalibrationScore = round(max(0, (1 - BrierScore * 1.6) * 100))`}
              </pre>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
