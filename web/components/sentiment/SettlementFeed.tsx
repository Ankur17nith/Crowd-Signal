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

const DEFAULT_SETTLEMENTS: SettlementItem[] = [
  {
    id: "1",
    asset: "BTC",
    direction: "UP",
    outcome: "Correct",
    consensus: 74,
    settledAgo: "2m ago",
  },
  {
    id: "2",
    asset: "ETH",
    direction: "DOWN",
    outcome: "Correct",
    consensus: 68,
    settledAgo: "5m ago",
  },
  {
    id: "3",
    asset: "BTC",
    direction: "DOWN",
    outcome: "Incorrect",
    consensus: 51,
    settledAgo: "8m ago",
  },
  {
    id: "4",
    asset: "ETH",
    direction: "UP",
    outcome: "Correct",
    consensus: 82,
    settledAgo: "11m ago",
  },
];

interface SettlementFeedProps {
  settlements?: SettlementItem[];
}

export function SettlementFeed({ settlements = DEFAULT_SETTLEMENTS }: SettlementFeedProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] font-semibold text-[#F5F5F5]">Recent Settlements</h2>
        <p className="text-[13px] text-[#707070] mt-1">
          Audited resolutions from DreamDEX contracts.
        </p>
      </div>

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
    </section>
  );
}
