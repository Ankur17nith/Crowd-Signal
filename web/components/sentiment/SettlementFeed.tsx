"use client";

import React from "react";

export interface SettlementItem {
  id: string;
  asset: string;
  direction: "UP" | "DOWN";
  outcome: "Correct" | "Incorrect";
  consensus: number;
  settledAgo: string;
}

interface SettlementFeedProps {
  settlements?: SettlementItem[];
}

export function SettlementFeed({ settlements = [] }: SettlementFeedProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] font-semibold text-[#F5F5F5]">Recent Settlements</h2>
        <p className="text-[13px] text-[#707070] mt-1">
          Audited resolutions from DreamDEX contracts on Somnia Shannon.
        </p>
      </div>

      {settlements.length === 0 ? (
        <div className="p-6 rounded-lg text-[13px] bg-[#141414] border border-[#292929] text-[#707070] font-mono text-center">
          No audited resolutions recorded on Somnia testnet yet.
        </div>
      ) : (
        <div className="space-y-2">
          {settlements.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded text-[13px] gap-2 bg-[#141414] border border-[#292929]"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#F5F5F5]">{item.asset}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                    item.direction === "UP"
                      ? "text-[#4DA3FF] bg-[#4DA3FF]/10"
                      : "text-[#E7A94B] bg-[#E7A94B]/10"
                  }`}
                >
                  {item.direction}
                </span>
                <span className="text-[#707070]">Outcome:</span>
                <span
                  className={`font-medium ${
                    item.outcome === "Correct" ? "text-[#F5F5F5]" : "text-[#A1A1A1]"
                  }`}
                >
                  {item.outcome}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[#707070] text-[12px]">
                <span>
                  Consensus:{" "}
                  <span className="text-[#F5F5F5] font-mono tabular-nums">
                    {item.consensus}%
                  </span>
                </span>
                <span className="font-mono tabular-nums">Settled {item.settledAgo}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
