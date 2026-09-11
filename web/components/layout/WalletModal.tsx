"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PREDICTORS } from "@/lib/data";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
  address,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<"reputation" | "activity" | "network">("reputation");

  if (!isOpen) return null;

  // Check if connected address has reputation in registry
  const myReputation = address
    ? INITIAL_PREDICTORS.find((p) => p.address.toLowerCase() === address.toLowerCase())
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-lg shadow-terminal overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            <h3 className="font-semibold text-sm tracking-wide text-white">WALLET ACCOUNT</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-1 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {!address ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-brand text-xl">
              ⟠
            </div>
            <div>
              <h4 className="text-white font-medium">Connect to Somnia Shannon</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Connect your Web3 wallet to access your verifiable prediction reputation and submit orders.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onConnect();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-brand text-black font-semibold text-xs rounded uppercase tracking-wider hover:bg-brand-subtle transition-colors"
              >
                Injected EVM Wallet (MetaMask / OKX)
              </button>
              <button
                onClick={() => {
                  // Connect as demo predictor 0x71A...92F
                  onConnect();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-surface-subtle border border-surface-border text-slate-300 font-medium text-xs rounded hover:bg-surface-elevated transition-colors"
              >
                Simulate Verified Predictor (0x71A...92F)
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Address Banner */}
            <div className="px-5 py-3 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Connected Wallet</span>
                <p className="font-mono text-xs text-white mt-0.5 font-medium">{address}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                CONNECTED
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-surface-border bg-surface-subtle text-xs font-mono">
              <button
                onClick={() => setActiveTab("reputation")}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                  activeTab === "reputation"
                    ? "border-brand text-brand font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                My Reputation
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                  activeTab === "activity"
                    ? "border-brand text-brand font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                My Activity
              </button>
              <button
                onClick={() => setActiveTab("network")}
                className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                  activeTab === "network"
                    ? "border-brand text-brand font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Network
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5">
              {activeTab === "reputation" && (
                <div>
                  {myReputation ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
                          <span className="text-[10px] uppercase text-slate-400 font-mono">Predictor Score</span>
                          <div className="text-xl font-bold font-mono text-brand mt-1">
                            {myReputation.predictorScore}
                            <span className="text-xs font-normal text-slate-500"> / 100</span>
                          </div>
                        </div>
                        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
                          <span className="text-[10px] uppercase text-slate-400 font-mono">Current Rank</span>
                          <div className="text-xl font-bold font-mono text-white mt-1">
                            #{myReputation.rank}
                            <span className="text-xs font-normal text-emerald-400 ml-1">Verified</span>
                          </div>
                        </div>
                        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
                          <span className="text-[10px] uppercase text-slate-400 font-mono">Directional Accuracy</span>
                          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                            {myReputation.accuracy}%
                          </div>
                        </div>
                        <div className="p-3 bg-surface-subtle border border-surface-border rounded">
                          <span className="text-[10px] uppercase text-slate-400 font-mono">Calibration</span>
                          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                            {myReputation.calibrationScore}
                            <span className="text-xs font-normal text-slate-500"> / 100</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/trader/${address}`}
                        onClick={onClose}
                        className="block text-center py-2 px-3 bg-surface-elevated hover:bg-surface-border text-brand text-xs font-mono rounded border border-brand/20 transition-colors"
                      >
                        View Full Verifiable Profile →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 space-y-2">
                      <p className="text-xs font-mono text-slate-300">Not enough data yet.</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Make more resolved Event Contract predictions to establish a statistically meaningful reputation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-xs font-mono text-slate-300">Recent Event Contract Orders</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No active working orders on Somnia Markets order book.
                  </p>
                </div>
              )}

              {activeTab === "network" && (
                <div className="space-y-3">
                  <div className="p-3 bg-surface-subtle border border-surface-border rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network:</span>
                      <span className="text-white font-mono">Somnia Shannon Testnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chain ID:</span>
                      <span className="text-white font-mono">50312</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RPC:</span>
                      <span className="text-white font-mono text-[10px]">api.infra.testnet.somnia.network</span>
                    </div>
                  </div>
                  <button
                    onClick={onSwitchNetwork}
                    className="w-full py-2 bg-surface-subtle border border-surface-border hover:bg-surface-elevated text-xs font-mono text-slate-200 rounded transition-colors"
                  >
                    Verify & Switch Network
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-subtle flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Somnia Shannon</span>
              <button
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
