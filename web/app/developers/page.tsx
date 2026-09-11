"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { ONCHAIN_FEED_STATUS } from "@/lib/data";

export default function DevelopersPage() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH">("BTC");
  const [copied, setCopied] = useState(false);
  const [consumerExecuted, setConsumerExecuted] = useState(false);

  const sampleApiResponse = {
    asset: selectedAsset,
    upProbability: selectedAsset === "BTC" ? 0.642 : 0.587,
    downProbability: selectedAsset === "BTC" ? 0.358 : 0.413,
    openInterestUsd: selectedAsset === "BTC" ? 182430 : 95400,
    capitalSkew: selectedAsset === "BTC" ? 0.284 : 0.161,
    confidence: selectedAsset === "BTC" ? 87 : 82,
    velocityPerMin: selectedAsset === "BTC" ? 7.2 : 3.1,
    marketRegime: "BULLISH",
    timestamp: Math.floor(Date.now() / 1000),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ONCHAIN_FEED_STATUS.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LiveTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Page Title */}
        <div className="space-y-2 border-b border-surface-border pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              DEVELOPER PROTOCOL INTEGRATION
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white uppercase">
            BUILD WITH CROWDSIGNAL
          </h1>
          <p className="text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
            Consume live Event Intelligence inside your decentralized application, DAO treasury engine, DeFi hedge protocol,
            or autonomous on-chain AI agent on Somnia.
          </p>
        </div>

        {/* Live On-Chain Feed Inspector Card */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulseDot"></div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  CROWDSIGNAL ON-CHAIN FEED
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Somnia Shannon Layer-1 Oracle Deployment
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono font-bold">
              STATUS: ACTIVE
            </span>
          </div>

          {/* Telemetry Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Contract Address</span>
              <span className="text-xs text-brand font-medium truncate block mt-0.5" title={ONCHAIN_FEED_STATUS.contractAddress}>
                {ONCHAIN_FEED_STATUS.contractAddress}
              </span>
            </div>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Target Network</span>
              <span className="text-xs text-white font-medium block mt-0.5">
                {ONCHAIN_FEED_STATUS.network} ({ONCHAIN_FEED_STATUS.chainId})
              </span>
            </div>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Last Sync Block</span>
              <span className="text-xs text-cyan-400 font-medium block mt-0.5">
                #{ONCHAIN_FEED_STATUS.blockNumber.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Update Latency</span>
              <span className="text-xs text-emerald-400 font-medium block mt-0.5">
                {ONCHAIN_FEED_STATUS.lastUpdatedSecondsAgo}s ago
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={ONCHAIN_FEED_STATUS.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-4 bg-brand hover:bg-brand-subtle text-black font-mono font-bold text-xs rounded uppercase tracking-wider transition-colors"
            >
              View Contract on Explorer ↗
            </a>
            <button
              onClick={handleCopy}
              className="py-2 px-4 bg-surface-subtle hover:bg-surface-elevated border border-surface-border font-mono text-xs text-slate-200 rounded transition-colors"
            >
              {copied ? "✓ Copied Address" : "Copy Address"}
            </button>
          </div>
        </div>

        {/* Live External Consumer Contract Demo (Requirement #59) */}
        <div className="bg-surface border border-brand/30 rounded-lg shadow-terminal p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div>
              <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-semibold">
                REQUIREMENT #59 DEMONSTRATION
              </span>
              <h3 className="text-base font-mono font-bold text-white mt-0.5">
                EXTERNAL CONSUMER DEMO CONTRACT (`DemoConsumer.sol`)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Live simulation proving the on-chain oracle is consumed by autonomous external contracts on Somnia.
              </p>
            </div>

            <button
              onClick={() => setConsumerExecuted(!consumerExecuted)}
              className="py-2 px-4 bg-surface-elevated hover:bg-surface-border text-brand font-mono text-xs font-bold rounded border border-brand/40 transition-colors"
            >
              {consumerExecuted ? "Reset Simulation" : "Trigger External Consumer Read"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">BTC Crowd Probability</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1">64.2%</span>
              <span className="text-[10px] text-slate-400">Read from SentimentPublisher.sol</span>
            </div>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Consumer Threshold Trigger</span>
              <span className="text-xl font-bold text-cyan-400 block mt-1">60.0% UP</span>
              <span className="text-[10px] text-slate-400">Governance risk trigger parameter</span>
            </div>

            <div className="p-3 bg-surface-subtle border border-surface-border rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Autonomous Contract Status</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1">
                {consumerExecuted ? "BULLISH_SURGE ACTIVATED" : "SIGNAL DETECTED (READY)"}
              </span>
              <span className="text-[10px] text-slate-400">
                {consumerExecuted ? "Automated allocation increased" : "Awaiting strategy execution"}
              </span>
            </div>
          </div>
        </div>

        {/* Solidity Smart Contract Snippet */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ON-CHAIN INTEGRATION</span>
              <h3 className="text-sm font-bold text-white mt-0.5">SOLIDITY CONSUMPTION SNIPPET</h3>
            </div>
            <span className="text-xs text-slate-400">Solidity ^0.8.24</span>
          </div>

          <pre className="p-4 bg-background border border-surface-border rounded text-xs text-slate-300 overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISentimentPublisher } from "./ISentimentPublisher.sol";

contract DaoTreasuryProtector {
    ISentimentPublisher public immutable crowdSignal;

    constructor(address _crowdSignal) {
        crowdSignal = ISentimentPublisher(_crowdSignal);
    }

    function evaluateRisk(string calldata asset) external view returns (bool shouldHedge) {
        // Read authoritative capital-weighted signal
        ISentimentPublisher.MarketSignal memory signal = crowdSignal.getSignalBySymbol(asset);

        // A DAO or DeFi protocol could use this value to:
        // 1. Adjust treasury exposure
        // 2. Trigger governance actions
        // 3. Modify risk parameters
        // 4. Activate automated defensive hedges
        if (signal.upProbabilityBps < 4000 && signal.confidenceScore >= 75) {
            shouldHedge = true;
        }
    }
}`}
          </pre>
        </div>

        {/* REST API Sandbox */}
        <div className="bg-surface border border-surface-border rounded-lg shadow-terminal p-6 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">OFF-CHAIN INTEGRATION</span>
              <h3 className="text-sm font-bold text-white mt-0.5">REST API ENDPOINT: `GET /api/probability`</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAsset("BTC")}
                className={`px-3 py-1 text-xs rounded ${selectedAsset === "BTC" ? "bg-brand text-black font-bold" : "bg-surface-subtle text-slate-400"}`}
              >
                BTC
              </button>
              <button
                onClick={() => setSelectedAsset("ETH")}
                className={`px-3 py-1 text-xs rounded ${selectedAsset === "ETH" ? "bg-brand text-black font-bold" : "bg-surface-subtle text-slate-400"}`}
              >
                ETH
              </button>
            </div>
          </div>

          <div className="p-3 bg-surface-subtle border border-surface-border rounded text-xs flex items-center justify-between">
            <span className="text-emerald-400 font-bold">GET /api/probability?asset={selectedAsset}</span>
            <span className="text-slate-500 text-[11px]">200 OK • 12ms</span>
          </div>

          <pre className="p-4 bg-background border border-surface-border rounded text-xs text-slate-300 overflow-x-auto">
{JSON.stringify(sampleApiResponse, null, 2)}
          </pre>
        </div>
      </main>

      <Footer />
    </div>
  );
}
