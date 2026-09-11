"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { LiveCrowdSignal } from "@/components/dashboard/LiveCrowdSignal";
import { CrowdVsPredictors } from "@/components/dashboard/CrowdVsPredictors";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { INITIAL_SIGNALS, INITIAL_DIVERGENCE } from "@/lib/data";
import { DemoSimulator } from "@/lib/demoSimulator";

const simulator = new DemoSimulator();

export default function OverviewPage() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [signal, setSignal] = useState(INITIAL_SIGNALS.BTC);
  const [divergence, setDivergence] = useState(INITIAL_DIVERGENCE);

  const handleToggleDemo = () => {
    if (!isDemoMode) {
      setIsDemoMode(true);
      const nextDemo = simulator.nextStep();
      setSignal(simulator.applyToSignal(INITIAL_SIGNALS.BTC));
      setDivergence(simulator.applyToDivergence(INITIAL_DIVERGENCE));
    } else {
      // Step through demo sequence or reset
      const nextDemo = simulator.nextStep();
      if (nextDemo.step === 3) {
        setIsDemoMode(false);
        setSignal(INITIAL_SIGNALS.BTC);
        setDivergence(INITIAL_DIVERGENCE);
      } else {
        setSignal(simulator.applyToSignal(INITIAL_SIGNALS.BTC));
        setDivergence(simulator.applyToDivergence(INITIAL_DIVERGENCE));
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDemoMode={isDemoMode} onToggleDemo={handleToggleDemo} />
      <LiveTicker />

      {/* Demo Mode Notice Banner if active */}
      {isDemoMode && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-300 flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>
            <strong>DEMO MODE ACTIVE:</strong> Simulating controlled probability transition (42% → 48% → 57% → 64.2%). Click
            &quot;DEMO MODE ACTIVE&quot; button in the header to advance cycle.
          </span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Top Hero Section */}
        <div className="space-y-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-subtle border border-surface-border rounded-full text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
            <span>Live Event Intelligence & Verifiable Reputation</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
              CROWDSIGNAL
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-200 max-w-2xl font-sans">
              The intelligence layer for Event Contracts.
            </p>
            <p className="text-sm text-slate-400 max-w-2xl font-sans leading-relaxed">
              Turn real market participation into verifiable crowd intelligence and predictor reputation. Powered by Somnia
              Shannon and DreamDEX on-chain Central Limit Order Books.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/markets"
              className="py-2.5 px-5 bg-brand hover:bg-brand-subtle text-black font-mono font-bold text-xs rounded uppercase tracking-wider transition-colors shadow-highlight"
            >
              Explore Markets
            </Link>
            <Link
              href="/leaderboard"
              className="py-2.5 px-5 bg-surface-subtle hover:bg-surface-elevated border border-surface-border text-slate-200 font-mono text-xs rounded transition-colors"
            >
              View Leaderboard
            </Link>
            <Link
              href="/developers"
              className="text-xs font-mono text-slate-400 hover:text-brand transition-colors flex items-center gap-1 ml-2"
            >
              <span>For Developers</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Live Crowd Signal Main Terminal Card */}
        <section aria-label="Live Crowd Signal">
          <LiveCrowdSignal signal={signal} />
        </section>

        {/* Crowd vs Verified Predictors Flagship Section */}
        <section aria-label="Crowd vs Verified Predictors">
          <CrowdVsPredictors divergence={divergence} />
        </section>

        {/* How It Works & Architecture Section */}
        <section aria-label="How CrowdSignal Works">
          <HowItWorks />
        </section>
      </main>

      <Footer />
    </div>
  );
}
