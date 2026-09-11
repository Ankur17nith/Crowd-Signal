"use client";

import React from "react";

export default function DocsPage() {
  return (
    <div className="flex flex-col w-full gap-8 max-w-[1080px] mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-[#292929] pb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
          <span className="text-[11px] font-mono text-[#4DA3FF] uppercase tracking-wider">
            Quantitative Research Specification
          </span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[#F5F5F5]">
          CrowdSignal Methodology & Research Specification
        </h1>
        <p className="text-[13px] text-[#707070] max-w-3xl leading-relaxed">
          Mathematical formulations, Bayesian state-space filtering, information theory, change-point detection,
          market-relative scoring rules, and cryptographic provenance anchoring on Somnia Shannon.
        </p>
      </div>

      {/* 1. Core Positioning */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          1. The Foundational Thesis
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          CrowdSignal is not an autonomous trading bot or prediction-market clone. It is a real-time probabilistic intelligence layer for DreamDEX Event Contracts that filters noisy quotes into latent crowd belief, tracks information arrival, measures predictor skill relative to the market baseline, detects structural regime changes, and commits verifiable provenance anchors on-chain.
        </p>
        <div className="p-3.5 bg-[#0D0D0D] border border-[#202020] rounded text-[13px] text-[#F5F5F5] font-mono leading-relaxed">
          &quot;Do not add features because they sound advanced. Add research-backed mechanisms that create measurable, reproducible, technically defensible differentiation.&quot;
        </div>
      </article>

      {/* 2. Microstructure & Microprice */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          2. Market Microstructure & Order-Book Microprice (CS-MICRO-1.0)
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Midpoint prices are susceptible to bid-ask bounce and fail to reflect resting order depth imbalances. Following Stoikov (2018), CrowdSignal estimates an order-book-informed microprice:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Queue Imbalance (I_Q)</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`I_Q = (Depth_bid - Depth_ask) / (Depth_bid + Depth_ask)
I_Q ∈ [-1.0, +1.0]`}
            </pre>
            <p className="text-[11px] text-[#707070]">
              Quantifies buy vs sell pressure resting at the best touch quotes.
            </p>
          </div>
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Microprice Estimator</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`P_micro = P_mid + (I_Q * Spread) / 2
Adjustment = P_micro - P_mid`}
            </pre>
            <p className="text-[11px] text-[#707070]">
              Adjusts the midpoint towards the side of greater order absorption capacity.
            </p>
          </div>
        </div>
      </article>

      {/* 3. Latent Bayesian Probability Engine */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          3. Latent Probability Filtering & Credible Intervals (CS-PROB-2.0)
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Rather than treating observed touch quotes as ground truth, we model the order book as noisy observations of an unobserved latent event probability &theta;<sub>t</sub>. The filter operates in logit belief space to prevent boundary violations:
        </p>
        <pre className="p-3 bg-[#0D0D0D] border border-[#202020] rounded text-[12px] text-[#4DA3FF] font-mono overflow-x-auto">
{`State Space Update (Logit Domain):
x_t = ln(θ_t / (1 - θ_t))

Time Update:
x_{t|t-1} = x_{t-1|t-1}
P_{t|t-1} = P_{t-1|t-1} + Q * Δt

Observation Variance:
R_t = max(R_min, 2 * RelativeSpread / sqrt(MarketDepth))

Kalman Belief Gain:
K_t = P_{t|t-1} / (P_{t|t-1} + R_t)
x_{t|t} = x_{t|t-1} + K_t * (y_t - x_{t|t-1})
P_{t|t} = (1 - K_t) * P_{t|t-1}

Posterior 95% Credible Interval:
θ_{lower} = σ(x_{t|t} - 1.96 * sqrt(P_{t|t}))
θ_{upper} = σ(x_{t|t} + 1.96 * sqrt(P_{t|t}))`}
        </pre>
      </article>

      {/* 4. Information Theory & Shannon Entropy */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          4. Shannon Entropy & Information Velocity (CS-INFO-1.0)
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Probability shifts near 50% carry fundamentally different information content than shifts near 90%. CrowdSignal computes binary Shannon entropy and its time derivative to detect true uncertainty compression:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Binary Shannon Entropy</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`H(p) = -p * log2(p) - (1 - p) * log2(1 - p)
H(0.5) = 1.0 bit (Max Uncertainty)
H(0.9) = 0.469 bits (High Certainty)`}
            </pre>
          </div>
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Information Velocity (dH/dt)</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`dH/dt = [H(p_t) - H(p_{t-1})] / Δt (bits/min)
dH/dt < 0  -> Uncertainty resolving
dH/dt > 0  -> Information shock`}
            </pre>
          </div>
        </div>
      </article>

      {/* 5. Change-Point Detection & Regimes */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          5. Bayesian Online Changepoint Detection (BOCPD) & Market Regimes
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Based on Adams &amp; MacKay (2007), CrowdSignal tracks streaming run-length hazard probabilities to identify structural regime shifts from high-frequency market noise:
        </p>
        <div className="space-y-2 text-[12px] font-mono">
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex items-center justify-between">
            <span className="text-[#F5F5F5]">INFORMATION_SHOCK</span>
            <span className="text-[#707070]">ChangePointProbability &ge; 70% or |velocity| &gt; 1200 bps/min</span>
          </div>
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex items-center justify-between">
            <span className="text-[#F5F5F5]">LIQUIDITY_FRAGILE</span>
            <span className="text-[#707070]">Relative spread &gt; 6% with shallow resting order book depth</span>
          </div>
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex items-center justify-between">
            <span className="text-[#F5F5F5]">TRENDING</span>
            <span className="text-[#707070]">Directional momentum |velocity| &ge; 300 bps/min under stable run length</span>
          </div>
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex items-center justify-between">
            <span className="text-[#F5F5F5]">STABLE</span>
            <span className="text-[#707070]">Tight spreads, low velocity, established continuous regime run-length</span>
          </div>
        </div>
      </article>

      {/* 6. Participant Concentration & Effective Sample Size */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          6. Participant Concentration & Effective Sample Size
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          A market with 1,000 trades placed by two colluding wallets is not a crowd. CrowdSignal computes the Herfindahl-Hirschman Index (HHI) to measure the true effective sample size without manipulating underlying prices:
        </p>
        <pre className="p-3 bg-[#0D0D0D] border border-[#202020] rounded text-[12px] text-[#4DA3FF] font-mono overflow-x-auto">
{`Herfindahl-Hirschman Index:
HHI = Σ (s_i)²  where s_i is wallet i's share of committed exposure

Effective Participant Count:
N_eff = 1 / HHI

Signal Independence Score:
Independence = min(1.0, N_eff / N_observed) * (1 - Top1Share)`}
        </pre>
      </article>

      {/* 7. Reputation Engine V2 & Market-Relative Skill */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          7. Market-Relative Skill & Brier Decomposition (CS-REPUTATION-2.0)
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Evaluating predictors by raw win-rate incentivizes cherry-picking heavy favorites. CrowdSignal benchmarks every resolved prediction against the prevailing market probability observed at the exact second the prediction was entered:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Brier Skill Score vs Market</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`BS_pred = (Confidence_i - Outcome_i)²
BS_market = (P_market_i - Outcome_i)²

BSS_market = 1 - (BS_pred / BS_market)`}
            </pre>
            <p className="text-[11px] text-[#707070]">
              Positive score proves true informational contribution over the crowd consensus.
            </p>
          </div>
          <div className="p-4 bg-[#0D0D0D] border border-[#202020] rounded space-y-2">
            <h3 className="text-[12px] font-mono text-[#4DA3FF] uppercase">Murphy 3-Part Decomposition</h3>
            <pre className="p-2.5 bg-[#141414] border border-[#202020] rounded text-[12px] text-[#F5F5F5] font-mono">
{`Brier = Reliability - Resolution + Uncertainty
Reliability: Calibration error (0 is ideal)
Resolution: Sorting capacity (higher is better)`}
            </pre>
          </div>
        </div>
      </article>

      {/* 8. On-Chain Provenance & Verification */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          8. Cryptographic Signal Provenance & Verification Anchor
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Every signal published by CrowdSignal includes cryptographic provenance hashes stored in <code>SentimentPublisher.sol</code>:
        </p>
        <pre className="p-3 bg-[#0D0D0D] border border-[#202020] rounded text-[12px] text-[#4DA3FF] font-mono overflow-x-auto">
{`struct ProvenanceRecord {
    bytes32 algorithmVersionHash; // e.g. keccak256("CS-PROB-2.0")
    bytes32 inputSnapshotHash;    // keccak256 of order-book input quotes
    bytes32 signalHash;           // keccak256 of published signal output
    uint64 timestamp;             // on-chain block timestamp
}`}
        </pre>
        <p className="text-[12px] text-[#707070]">
          Given identical input quotes and algorithm version, any third party can independently recompute and verify the signal hash.
        </p>
      </article>

      {/* 9. End-to-End Data Pipeline Flow */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          9. Ingestion Pipeline &amp; SQLite WAL Persistence Model
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          The CrowdSignal indexing daemon runs single-flight batch cycles (~3.4 seconds) with zero overlapping requests. The pipeline executes:
        </p>
        <div className="p-3.5 bg-[#0D0D0D] border border-[#202020] rounded font-mono text-[12px] text-[#4DA3FF] space-y-1">
          <p>1. Discover all active DreamDEX Event Contracts on Somnia Shannon via @somnia-chain/markets-sdk.</p>
          <p>2. Query top-of-book resting liquidity in parallel for all discovered contracts.</p>
          <p>3. Compute Stoikov microprice, queue imbalance, logit Kalman state updates, and Shannon entropy.</p>
          <p>4. Persist only populated market snapshots (zero empty snapshot inflation) and update materialized latest_market_state.</p>
          <p>5. Serve REST queries from Next.js with O(1) query complexity (&lt;20ms warm latency).</p>
        </div>
      </article>

      {/* 10. Smart Contract Specification */}
      <article className="bg-[#141414] border border-[#292929] rounded-lg p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#F5F5F5] border-b border-[#202020] pb-3">
          10. Somnia Smart Contract Verification Reference
        </h2>
        <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
          Deployed smart contracts on Somnia Shannon Testnet (Chain ID 50312):
        </p>
        <div className="space-y-2 text-[12px] font-mono">
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[#F5F5F5]">SentimentPublisher.sol</span>
            <code className="text-[#4DA3FF]">0xC526aB481079549320e8549e390C8B1D471804E1</code>
          </div>
          <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[#F5F5F5]">ReputationRegistry.sol</span>
            <code className="text-[#4DA3FF]">0x71AeD4810965319804e84381C489110B529048E2</code>
          </div>
        </div>
      </article>
    </div>
  );
}
