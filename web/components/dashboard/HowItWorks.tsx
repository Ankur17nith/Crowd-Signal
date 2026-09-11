"use client";

import React from "react";

export function HowItWorks() {
  return (
    <section className="pt-6 border-t border-[#202020]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 01 */}
        <div className="space-y-2">
          <div className="font-mono text-[12px] text-[#707070]">01</div>
          <div className="text-[14px] font-semibold text-[#F5F5F5]">
            Event Liquidity Pooling
          </div>
          <p className="text-[13px] leading-relaxed text-[#707070]">
            Capital aggregates directly within binary event smart contracts on Somnia without synthetic orderbook routing.
          </p>
        </div>

        {/* Step 02 */}
        <div className="space-y-2">
          <div className="font-mono text-[12px] text-[#707070]">02</div>
          <div className="text-[14px] font-semibold text-[#F5F5F5]">
            Calibrated Wallet Weighting
          </div>
          <p className="text-[13px] leading-relaxed text-[#707070]">
            Historical Brier scores filter raw volume into high-conviction predictor signals versus noise.
          </p>
        </div>

        {/* Step 03 */}
        <div className="space-y-2">
          <div className="font-mono text-[12px] text-[#707070]">03</div>
          <div className="text-[14px] font-semibold text-[#F5F5F5]">
            Deterministic Settlement
          </div>
          <p className="text-[13px] leading-relaxed text-[#707070]">
            Decentralized Pyth oracles resolve expiration strikes trustlessly at the block boundary.
          </p>
        </div>
      </div>
    </section>
  );
}
