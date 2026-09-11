import React from "react";

export function HowItWorks() {
  return (
    <div className="w-full my-12 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-mono text-brand uppercase tracking-widest font-semibold">
          SYSTEM ARCHITECTURE
        </span>
        <h3 className="text-2xl font-bold font-mono tracking-tight text-white">
          HOW CROWDSIGNAL WORKS
        </h3>
        <p className="text-xs text-slate-400 font-sans">
          Converting short-lived prediction market orders into persistent, verifiable public intelligence.
        </p>
      </div>

      {/* 3 Step Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {/* Step 1 */}
        <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-brand font-bold">STEP 01</span>
              <span className="text-[10px] text-slate-500 bg-surface-elevated px-2 py-0.5 rounded">
                DREAMDEX CLOB
              </span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">EVENT CONTRACTS</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Traders deposit real capital and commit orders on binary outcome order books (UP / DOWN), creating high-density directional price discovery.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-border text-[11px] text-slate-500">
            Output: Raw orders, fills & escrow
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 bg-surface border border-brand/30 rounded-lg shadow-terminal relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-brand font-bold">STEP 02</span>
              <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                CORE ORACLE
              </span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">CROWD SIGNAL</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              We ingest, normalize, and score market activity into implied probabilities, capital skew, velocity, confidence metrics, and verifiable Bayesian reputations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-border text-[11px] text-brand">
            Output: On-chain feeds & reputation registry
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 bg-surface border border-surface-border rounded-lg shadow-terminal relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-brand font-bold">STEP 03</span>
              <span className="text-[10px] text-slate-500 bg-surface-elevated px-2 py-0.5 rounded">
                CONSUMPTION
              </span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">THE ECOSYSTEM</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              DAOs, DeFi protocols, autonomous AI agents, on-chain games, and prediction apps consume the signal directly via smart contract feeds or JSON APIs.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-border text-[11px] text-slate-500">
            Output: Automated actions & risk hedges
          </div>
        </div>
      </div>

      {/* Public Infrastructure Banner */}
      <div className="p-6 sm:p-8 bg-surface border border-surface-border rounded-lg shadow-terminal mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              PUBLIC GOOD PRIMITIVE
            </span>
            <h4 className="text-lg font-mono font-bold text-white">
              FROM TRADING SIGNAL TO PUBLIC INFRASTRUCTURE
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              CrowdSignal turns Event Contract activity into reusable information rather than limiting its value to the traders participating in a single market.
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-center gap-2 font-mono text-xs text-center">
            <div className="p-2.5 bg-surface-elevated border border-surface-border rounded text-slate-300">
              DreamDEX
            </div>
            <span className="text-brand font-bold">→</span>
            <div className="p-2.5 bg-brand/10 border border-brand/40 text-brand rounded font-bold">
              CrowdSignal
            </div>
            <span className="text-brand font-bold">→</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <span className="px-2 py-1 bg-surface-subtle border border-surface-border rounded text-slate-300">
                DAOs
              </span>
              <span className="px-2 py-1 bg-surface-subtle border border-surface-border rounded text-slate-300">
                DeFi
              </span>
              <span className="px-2 py-1 bg-surface-subtle border border-surface-border rounded text-slate-300">
                Games
              </span>
              <span className="px-2 py-1 bg-surface-subtle border border-surface-border rounded text-slate-300">
                AI Agents
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
