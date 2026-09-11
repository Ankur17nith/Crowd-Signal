"use client";

import React from "react";

interface CrowdVsPredictorsProps {
  crowdUpProbability: number;
  crowdVolumeUsd: number;
  crowdWalletsCount: number;
  verifiedUpProbability: number;
  verifiedVolumeUsd: number;
  verifiedWalletsCount: number;
  divergencePp: number;
  divergenceDirection: "BEARISH_SKEW" | "BULLISH_SKEW" | "CONSENSUS_ALIGNED";
  commentary?: string;
}

export function CrowdVsPredictors({
  crowdUpProbability = 64.2,
  crowdVolumeUsd = 182450,
  crowdWalletsCount = 1420,
  verifiedUpProbability = 49.1,
  verifiedVolumeUsd = 84120,
  verifiedWalletsCount = 48,
  divergencePp = 15.1,
  divergenceDirection = "BEARISH_SKEW",
  commentary = "Smart money holds contrarian bias against general retail optimism.",
}: Partial<CrowdVsPredictorsProps>) {
  const isBearishSkew = divergenceDirection === "BEARISH_SKEW";
  const isBullishSkew = divergenceDirection === "BULLISH_SKEW";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] leading-tight font-semibold text-[#F5F5F5]">
          Crowd vs. Verified Predictors
        </h2>
        <p className="text-[13px] text-[#707070] mt-1">
          Where does the broader market disagree with historically calibrated smart money?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg p-6 gap-6 bg-[#141414] border border-[#292929]">
        {/* Col 1: Broad Market */}
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1A1]">
            Broad Market (Crowd)
          </div>
          <div>
            <div className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
              {crowdUpProbability.toFixed(1)}%{" "}
              <span className="text-[14px] text-[#4DA3FF] font-medium">UP</span>
            </div>
            <div className="text-[12px] text-[#707070] tabular-nums mt-1">
              ${crowdVolumeUsd.toLocaleString()} volume · {crowdWalletsCount.toLocaleString()} wallets
            </div>
          </div>
          <div className="w-full h-1 rounded-full bg-[#202020]">
            <div
              className="h-full rounded-full bg-[#4DA3FF]"
              style={{ width: `${crowdUpProbability}%` }}
            />
          </div>
        </div>

        {/* Col 2: Verified Predictors */}
        <div className="space-y-3 md:border-l md:pl-6 border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1A1]">
            Verified (Top 10% Calibrated)
          </div>
          <div>
            <div className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
              {verifiedUpProbability.toFixed(1)}%{" "}
              <span
                className={`text-[14px] font-medium ${
                  verifiedUpProbability >= 50 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
                }`}
              >
                {verifiedUpProbability >= 50 ? "UP" : "DOWN"}
              </span>
            </div>
            <div className="text-[12px] text-[#707070] tabular-nums mt-1">
              ${verifiedVolumeUsd.toLocaleString()} volume · {verifiedWalletsCount.toLocaleString()} wallets
            </div>
          </div>
          <div className="w-full h-1 rounded-full bg-[#202020]">
            <div
              className={`h-full rounded-full ${
                verifiedUpProbability >= 50 ? "bg-[#4DA3FF]" : "bg-[#E7A94B]"
              }`}
              style={{ width: `${verifiedUpProbability}%` }}
            />
          </div>
        </div>

        {/* Col 3: Divergence Index */}
        <div className="space-y-3 md:border-l md:pl-6 border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1A1]">
            Divergence Index
          </div>
          <div>
            <div
              className={`text-[28px] font-semibold tabular-nums ${
                isBearishSkew
                  ? "text-[#E7A94B]"
                  : isBullishSkew
                  ? "text-[#4DA3FF]"
                  : "text-[#F5F5F5]"
              }`}
            >
              {divergencePp.toFixed(1)} pp
            </div>
            <div
              className={`text-[12px] font-medium uppercase tracking-wide mt-0.5 ${
                isBearishSkew
                  ? "text-[#E7A94B]"
                  : isBullishSkew
                  ? "text-[#4DA3FF]"
                  : "text-[#707070]"
              }`}
            >
              {isBearishSkew
                ? "Bearish Skew Detected"
                : isBullishSkew
                ? "Bullish Skew Detected"
                : "Consensus Aligned"}
            </div>
          </div>
          <div className="p-2.5 rounded text-[12px] leading-relaxed text-[#A1A1A1] bg-[#0D0D0D] border border-[#202020]">
            {commentary}
          </div>
        </div>
      </div>
    </section>
  );
}
