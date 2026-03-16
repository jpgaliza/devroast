"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

// ─── Variants ────────────────────────────────────────────────────────────────

const leaderboardEntryVariants = cva("w-full border border-border-primary", {
  variants: {},
  defaultVariants: {},
});

const scoreVariants = cva("font-jb text-[13px] font-bold", {
  variants: {
    severity: {
      critical: "text-accent-red",
      warning: "text-accent-amber",
      normal: "text-text-secondary",
    },
  },
  defaultVariants: {
    severity: "normal",
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LeaderboardEntryProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof leaderboardEntryVariants> {
  /** Rank position in the leaderboard */
  rank: number;
  /** Score value (lower is worse) */
  score: number;
  /** Code snippet to display */
  code: string;
  /** Programming language */
  language: string;
  /** Number of lines in the code */
  lines: number;
  /** Highlighted HTML from Shiki (optional) */
  highlightedHtml?: string;
}

// ─── Components ──────────────────────────────────────────────────────────────

export const LeaderboardEntry = React.forwardRef<
  HTMLDivElement,
  LeaderboardEntryProps
>(({ className, rank, score, code, language, lines, highlightedHtml, ...props }, ref) => {
  const getScoreSeverity = (score: number): "critical" | "warning" | "normal" => {
    if (score < 2.0) return "critical";
    if (score < 3.5) return "warning";
    return "normal";
  };

  const codeLines = code.split("\n");
  const lineCount = codeLines.length;

  return (
    <div
      ref={ref}
      className={twMerge(leaderboardEntryVariants({ className }))}
      {...props}
    >
      {/* Meta Row */}
      <div className="flex h-12 w-full items-center justify-between border-b border-border-primary px-5">
        {/* Left: Rank + Score */}
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex items-center gap-1.5">
            <span className="font-jb text-[13px] text-text-tertiary">#</span>
            <span className="font-jb text-[13px] font-bold text-accent-amber">
              {rank}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5">
            <span className="font-jb text-xs text-text-tertiary">score:</span>
            <span className={scoreVariants({ severity: getScoreSeverity(score) })}>
              {score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right: Language + Lines */}
        <div className="flex items-center gap-3">
          <span className="font-jb text-xs text-text-secondary">{language}</span>
          <span className="font-jb text-xs text-text-tertiary">{lines} lines</span>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative h-30 w-full overflow-hidden" style={{ background: "var(--color-input)" }}>
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 flex h-full w-10 flex-col items-end gap-1.5 border-r border-border-primary bg-bg-surface py-3.5 pr-2.5">
          {Array.from({ length: Math.min(lineCount, 5) }, (_, i) => (
            <span
              key={i}
              className="font-jb text-xs leading-5 text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code Content */}
        <div className="h-full w-full overflow-auto pl-10">
          {highlightedHtml ? (
            <div
              className="code-highlighted h-full"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="h-full py-3.5 px-4 font-jb text-xs leading-5 text-text-primary whitespace-pre">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
});

LeaderboardEntry.displayName = "LeaderboardEntry";
