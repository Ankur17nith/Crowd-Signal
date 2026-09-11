"use client";

import React, { use } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { ProbabilityChart } from "@/components/charts/ProbabilityChart";
import { INITIAL_MARKETS } from "@/lib/data";

interface MarketPageProps {
  params: Promise<{ id: string }>;
}

export default function MarketDetailPage({ params }: MarketPageProps) {
  const resolvedParams = use(params);
  const market =
    INITIAL_MARKETS.find((m) => m.id === resolvedParams.id) || INITIAL_MARKETS[0];

  const participants = [
    { address: "0xA91C283F41982bde9204A841E3486a4392C10892", short: "0xA91...892", prediction: "UP", confidence: 84, score: 86 },
    { address: "0x72BC908221804B3519c8120dE3F57108947231A8", short: "0x72B...1A8", prediction: "DOWN", confidence: 71, score: 81 },
    { address: "0x91C80415A99B22c1076612DaF089E4160412891C", short: "0x91C...91C", prediction: "UP", confidence: 68, score: 77 },
  ];

  const sentimentHistory = [
    { time: "10:00", sentiment: "Bullish", up: 61.2 },
    { time: "10:05", sentiment: "Bullish", up: 63.5 },
    { time: "10:10", sentiment: "Neutral", up: 51.0 },
    { time: "10:15", sentiment: "Bearish", up: 44.2 },
    { time: "10:20", sentiment: "Bearish", up: 41.2 },
    { time: "10:25", sentiment: "Bullish", up: 64.2 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/markets" className="hover:text-white transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-brand font-medium">{market.title}</span>
        </div>

        {/* Contract Header Block */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulseDot"></span>
                <span>SOMNIA CLOB ORDER BOOK #{market.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                {market.asset} {market.interval.toUpperCase()} EVENT CONTRACT
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Directional binary call settled via Somnia Reactive Oracle Hub against window opening price ${market.openPrice.toLocaleString()}.
              </p>
            </div>

            {/* Time Remaining Counter */}
            <div className="text-right font-mono p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block tracking-wider">Time Remaining</span>
              <span className="text-2xl font-black text-brand tracking-tight">08:42</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">TRADING OPEN</span>
            </div>
          </div>

          {/* Core Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Implied UP Probability</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                {market.upProbability.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-400">Touch ask: {market.currentTouchAsk}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Implied DOWN Probability</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">
                {market.downProbability.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-400">Touch bid: {market.currentTouchBid}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Open Interest</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                ${market.openInterestUsd.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">Real collateral locked</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Traded Volume</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                ${market.volumeUsd.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">USDso Quote Volume</span>
            </div>
          </div>
        </div>

        {/* Interactive Chart Section */}
        <section aria-label="Interactive Probability Chart">
          <ProbabilityChart />
        </section>

        {/* Probability Momentum & Market Confidence Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Probability Momentum */}
          <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal space-y-4">
            <div className="border-b border-surface-border pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">RATE OF CHANGE</span>
                <h3 className="text-base font-bold text-white mt-0.5">PROBABILITY MOMENTUM</h3>
              </div>
              <span className="px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                HIGH MOMENTUM
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-brand">+8.2%</span>
              <span className="text-sm text-slate-400 font-medium">/ minute</span>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-surface-border rounded text-xs font-sans text-slate-300 leading-relaxed">
              UP probability increased rapidly from <strong className="font-mono text-white">41.2% → 64.2%</strong> during the last 3 minutes, driven by $38,400 aggressive market buy fills.
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-surface-border">
              <span>Acceleration: +50 bps/min²</span>
              <span>Calculation: Deterministic rolling derivative</span>
            </div>
          </div>

          {/* Market Confidence Breakdown */}
          <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal space-y-4">
            <div className="border-b border-surface-border pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">STATISTICAL INTEGRITY</span>
                <h3 className="text-base font-bold text-white mt-0.5">MARKET CONFIDENCE</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-cyan-400">87</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            {/* Confidence Components */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-surface-subtle border border-surface-border rounded">
                <span className="text-slate-400">Liquidity Depth</span>
                <span className="text-emerald-400 font-bold">HIGH (Depth &gt; $50k)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-subtle border border-surface-border rounded">
                <span className="text-slate-400">Open Interest</span>
                <span className="text-emerald-400 font-bold">HIGH ($182,430)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-subtle border border-surface-border rounded">
                <span className="text-slate-400">Order Book Spread</span>
                <span className="text-emerald-400 font-bold">LOW (0.008 BPS)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-subtle border border-surface-border rounded">
                <span className="text-slate-400">Participant Diversity</span>
                <span className="text-emerald-400 font-bold">HIGH (342 trades)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-subtle border border-surface-border rounded">
                <span className="text-slate-400">Data Freshness</span>
                <span className="text-cyan-400 font-bold">HIGH (2.4s ago)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Predictors in this Window & Crowd Sentiment History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Top Predictors Active */}
          <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal space-y-4">
            <div className="border-b border-surface-border pb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">VERIFIED INTELLIGENCE</span>
              <h3 className="text-base font-bold text-white mt-0.5">TOP PREDICTORS IN THIS WINDOW</h3>
            </div>

            <div className="space-y-2 text-xs">
              {participants.map((p) => (
                <div
                  key={p.address}
                  className="flex items-center justify-between p-3 bg-surface-subtle hover:bg-surface-elevated border border-surface-border rounded transition-colors"
                >
                  <div>
                    <Link
                      href={`/trader/${p.address}`}
                      className="font-bold text-brand hover:underline block"
                    >
                      {p.short}
                    </Link>
                    <span className="text-[10px] text-slate-500">Skill Score: {p.score}/100</span>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold ${p.prediction === "UP" ? "text-emerald-400" : "text-rose-400"}`}>
                      {p.prediction} ({p.confidence}%)
                    </span>
                    <span className="text-[10px] text-amber-400 block">Pending Resolution</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crowd Sentiment History */}
          <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal space-y-4">
            <div className="border-b border-surface-border pb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">STATE PERSISTENCE</span>
              <h3 className="text-base font-bold text-white mt-0.5">CROWD SENTIMENT HISTORY</h3>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              CrowdSignal persists market intelligence historically rather than letting it vanish upon contract settlement.
            </p>

            <div className="space-y-2 text-xs">
              {sentimentHistory.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-surface-subtle border border-surface-border rounded"
                >
                  <span className="text-slate-400 font-semibold">{s.time}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">UP {s.up}%</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        s.sentiment === "Bullish"
                          ? "bg-bull-tint border-bull-border text-bull"
                          : s.sentiment === "Bearish"
                          ? "bg-bear-tint border-bear-border text-bear"
                          : "bg-surface-elevated border-surface-border text-slate-400"
                      }`}
                    >
                      {s.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
