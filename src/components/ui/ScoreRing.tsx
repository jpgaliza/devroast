import * as React from "react";

export interface ScoreRingProps {
  value: number; // current score
  max?: number; // maximum possible score (default 10)
  size?: number; // svg canvas size in px
  stroke?: number; // ring thickness
  valueColor?: string;
  denominatorColor?: string;
}

// Circular score ring with a gradient from green to orange, centered number plus denominator
export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  max = 10,
  size = 160,
  stroke = 6,
  valueColor = "#F59E0B",
  denominatorColor = "#737373",
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value / max));
  const dash = circumference * clamped;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score Ring ${value} of ${max}`}
    >
      <defs>
        <linearGradient id="score-gr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Base circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2A2A2A"
        strokeWidth={stroke}
        fill="none"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#score-gr)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Center values — score inline with /max at bottom-right */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
      >
        <tspan fill={valueColor} fontSize={size * 0.28} fontWeight={700}>
          {Number.isInteger(value) ? value : value.toFixed(1)}
        </tspan>
        <tspan fill={denominatorColor} fontSize={size * 0.14} dy={size * 0.075}>
          /{max}
        </tspan>
      </text>
    </svg>
  );
};

// Do not export as default; use named export ScoreRing only
