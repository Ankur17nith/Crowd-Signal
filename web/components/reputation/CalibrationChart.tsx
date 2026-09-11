import React from "react";

interface CalibrationBucket {
  label: string;
  actualWinRate: number;
  expectedConfidence: number;
  count: number;
}

interface CalibrationChartProps {
  buckets: CalibrationBucket[];
}

export function CalibrationChart({ buckets }: CalibrationChartProps) {
  if (buckets.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 font-mono text-xs border border-surface-border rounded bg-surface-subtle">
        Insufficient resolved predictions to compute statistical calibration curve.
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-surface-border rounded-lg shadow-terminal p-5">
      <div className="border-b border-surface-border pb-3 mb-4">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          CALIBRATION QUALITY
        </span>
        <h4 className="text-sm font-mono font-bold text-white mt-0.5">
          Confidence vs. Actual Realized Accuracy
        </h4>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Demonstrating whether stated trader confidence aligns with genuine probabilistic outcomes.
        </p>
      </div>

      {/* Calibration Comparison Bars */}
      <div className="space-y-4 font-mono text-xs">
        {buckets.map((b) => {
          const delta = b.actualWinRate - b.expectedConfidence;
          const isOverconfident = delta < -5;
          const isUnderconfident = delta > 5;

          return (
            <div key={b.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-white">Stated Confidence: ~{b.label}</span>
                <span className="text-slate-400 text-[11px]">
                  Realized Win Rate:{" "}
                  <strong className="text-brand font-bold">~{b.actualWinRate}%</strong> ({b.count} calls)
                </span>
              </div>

              {/* Relative Bar */}
              <div className="h-3 w-full bg-surface-elevated rounded overflow-hidden flex border border-surface-border">
                {/* Expected Line Marker */}
                <div
                  style={{ width: `${b.expectedConfidence}%` }}
                  className="h-full bg-slate-600/50 border-r-2 border-slate-300"
                  title={`Expected: ${b.expectedConfidence}%`}
                />
                {/* Actual Bar Fill */}
                <div
                  style={{ width: `${Math.max(0, b.actualWinRate - b.expectedConfidence)}%` }}
                  className={`h-full ${b.actualWinRate >= b.expectedConfidence ? "bg-emerald-500" : "bg-rose-500"}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Calibration Delta: {delta > 0 ? `+${delta}%` : `${delta}%`}</span>
                <span className={isOverconfident ? "text-rose-400" : isUnderconfident ? "text-amber-400" : "text-emerald-400 font-medium"}>
                  {isOverconfident ? "Overconfident" : isUnderconfident ? "Underconfident" : "Well-Calibrated ✓"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3 bg-surface-subtle border border-surface-border rounded text-[11px] font-sans text-slate-400 leading-relaxed">
        <span className="font-bold text-white font-mono">Why this matters:</span> A lucky gambler might win 100% of 2 calls, but a calibrated predictor knows their exact edge. A 90% confidence call winning ~87% indicates genuine edge and superior risk pricing.
      </div>
    </div>
  );
}
