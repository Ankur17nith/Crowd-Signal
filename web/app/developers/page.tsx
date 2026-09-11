"use client";

import React, { useState } from "react";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"solidity" | "typescript" | "python">("solidity");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const oracleAddress = "0x7a29D4f39E79F1288B1824F9b418eE195fC23b21";

  const handleCopyCode = () => {
    let code = "";
    if (activeTab === "solidity") code = SOLIDITY_CODE;
    else if (activeTab === "typescript") code = TYPESCRIPT_CODE;
    else code = PYTHON_CODE;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(oracleAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Page Header */}
      <section className="flex flex-col gap-2 pb-4 border-b border-[#292929]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-[#A1A1A1]">
            API & Contract Infrastructure
          </span>
          <span className="text-[11px] font-mono text-[#707070] tabular-nums">
            v1.2.4-shannon
          </span>
        </div>
        <h1 className="text-[28px] font-semibold text-[#F5F5F5] tracking-tight">
          Build on CrowdSignal
        </h1>
        <p className="text-[14px] text-[#A1A1A1] max-w-3xl">
          Turn DreamDEX Event Contract activity into programmable, verifiable on-chain intelligence on Somnia.
        </p>
      </section>

      {/* Capabilities Overview (Typographic 3-column layout) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-2">
              01 // TELEMETRY
            </div>
            <h2 className="text-[18px] font-semibold text-[#F5F5F5] mb-2">
              Crowd Probability
            </h2>
            <p className="text-[13px] text-[#707070] leading-relaxed">
              Live market-implied directional probability feeds for DeFi, automated hedging, and synthetic indices.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-[#202020] flex items-center justify-between text-[11px]">
            <span className="text-[#707070]">Update Cycle</span>
            <span className="text-[#F5F5F5] font-mono tabular-nums">Sub-block (~400ms)</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-2">
              02 // ATTESTATION
            </div>
            <h2 className="text-[18px] font-semibold text-[#F5F5F5] mb-2">
              Predictor Reputation
            </h2>
            <p className="text-[13px] text-[#707070] leading-relaxed">
              Query verified wallet scores, Brier calibration metrics, and accuracy records trustlessly on-chain.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-[#202020] flex items-center justify-between text-[11px]">
            <span className="text-[#707070]">Verification</span>
            <span className="text-[#F5F5F5] font-mono">Merkle Compact Proof</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-2">
              03 // ORACLE ENGINE
            </div>
            <h2 className="text-[18px] font-semibold text-[#F5F5F5] mb-2">
              On-Chain Sentiment
            </h2>
            <p className="text-[13px] text-[#707070] leading-relaxed">
              Direct sub-second oracle consumption via native Somnia Shannon smart contracts and zero-cost multicall.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-[#202020] flex items-center justify-between text-[11px]">
            <span className="text-[#707070]">Execution Overhead</span>
            <span className="text-[#F5F5F5] font-mono tabular-nums">&lt; 21,400 Gas</span>
          </div>
        </div>
      </section>

      {/* Live On-Chain Sentiment Feed Card */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#707070]">
                Telemetry Feed
              </span>
              <span className="text-[#707070]">/</span>
              <span className="text-[11px] text-[#F5F5F5] font-medium">Contract State</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#F5F5F5]">
              CrowdSignal Feed — Live Contract State
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#0D0D0D] border border-[#202020] px-3 py-1.5 rounded-lg text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4DA3FF]" />
              <span className="text-[#F5F5F5] font-medium">Active</span>
            </div>
            <span className="text-[#707070]">•</span>
            <span className="text-[#707070]">
              Network: <span className="text-[#F5F5F5]">Somnia Shannon</span>
            </span>
            <span className="text-[#707070]">•</span>
            <span className="text-[#707070]">
              Block: <span className="text-[#F5F5F5] font-mono tabular-nums">#18,492,084</span>
            </span>
            <span className="text-[#707070]">•</span>
            <span className="text-[#707070]">
              Latency: <span className="text-[#4DA3FF] font-mono tabular-nums">420ms</span>
            </span>
          </div>
        </div>

        {/* Parameter Display Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* BTC / USD Feed Entry */}
          <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">BTC / USD</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#707070]">
                  15m Window
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#707070] tabular-nums">
                ID: 0x425443...
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Probability</span>
                <span className="text-[18px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                  64.2% <span className="text-[11px] font-normal text-[#4DA3FF]">UP</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Capital Skew</span>
                <span className="text-[18px] text-[#4DA3FF] font-mono font-semibold tabular-nums">
                  +28.4%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Confidence</span>
                <span className="text-[18px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                  87 <span className="text-[11px] text-[#707070] font-normal">/ 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* ETH / USD Feed Entry */}
          <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">ETH / USD</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#707070]">
                  15m Window
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#707070] tabular-nums">
                ID: 0x455448...
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Probability</span>
                <span className="text-[18px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                  58.7% <span className="text-[11px] font-normal text-[#4DA3FF]">UP</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Capital Skew</span>
                <span className="text-[18px] text-[#4DA3FF] font-mono font-semibold tabular-nums">
                  +14.1%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#707070]">Confidence</span>
                <span className="text-[18px] text-[#F5F5F5] font-mono font-semibold tabular-nums">
                  82 <span className="text-[11px] text-[#707070] font-normal">/ 100</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Footer & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D0D0D] border border-[#202020] p-3.5 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#707070] whitespace-nowrap">
              Core Oracle Contract
            </span>
            <code className="text-[12px] text-[#F5F5F5] font-mono truncate select-all bg-[#141414] px-2 py-0.5 rounded border border-[#202020]">
              {oracleAddress}
            </code>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="h-7 px-2.5 rounded bg-[#141414] hover:bg-[#202020] border border-[#202020] text-[#F5F5F5] text-[11px] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span>{copiedAddress ? "Copied!" : "Copy Address"}</span>
            </button>
            <a
              href="https://shannon-explorer.somnia.network"
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 px-2.5 rounded bg-[#141414] hover:bg-[#202020] border border-[#202020] text-[#A1A1A1] hover:text-[#F5F5F5] text-[11px] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              <span>Explorer</span>
            </a>
          </div>
        </div>
      </section>

      {/* Code Panel & Integration Examples */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#292929]">
            {(["solidity", "typescript", "python"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#202020] text-white"
                    : "text-[#707070] hover:text-[#F5F5F5]"
                }`}
              >
                {tab === "solidity"
                  ? "Solidity"
                  : tab === "typescript"
                  ? "TypeScript / SDK"
                  : "Python"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {copiedCode && (
              <span className="text-[11px] text-[#4DA3FF] font-mono">
                Copied to clipboard
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyCode}
              className="h-8 px-3 rounded bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#0D0D0D] text-[12px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Copy Code</span>
            </button>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#292929] rounded-lg p-5 overflow-x-auto">
          <pre className="font-mono text-[12px] leading-relaxed text-[#F5F5F5] m-0 select-text">
            <code>
              {activeTab === "solidity" && SOLIDITY_CODE}
              {activeTab === "typescript" && TYPESCRIPT_CODE}
              {activeTab === "python" && PYTHON_CODE}
            </code>
          </pre>
        </div>
      </section>

      {/* External Consumer Demonstration Module (Live Simulation) */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#707070]">schema</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#707070]">
              External Application Consuming CrowdSignal Feed
            </span>
          </div>
          <h2 className="text-[18px] font-semibold text-[#F5F5F5]">
            Demonstration Consumer (Live Simulation)
          </h2>
          <p className="text-[13px] text-[#707070]">
            Architectural simulation of an autonomous liquidity routing vault consuming CrowdSignal directional feeds on Somnia Shannon.
          </p>
        </div>

        {/* Execution Metric Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Input Signal</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#F5F5F5] tabular-nums">
                64.2%
              </span>
              <span className="text-[11px] text-[#707070]">BTC Directional Probability</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#4DA3FF]" style={{ width: "64.2%" }} />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Configured Threshold</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#F5F5F5] tabular-nums">
                60.0%
              </span>
              <span className="text-[11px] text-[#707070]">Trigger Gate [Delta &gt; 0]</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#707070]" style={{ width: "60%" }} />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Verified Divergence</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#E7A94B] tabular-nums">
                15.1 pp
              </span>
              <span className="text-[11px] text-[#707070]">Bearish Skew Offset</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#E7A94B]" style={{ width: "38%" }} />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Execution Status</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#4DA3FF] tabular-nums">
                14ms
              </span>
              <span className="text-[11px] text-[#707070]">Somnia Shannon Mempool</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#4DA3FF]" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* Action Confirmation Banner */}
        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-[#141414] border border-[#202020] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4DA3FF] text-[18px]">bolt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#707070]">
                Triggered Protocol Execution
              </span>
              <span className="text-[13px] text-[#F5F5F5] font-medium truncate">
                AUTOMATED HEDGE REBALANCED — NO ORDERBOOK OVERPAY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <span className="text-[#707070] tabular-nums">Gas Spent: 19,420 Somnia GAS</span>
            <span className="px-2 py-0.5 rounded bg-[#141414] text-[#A1A1A1] font-mono border border-[#202020]">
              TX: 0x9e...2a11
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

const SOLIDITY_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISentimentPublisher } from "./interfaces/ISentimentPublisher.sol";

contract LiquidatorVault {
    ISentimentPublisher public immutable publisher;

    constructor(address _publisher) {
        publisher = ISentimentPublisher(_publisher);
    }

    function checkMarketHealth(bytes32 assetKey) external view returns (bool isStable) {
        // Read authoritative crowd probability and market confidence from CrowdSignal
        ISentimentPublisher.MarketSignal memory sig = publisher.getSignal(assetKey);

        // Require fresh data (< 5 minutes) and high market confidence (>= 70/100)
        require(block.timestamp - sig.timestamp <= 300, "STALE_SENTIMENT");
        require(sig.confidenceScore >= 70, "LOW_MARKET_CONFIDENCE");

        // Verify cryptographic provenance hash before executing high-capital vault decisions
        ISentimentPublisher.ProvenanceRecord memory prov = publisher.getProvenance(assetKey);
        require(prov.algorithmVersionHash == keccak256("CS-PROB-2.0"), "INVALID_ALGORITHM_PROVENANCE");

        // Flag market as stable if capital skew is within balanced range
        return (sig.capitalSkewBps > -5000 && sig.capitalSkewBps < 5000);
    }
}`;

const TYPESCRIPT_CODE = `import { createPublicClient, http, parseAbi } from "viem";
import { somniaShannon } from "./chains";

const client = createPublicClient({
  chain: somniaShannon,
  transport: http("https://api.infra.testnet.somnia.network/"),
});

const SENTIMENT_PUBLISHER_ADDRESS = "0x7a29D4f39E79F1288B1824F9b418eE195fC23b21";

const ABI = parseAbi([
  "function getSignal(bytes32 assetKey) external view returns ((uint16 upProbabilityBps, int16 capitalSkewBps, uint16 confidenceScore, int16 velocityBpsPerMin, int16 accelerationBpsPerMin2, uint64 timestamp, uint64 openInterestUsd, uint64 totalVolumeUsd, uint32 activeWindowCount))",
  "function getProvenance(bytes32 assetKey) external view returns ((bytes32 algorithmVersionHash, bytes32 inputSnapshotHash, bytes32 signalHash, uint64 timestamp))"
]);

export async function fetchMarketIntelligence(assetKey: \`0x\${string}\`) {
  const signal = await client.readContract({
    address: SENTIMENT_PUBLISHER_ADDRESS,
    abi: ABI,
    functionName: "getSignal",
    args: [assetKey],
  });

  console.log(\`Implied Prob: \${signal.upProbabilityBps / 100}% | Confidence: \${signal.confidenceScore}/100\`);
}`;

const PYTHON_CODE = `from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://api.infra.testnet.somnia.network/"))
oracle_address = "0x7a29D4f39E79F1288B1824F9b418eE195fC23b21"

def check_oracle_telemetry():
    assert w3.is_connected(), "Failed to connect to Somnia Shannon"
    # Query CrowdSignal REST API or RPC contract read
    print(f"Connected to Somnia Shannon Testnet. Chain ID: {w3.eth.chain_id}")
`;
