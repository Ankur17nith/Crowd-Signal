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
  crowdUpProbability = 50,
  crowdVolumeUsd = 0,
  crowdWalletsCount = 0,
  verifiedUpProbability = 50,
  verifiedVolumeUsd = 0,
  verifiedWalletsCount = 0,
  divergencePp = 0,
  divergenceDirection = "CONSENSUS_ALIGNED",
  commentary = "Aligning signals across market observations.",
}: Partial<CrowdVsPredictorsProps>) {
  const hasVerifiedData = (verifiedWalletsCount || 0) > 0 && typeof verifiedUpProbability === "number";

  const safeCrowdUp = typeof crowdUpProbability === "number" && !isNaN(crowdUpProbability) ? crowdUpProbability : null;
  const safeCrowdVol = typeof crowdVolumeUsd === "number" && !isNaN(crowdVolumeUsd) ? crowdVolumeUsd : 0;
  const safeCrowdWallets = typeof crowdWalletsCount === "number" && !isNaN(crowdWalletsCount) ? crowdWalletsCount : 0;
  const safeVerifiedUp = hasVerifiedData ? verifiedUpProbability : null;
  const safeVerifiedVol = typeof verifiedVolumeUsd === "number" && !isNaN(verifiedVolumeUsd) ? verifiedVolumeUsd : 0;
  const safeVerifiedWallets = typeof verifiedWalletsCount === "number" && !isNaN(verifiedWalletsCount) ? verifiedWalletsCount : 0;
  const safeDivergencePp = hasVerifiedData && typeof divergencePp === "number" && !isNaN(divergencePp) ? divergencePp : null;

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
            {safeCrowdUp !== null ? (
              <>
                <div className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
                  {safeCrowdUp.toFixed(1)}%{" "}
                  <span className="text-[14px] text-[#4DA3FF] font-medium">UP</span>
                </div>
                <div className="text-[12px] text-[#707070] tabular-nums mt-1">
                  ${safeCrowdVol.toLocaleString()} volume · {safeCrowdWallets.toLocaleString()} wallets
                </div>
              </>
            ) : (
              <>
                <div className="text-[22px] font-medium text-[#707070]">
                  Unavailable
                </div>
                <div className="text-[12px] text-[#555555] mt-1">
                  Awaiting verified market trades
                </div>
              </>
            )}
          </div>
          <div className="w-full h-1 rounded-full bg-[#202020]">
            {safeCrowdUp !== null && (
              <div
                className="h-full rounded-full bg-[#4DA3FF]"
                style={{ width: `${safeCrowdUp}%` }}
              />
            )}
          </div>
        </div>

        {/* Col 2: Verified Predictors */}
        <div className="space-y-3 md:border-l md:pl-6 border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1A1]">
            Verified (Top 10% Calibrated)
          </div>
          <div>
            {hasVerifiedData && safeVerifiedUp !== null ? (
              <>
                <div className="text-[28px] font-semibold text-[#F5F5F5] tabular-nums">
                  {safeVerifiedUp.toFixed(1)}%{" "}
                  <span
                    className={`text-[14px] font-medium ${
                      safeVerifiedUp >= 50 ? "text-[#4DA3FF]" : "text-[#E7A94B]"
                    }`}
                  >
                    {safeVerifiedUp >= 50 ? "UP" : "DOWN"}
                  </span>
                </div>
                <div className="text-[12px] text-[#707070] tabular-nums mt-1">
                  ${safeVerifiedVol.toLocaleString()} volume · {safeVerifiedWallets.toLocaleString()} wallets
                </div>
              </>
            ) : (
              <>
                <div className="text-[22px] font-medium text-[#707070]">
                  Unavailable
                </div>
                <div className="text-[12px] text-[#555555] mt-1">
                  Insufficient verified prediction history
                </div>
              </>
            )}
          </div>
          <div className="w-full h-1 rounded-full bg-[#202020]">
            {hasVerifiedData && safeVerifiedUp !== null && (
              <div
                className={`h-full rounded-full ${
                  safeVerifiedUp >= 50 ? "bg-[#4DA3FF]" : "bg-[#E7A94B]"
                }`}
                style={{ width: `${safeVerifiedUp}%` }}
              />
            )}
          </div>
        </div>

        {/* Col 3: Divergence Index */}
        <div className="space-y-3 md:border-l md:pl-6 border-[#202020]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#A1A1A1]">
            Divergence Index
          </div>
          <div>
            {safeDivergencePp !== null ? (
              <>
                <div
                  className={`text-[28px] font-semibold tabular-nums ${
                    isBearishSkew
                      ? "text-[#E7A94B]"
                      : isBullishSkew
                      ? "text-[#4DA3FF]"
                      : "text-[#F5F5F5]"
                  }`}
                >
                  {safeDivergencePp.toFixed(1)} pp
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
              </>
            ) : (
              <>
                <div className="text-[22px] font-medium text-[#707070]">
                  —
                </div>
                <div className="text-[12px] text-[#555555] mt-0.5">
                  Awaiting Verified Predictors
                </div>
              </>
            )}
          </div>
          <div className="p-2.5 rounded text-[12px] leading-relaxed text-[#A1A1A1] bg-[#0D0D0D] border border-[#202020]">
            {hasVerifiedData
              ? commentary
              : "Divergence requires active verified predictors with calibrated Brier track records on Somnia testnet."}
          </div>
        </div>
      </div>
    </section>
  );
}
