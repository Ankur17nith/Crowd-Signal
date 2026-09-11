"use client";

import React, { useState } from "react";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"solidity" | "typescript" | "python">("solidity");
  const [activeApiTab, setActiveApiTab] = useState<"overview" | "markets" | "probability" | "reputation" | "divergence">("overview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Authoritative Somnia Shannon testnet contract deployment
  const publisherAddress = "0xC526aB481079549320e8549e390C8B1D471804E1";
  const reputationAddress = "0x71AeD4810965319804e84381C489110B529048E2";

  const handleCopyCode = () => {
    let code = "";
    if (activeTab === "solidity") code = SOLIDITY_CODE;
    else if (activeTab === "typescript") code = TYPESCRIPT_CODE;
    else code = PYTHON_CODE;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="flex flex-col w-full gap-10 max-w-[1140px] mx-auto pb-16">
      {/* SECTION 1: BUILD ON CROWDSIGNAL */}
      <section className="flex flex-col gap-3 pb-6 border-b border-[#292929]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#292929] text-[#4DA3FF]">
            Developer Portal &amp; Integration Specs
          </span>
          <span className="text-[11px] font-mono text-[#707070]">
            Somnia Shannon Testnet (Chain ID: 50312)
          </span>
        </div>
        <h1 className="text-[32px] font-semibold text-[#F5F5F5] tracking-tight">
          Build on CrowdSignal
        </h1>
        <p className="text-[15px] text-[#A1A1A1] max-w-3xl leading-relaxed">
          CrowdSignal converts high-frequency DreamDEX Event Contract activity into live, verifiable, and reusable market intelligence.
          Developers can consume latent crowd probability, orderbook microprice, Shannon entropy, empirical predictor reputation, crowd-vs-verified divergence, and on-chain cryptographic provenance anchors.
        </p>
      </section>

      {/* SECTION 2: WHY DEVELOPERS USE IT */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div>
          <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
            01 // INFRASTRUCTURE LAYER
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Why Integrate CrowdSignal?
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1 max-w-3xl leading-relaxed">
            Building consumer applications, automated hedging vaults, or autonomous trading agents on prediction markets typically requires running complex, custom indexing infrastructure. CrowdSignal eliminates redundant engineering by providing a turnkey intelligence layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-[12px] font-mono text-[#E7A94B] uppercase font-semibold">
                Without CrowdSignal (Custom Stack)
              </span>
              <span className="text-[10px] font-mono text-[#707070]">High Overhead</span>
            </div>
            <div className="space-y-2 text-[12px] font-mono text-[#707070] leading-relaxed">
              <p>• Polling dozens of individual binary token contracts</p>
              <p>• Maintaining custom WebSocket listeners for orderbooks</p>
              <p>• Writing ad-hoc microprice &amp; probability estimation</p>
              <p>• Managing dedicated SQLite/Postgres timeseries pipelines</p>
              <p>• Calculating Brier skill scores and wallet tracking locally</p>
              <p className="text-[#E7A94B] pt-2">
                &rarr; Hundreds of hours spent maintaining bespoke backend pipelines.
              </p>
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-[12px] font-mono text-[#4DA3FF] uppercase font-semibold">
                With CrowdSignal (Turnkey Intelligence)
              </span>
              <span className="text-[10px] font-mono text-[#4DA3FF]">Single Integration</span>
            </div>
            <div className="space-y-2 text-[12px] font-mono text-[#A1A1A1] leading-relaxed">
              <p>• Canonical market discovery &amp; continuous parallel ingestion</p>
              <p>• Stoikov microprice &amp; recursive Bayesian latent filtering</p>
              <p>• Shannon entropy compression &amp; online changepoint detection</p>
              <p>• Market-relative Brier skill &amp; verified predictor scoring</p>
              <p>• Single REST API query (&lt;20ms warm) or Solidity contract call</p>
              <p className="text-[#4DA3FF] pt-2">
                &rarr; Connect in minutes via standard REST or smart contract interfaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT CAN BE CONSUMED */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
            02 // CAPABILITY MATRIX
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Verifiable Capabilities Matrix
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1">
            Every capability documented below corresponds to active code implemented in the indexer, database, and smart contracts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-[#292929] text-[#707070] font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Capability</th>
                <th className="py-2.5 px-3">Underlying Source</th>
                <th className="py-2.5 px-3">Availability</th>
                <th className="py-2.5 px-3">Consumption Mode</th>
                <th className="py-2.5 px-3">Update Cadence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] text-[#A1A1A1]">
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Latent Probability &amp; Microprice</td>
                <td className="py-3 px-3">DreamDEX Orderbooks + Stoikov Filter</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#102A1A] text-[#4ADE80] font-mono text-[11px]">Active (BTC/ETH)</span></td>
                <td className="py-3 px-3 font-mono">REST + On-Chain Feed</td>
                <td className="py-3 px-3 font-mono text-[#707070]">~3.4s Indexer Cycle</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Market Registry &amp; State</td>
                <td className="py-3 px-3">Somnia Markets SDK</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#102A1A] text-[#4ADE80] font-mono text-[11px]">Active (38 Markets)</span></td>
                <td className="py-3 px-3 font-mono">REST (/api/markets)</td>
                <td className="py-3 px-3 font-mono text-[#707070]">Continuous Sync</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Entropy &amp; Information Velocity</td>
                <td className="py-3 px-3">CS-INFO-1.0 Analytics Engine</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#102A1A] text-[#4ADE80] font-mono text-[11px]">Active</span></td>
                <td className="py-3 px-3 font-mono">REST (/api/probability)</td>
                <td className="py-3 px-3 font-mono text-[#707070]">Every Signal Epoch</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Cryptographic Provenance</td>
                <td className="py-3 px-3">Keccak-256 State Anchors</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#102A1A] text-[#4ADE80] font-mono text-[11px]">Active</span></td>
                <td className="py-3 px-3 font-mono">On-Chain (<code className="text-[#4DA3FF]">getProvenance</code>)</td>
                <td className="py-3 px-3 font-mono text-[#707070]">Per Published Block</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Predictor Reputation</td>
                <td className="py-3 px-3">Contemporaneous Brier Scoring</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#2A2010] text-[#E7A94B] font-mono text-[11px]">Awaiting Testnet Fills</span></td>
                <td className="py-3 px-3 font-mono">REST + ReputationRegistry.sol</td>
                <td className="py-3 px-3 font-mono text-[#707070]">On Contract Settlement</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#F5F5F5]">Crowd-vs-Predictor Divergence</td>
                <td className="py-3 px-3">Crowd vs Verified Consensus</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-[#2A2010] text-[#E7A94B] font-mono text-[11px]">Awaiting Predictors</span></td>
                <td className="py-3 px-3 font-mono">REST (/api/divergence)</td>
                <td className="py-3 px-3 font-mono text-[#707070]">On Predictor Activity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: QUICK START */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div>
          <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
            03 // GETTING STARTED
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Quick Start Reference
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1">
            Connect your frontend or backend to the Somnia Shannon testnet environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px] font-mono">
          <div className="bg-[#0D0D0D] border border-[#202020] p-3 rounded">
            <span className="text-[#707070] block text-[10px] uppercase">Network</span>
            <span className="text-[#F5F5F5] font-semibold">Somnia Shannon</span>
          </div>
          <div className="bg-[#0D0D0D] border border-[#202020] p-3 rounded">
            <span className="text-[#707070] block text-[10px] uppercase">Chain ID</span>
            <span className="text-[#F5F5F5] font-semibold tabular-nums">50312</span>
          </div>
          <div className="bg-[#0D0D0D] border border-[#202020] p-3 rounded">
            <span className="text-[#707070] block text-[10px] uppercase">Public RPC</span>
            <span className="text-[#4DA3FF] text-[11px] truncate block">api.infra.testnet.somnia.network</span>
          </div>
          <div className="bg-[#0D0D0D] border border-[#202020] p-3 rounded">
            <span className="text-[#707070] block text-[10px] uppercase">Core Publisher</span>
            <span className="text-[#4DA3FF] text-[11px] truncate block">{publisherAddress.slice(0, 10)}...</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#707070]">
            Example cURL Request
          </span>
          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-3 font-mono text-[12px] text-[#F5F5F5] flex items-center justify-between">
            <code>curl -s http://localhost:3000/api/overview?asset=BTC | jq .signal.data</code>
          </div>
        </div>
      </section>

      {/* SECTION 5: REST API REFERENCE */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div>
          <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
            04 // REST API REFERENCE
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Complete HTTP Endpoint Documentation
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1">
            All endpoints are served from the local Next.js instance reading authoritative materialized SQLite WAL state.
          </p>
        </div>

        {/* API Route Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#202020] pb-3">
          {(
            [
              { id: "overview", label: "GET /api/overview" },
              { id: "markets", label: "GET /api/markets" },
              { id: "probability", label: "GET /api/probability" },
              { id: "reputation", label: "GET /api/reputation" },
              { id: "divergence", label: "GET /api/divergence" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveApiTab(t.id)}
              className={`px-3 py-1 rounded text-[12px] font-mono transition-colors ${
                activeApiTab === t.id
                  ? "bg-[#202020] text-[#4DA3FF] border border-[#4DA3FF]/30"
                  : "bg-[#0D0D0D] text-[#707070] hover:text-[#F5F5F5] border border-[#202020]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeApiTab === "overview" && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#1E3A5F] text-[#60A5FA] font-mono text-[11px] font-semibold">
                GET
              </span>
              <code className="font-mono text-[13px] text-[#F5F5F5]">/api/overview</code>
              <span className="text-[#707070] text-[12px]">Aggregated market overview &amp; active telemetry</span>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              Returns aggregated probabilistic sentiment, active canonical markets, and divergence observations for the specified asset in a single non-waterfall request.
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#707070] uppercase">Query Parameters</span>
              <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] space-y-1">
                <div><span className="text-[#4DA3FF]">asset</span> <span className="text-[#707070]">(string, optional)</span>: Asset symbol, e.g. <code className="text-[#F5F5F5]">BTC</code> (default), <code className="text-[#F5F5F5]">ETH</code>, <code className="text-[#F5F5F5]">SOL</code></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#707070] uppercase">Example Response Shape (200 OK)</span>
              <pre className="p-3.5 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] text-[#F5F5F5] overflow-x-auto max-h-[280px]">
{`{
  "signal": {
    "status": "live",
    "data": {
      "asset": "BTC",
      "symbol": "BTC / USDso",
      "upProbability": 42.9,
      "downProbability": 57.1,
      "microProbability": 42.9,
      "spread": 0.01,
      "confidence": 91,
      "entropy": 0.985,
      "informationVelocity": 0.012,
      "marketRegime": "STABLE",
      "openInterestUsd": 110421,
      "provenance": {
        "algorithmVersion": "CS-PROB-2.0",
        "signalHash": "0x7d5783df...",
        "timestamp": 1789144383
      }
    }
  },
  "divergence": {
    "status": "unavailable",
    "message": "No verified predictor positions active for this asset in the current evaluation window."
  },
  "markets": {
    "status": "live",
    "count": 38,
    "markets": [...]
  },
  "elapsedMs": 6
}`}
              </pre>
            </div>
          </div>
        )}

        {activeApiTab === "markets" && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#1E3A5F] text-[#60A5FA] font-mono text-[11px] font-semibold">
                GET
              </span>
              <code className="font-mono text-[13px] text-[#F5F5F5]">/api/markets</code>
              <span className="text-[#707070] text-[12px]">All 38 canonical DreamDEX Event Contracts</span>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              Returns all active event contracts discovered on Somnia Shannon, joined with their latest materialized orderbook touch quotes, spreads, and open interest.
            </p>
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#707070] uppercase">Response Fields</span>
              <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] space-y-1">
                <div><span className="text-[#4DA3FF]">id</span>: Canonical Event Contract market ID (bytes32 hex)</div>
                <div><span className="text-[#4DA3FF]">asset</span>: Underlying asset (<code className="text-[#F5F5F5]">BTC</code>, <code className="text-[#F5F5F5]">ETH</code>, etc.)</div>
                <div><span className="text-[#4DA3FF]">upProbability</span>: Current midpoint probability in % (nullable if unquoted)</div>
                <div><span className="text-[#4DA3FF]">currentTouchBid / currentTouchAsk</span>: Highest bid and lowest ask resting quotes</div>
                <div><span className="text-[#4DA3FF]">openInterestUsd</span>: Real locked collateral in the outcome pool contract</div>
                <div><span className="text-[#4DA3FF]">secondsRemaining</span>: Countdown to strike expiration timestamp</div>
              </div>
            </div>
          </div>
        )}

        {activeApiTab === "probability" && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#1E3A5F] text-[#60A5FA] font-mono text-[11px] font-semibold">
                GET
              </span>
              <code className="font-mono text-[13px] text-[#F5F5F5]">/api/probability</code>
              <span className="text-[#707070] text-[12px]">Quantitative microstructure &amp; Bayesian telemetry</span>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              Provides dedicated access to Stoikov orderbook microprice, 95% Bayesian credible intervals, Shannon entropy, and changepoint hazard detection.
            </p>
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#707070] uppercase">Status Semantics</span>
              <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] space-y-1">
                <p>• <span className="text-[#4ADE80]">status: &quot;live&quot;</span>: Orderbook quotes exist; probability, microprice, and entropy are empirically computed.</p>
                <p>• <span className="text-[#E7A94B]">status: &quot;unavailable&quot;</span>: No resting bids/asks on testnet for this asset; zero fabricated default numbers returned.</p>
              </div>
            </div>
          </div>
        )}

        {activeApiTab === "reputation" && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#1E3A5F] text-[#60A5FA] font-mono text-[11px] font-semibold">
                GET
              </span>
              <code className="font-mono text-[13px] text-[#F5F5F5]">/api/reputation</code>
              <span className="text-[#707070] text-[12px]">Verified predictor leaderboard &amp; calibration scores</span>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              Queries the Bayesian Brier skill scores and calibration metrics of all tracked wallets. Supports querying single address profiles via <code className="text-[#4DA3FF]">?address=0x...</code>.
            </p>
            <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] text-[#707070]">
              Note: When no resolved predictions exist on testnet, returns <code className="text-[#F5F5F5]">predictors: []</code> and <code className="text-[#F5F5F5]">status: &quot;Not enough predictor observations&quot;</code> rather than fabricated wallets.
            </div>
          </div>
        )}

        {activeApiTab === "divergence" && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#1E3A5F] text-[#60A5FA] font-mono text-[11px] font-semibold">
                GET
              </span>
              <code className="font-mono text-[13px] text-[#F5F5F5]">/api/divergence</code>
              <span className="text-[#707070] text-[12px]">Crowd vs Verified Predictor Divergence</span>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              Measures the directional delta between aggregate crowd probability and high-reputation predictor consensus.
            </p>
            <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] text-[#707070]">
              Requires both an observable crowd signal and active verified predictor positions in the evaluation window. Returns <code className="text-[#E7A94B]">status: &quot;unavailable&quot;</code> if either is unobservable.
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: API ERROR & DATA FRESHNESS SEMANTICS */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
            05 // ERROR &amp; FRESHNESS SPECIFICATION
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Error Semantics &amp; Data Freshness
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1">
            CrowdSignal strictly separates successful queries with unavailable underlying data from protocol errors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase font-semibold">
              HTTP Status Codes
            </h3>
            <div className="space-y-1.5 font-mono text-[#A1A1A1]">
              <p><span className="text-[#4ADE80]">200 OK + status: live</span> &mdash; Full valid data available.</p>
              <p><span className="text-[#E7A94B]">200 OK + status: unavailable</span> &mdash; Valid query, but market is currently unquoted on testnet.</p>
              <p><span className="text-[#F87171]">400 Bad Request</span> &mdash; Malformed parameter or unsupported asset symbol.</p>
              <p><span className="text-[#F87171]">404 Not Found</span> &mdash; Specified market ID or predictor address does not exist.</p>
              <p><span className="text-[#F87171]">500 Internal Error</span> &mdash; Unrecoverable database or indexing engine failure.</p>
            </div>
          </div>

          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase font-semibold">
              Data Freshness States
            </h3>
            <div className="space-y-1.5 font-mono text-[#A1A1A1]">
              <p><span className="text-[#4ADE80]">LIVE</span> &mdash; Timestamp within last 15 seconds; active websocket/polling.</p>
              <p><span className="text-[#E7A94B]">DELAYED</span> &mdash; Updated between 15s and 60s ago.</p>
              <p><span className="text-[#F87171]">STALE</span> &mdash; No updates received for &gt; 60s (e.g. paused upstream DEX).</p>
              <p><span className="text-[#707070]">UNAVAILABLE</span> &mdash; No resting orderbook depth or participants observed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: ON-CHAIN SOLIDITY INTEGRATION */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-[#707070] uppercase tracking-wider mb-1">
              06 // ON-CHAIN SMART CONTRACTS
            </div>
            <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
              Solidity Contract Integration
            </h2>
            <p className="text-[13px] text-[#A1A1A1] mt-1">
              Read CrowdSignal telemetry trustlessly on-chain via the <code className="text-[#4DA3FF]">ISentimentPublisher</code> interface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#0D0D0D] border border-[#202020] px-3 py-1.5 rounded-lg text-[11px]">
            <span className="text-[#707070]">Publisher:</span>
            <code className="text-[#4DA3FF] font-mono">{publisherAddress.slice(0, 10)}...{publisherAddress.slice(-6)}</code>
            <button
              type="button"
              onClick={() => handleCopyAddress(publisherAddress)}
              className="px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#252525] text-[#F5F5F5] transition-colors"
            >
              {copiedAddress ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#0D0D0D] p-1 rounded-lg border border-[#202020]">
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
                    ? "Solidity (ISentimentPublisher)"
                    : tab === "typescript"
                    ? "TypeScript (viem)"
                    : "Python (web3.py)"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="h-8 px-3 rounded bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#0D0D0D] text-[12px] font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[15px]">content_copy</span>
              <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-4 overflow-x-auto">
            <pre className="font-mono text-[12px] leading-relaxed text-[#F5F5F5] m-0 select-text">
              <code>
                {activeTab === "solidity" && SOLIDITY_CODE}
                {activeTab === "typescript" && TYPESCRIPT_CODE}
                {activeTab === "python" && PYTHON_CODE}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* SECTION 8: EXTERNAL CONSUMER DEMO (CLEARLY LABELED SIMULATION) */}
      <section className="bg-[#141414] border border-[#292929] rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#2A2010] text-[#E7A94B] font-mono text-[10px] font-semibold uppercase">
              Simulation / Example
            </span>
            <span className="text-[11px] font-mono text-[#707070]">
              Architectural Demonstration
            </span>
          </div>
          <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
            Autonomous Liquidity Rebalancer (Example Consumer)
          </h2>
          <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
            The following demonstrates how a downstream DeFi vault or liquidity manager can read <code className="text-[#4DA3FF]">SentimentPublisher.sol</code> on Somnia Shannon to automate risk-managed position rebalancing before high-impact market expirations.
          </p>
        </div>

        {/* Metric Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Simulated Input</span>
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
            <span className="text-[11px] text-[#707070] font-mono">Threshold Gate</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#F5F5F5] tabular-nums">
                60.0%
              </span>
              <span className="text-[11px] text-[#707070]">Trigger Threshold</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#707070]" style={{ width: "60%" }} />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Divergence Delta</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#E7A94B] tabular-nums">
                +4.2 pp
              </span>
              <span className="text-[11px] text-[#707070]">Conviction Over Consensus</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#E7A94B]" style={{ width: "42%" }} />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#202020] rounded p-4 flex flex-col justify-between gap-3">
            <span className="text-[11px] text-[#707070] font-mono">Target Network</span>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-semibold text-[#4DA3FF] tabular-nums">
                Somnia Shannon
              </span>
              <span className="text-[11px] text-[#707070]">Chain ID: 50312</span>
            </div>
            <div className="h-1 bg-[#202020] rounded-full overflow-hidden">
              <div className="h-full bg-[#4DA3FF]" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#141414] border border-[#202020] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4DA3FF] text-[18px]">account_tree</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#707070] block">
                Reference Implementation Contract
              </span>
              <span className="text-[13px] text-[#F5F5F5] font-medium font-mono">
                contracts/src/DemoConsumer.sol
              </span>
            </div>
          </div>

          <a
            href="https://shannon-explorer.somnia.network"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-3 rounded bg-[#141414] hover:bg-[#202020] border border-[#202020] text-[#A1A1A1] hover:text-[#F5F5F5] text-[11px] transition-colors flex items-center gap-1.5"
          >
            <span>Somnia Shannon Explorer</span>
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        </div>
      </section>
    </div>
  );
}

const SOLIDITY_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISentimentPublisher } from "./interfaces/ISentimentPublisher.sol";

/**
 * @title ExampleRiskConsumer
 * @notice Demonstrates consuming authoritative CrowdSignal probability feeds on Somnia Shannon.
 */
contract ExampleRiskConsumer {
    ISentimentPublisher public immutable publisher;

    constructor(address _publisher) {
        publisher = ISentimentPublisher(_publisher);
    }

    /**
     * @notice Checks market sentiment before executing high-capital vault operations.
     * @param symbol Symbol string, e.g. "BTC" or "ETH"
     */
    function evaluateMarketCondition(string calldata symbol) external view returns (
        uint16 upProbabilityBps,
        int16 capitalSkewBps,
        uint16 confidenceScore,
        bool isFresh
    ) {
        // Query authoritative market signal directly
        ISentimentPublisher.MarketSignal memory sig = publisher.getSignalBySymbol(symbol);

        // Verify data freshness (e.g. maximum 180 seconds old)
        bool fresh = (block.timestamp >= sig.timestamp) && (block.timestamp - sig.timestamp <= 180);

        return (
            sig.upProbabilityBps,     // 0 - 10000 bps (e.g. 5240 = 52.40%)
            sig.capitalSkewBps,        // -10000 to +10000 bps
            sig.confidenceScore,       // 0 - 100
            fresh
        );
    }
}`;

const TYPESCRIPT_CODE = `import { createPublicClient, http, parseAbi } from "viem";

export const somniaShannon = {
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.infra.testnet.somnia.network/"] },
  },
};

const client = createPublicClient({
  chain: somniaShannon,
  transport: http(),
});

const PUBLISHER_ADDRESS = "0xC526aB481079549320e8549e390C8B1D471804E1";

const ABI = parseAbi([
  "function getSignalBySymbol(string symbol) external view returns ((uint16 upProbabilityBps, int16 capitalSkewBps, uint16 confidenceScore, int16 velocityBpsPerMin, int16 accelerationBpsPerMin2, uint64 timestamp, uint64 openInterestUsd, uint64 totalVolumeUsd, uint32 activeWindowCount))",
  "function getProvenance(bytes32 assetKey) external view returns ((bytes32 algorithmVersionHash, bytes32 inputSnapshotHash, bytes32 signalHash, uint64 timestamp))"
]);

export async function fetchLiveMarketSignal(symbol: string) {
  const signal = await client.readContract({
    address: PUBLISHER_ADDRESS,
    abi: ABI,
    functionName: "getSignalBySymbol",
    args: [symbol],
  });

  console.log(\`Asset: \${symbol}\`);
  console.log(\`Up Probability: \${signal.upProbabilityBps / 100}%\`);
  console.log(\`Confidence: \${signal.confidenceScore} / 100\`);
  console.log(\`Timestamp: \${new Date(Number(signal.timestamp) * 1000).toISOString()}\`);
}`;

const PYTHON_CODE = `from web3 import Web3

# Connect to Somnia Shannon Testnet
RPC_URL = "https://api.infra.testnet.somnia.network/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

assert w3.is_connected(), "Failed to connect to Somnia Shannon Testnet"

PUBLISHER_ADDRESS = "0xC526aB481079549320e8549e390C8B1D471804E1"

# Or query the high-speed local REST API directly:
import urllib.request
import json

response = urllib.request.urlopen("http://localhost:3000/api/overview?asset=BTC")
data = json.loads(response.read().decode())

print(f"Status: {data['signal']['status']}")
if data['signal']['status'] == "live":
    sig = data['signal']['data']
    print(f"BTC Probability: {sig['upProbability']}% | Microprice: {sig['microProbability']}% | Confidence: {sig['confidence']}/100")
`;
