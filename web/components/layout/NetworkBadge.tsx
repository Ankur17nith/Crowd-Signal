"use client";

import React from "react";

interface NetworkBadgeProps {
  isDemoMode?: boolean;
  onToggleDemo?: () => void;
}

export function NetworkBadge({ isDemoMode, onToggleDemo }: NetworkBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      {/* Somnia Network Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-surface-border rounded text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseDot"></span>
        <span className="text-slate-400 font-sans">Network:</span>
        <span className="text-brand font-medium">Somnia Shannon (50312)</span>
      </div>

      {/* Explicit Demo Mode Switch */}
      {onToggleDemo && (
        <button
          onClick={onToggleDemo}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            isDemoMode
              ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "bg-surface-subtle border-surface-border text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle deterministic demonstration cycle"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDemoMode ? "bg-amber-400 animate-pulse" : "bg-slate-500"
            }`}
          ></span>
          <span>{isDemoMode ? "DEMO MODE ACTIVE" : "SIMULATE DEMO"}</span>
        </button>
      )}
    </div>
  );
}
