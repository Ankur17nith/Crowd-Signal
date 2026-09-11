"use client";

import React, { useState } from "react";

interface DataPoint {
  time: string;
  probability: number;
  openInterest: number;
  volume: number;
  skew: number;
}

// 30-minute historical sample series
const SAMPLE_DATA: DataPoint[] = [
  { time: "10:00", probability: 42.0, openInterest: 110000, volume: 40000, skew: 10.0 },
  { time: "10:05", probability: 46.5, openInterest: 122000, volume: 48000, skew: 14.2 },
  { time: "10:10", probability: 48.0, openInterest: 135000, volume: 55000, skew: 16.5 },
  { time: "10:15", probability: 54.2, openInterest: 151000, volume: 68000, skew: 22.0 },
  { time: "10:20", probability: 59.8, openInterest: 168000, volume: 79000, skew: 25.6 },
  { time: "10:25", probability: 64.2, openInterest: 182430, volume: 91220, skew: 28.4 },
];

export function ProbabilityChart() {
  const [metric, setMetric] = useState<"probability" | "openInterest" | "volume" | "skew">("probability");

  const metricLabels = {
    probability: { title: "UP Probability", unit: "%", color: "#10B981" },
    openInterest: { title: "Open Interest", unit: "$", color: "#00E5FF" },
    volume: { title: "Cumulative Volume", unit: "$", color: "#818CF8" },
    skew: { title: "Capital Skew", unit: "%", color: "#F59E0B" },
  };

  const current = metricLabels[metric];

  // Calculate SVG path points
  const width = 600;
  const height = 220;
  const padding = 35;

  const values = SAMPLE_DATA.map((d) => d[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = SAMPLE_DATA.map((d, i) => {
    const x = padding + (i / (SAMPLE_DATA.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d[metric] - minVal) / range) * (height - 2 * padding);
    return { x, y, val: d[metric], time: d.time };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full bg-surface border border-surface-border rounded-lg shadow-terminal p-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4 mb-4">
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            HISTORICAL WINDOW ANALYTICS
          </span>
          <h4 className="text-sm font-mono font-bold text-white mt-0.5 flex items-center gap-2">
            <span>{current.title} Over Time</span>
            <span className="text-xs text-brand font-medium">
              {metric === "probability" || metric === "skew"
                ? `${SAMPLE_DATA[SAMPLE_DATA.length - 1][metric].toFixed(1)}${current.unit}`
                : `$${SAMPLE_DATA[SAMPLE_DATA.length - 1][metric].toLocaleString()}`}
            </span>
          </h4>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center gap-1 bg-surface-subtle p-1 border border-surface-border rounded font-mono text-xs">
          {(["probability", "openInterest", "volume", "skew"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded transition-colors uppercase text-[11px] ${
                metric === m
                  ? "bg-surface-elevated text-brand font-bold border border-surface-border"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "openInterest" ? "Open Interest" : m}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={current.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={current.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1E2330" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E2330" strokeDasharray="3 3" />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#232838"
            strokeWidth="1"
          />

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={current.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill={current.color} stroke="#08090D" strokeWidth="2" />
              <text
                x={p.x}
                y={height - 12}
                fontSize="10"
                fill="#64748B"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {p.time}
              </text>
            </g>
          ))}

          {/* Value Labels on Y-axis */}
          <text x={padding - 6} y={padding + 4} fontSize="10" fill="#64748B" textAnchor="end" fontFamily="monospace">
            {metric === "openInterest" || metric === "volume"
              ? `$${(maxVal / 1000).toFixed(0)}k`
              : `${maxVal.toFixed(0)}%`}
          </text>
          <text
            x={padding - 6}
            y={height - padding + 3}
            fontSize="10"
            fill="#64748B"
            textAnchor="end"
            fontFamily="monospace"
          >
            {metric === "openInterest" || metric === "volume"
              ? `$${(minVal / 1000).toFixed(0)}k`
              : `${minVal.toFixed(0)}%`}
          </text>
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-surface-border">
        <span>Window: 15-Minute Event Contract</span>
        <span>Resolution Oracle: Somnia Reactive Hub</span>
      </div>
    </div>
  );
}
