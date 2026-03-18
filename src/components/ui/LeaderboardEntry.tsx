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
  extends
    React.ComponentPropsWithoutRef<"div">,
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
>(
  (
    {
      className,
      rank,
      score,
      code,
      language,
      lines,
      highlightedHtml,
      ...props
    },
    ref,
  ) => {
    const getScoreSeverity = (
      score: number,
    ): "critical" | "warning" | "normal" => {
      if (score < 2.0) return "critical";
      if (score < 3.5) return "warning";
      return "normal";
    };

    // Calculate actual line count from code to match Shiki rendering
    const actualLineCount = code ? code.split(/\r\n|\r|\n/).length : 0;

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
              <span
                className={scoreVariants({ severity: getScoreSeverity(score) })}
              >
                {score.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Right: Language + Lines */}
          <div className="flex items-center gap-3">
            <span className="font-jb text-xs text-text-secondary">
              {language}
            </span>
            <span className="font-jb text-xs text-text-tertiary">
              {lines} lines
            </span>
          </div>
        </div>

        {/* Code Block */}
        <div
          className="h-30 w-full overflow-auto"
          style={{ background: "var(--color-input)" }}
        >
          <div className="grid min-h-full" style={{ gridTemplateColumns: "40px 1fr" }}>
            {/* Line Numbers */}
            <div className="flex flex-col items-end border-r border-border-primary bg-bg-surface py-3.5 pr-2.5">
              {Array.from({ length: actualLineCount }, (_, i) => (
                <span
                  key={i}
                  className="font-jb text-xs leading-5 text-text-tertiary"
                >
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Code Content */}
            <div className="min-w-0">
              {highlightedHtml ? (
                <div
                  className="code-highlighted code-highlighted-leaderboard"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              ) : (
                <pre className="py-3.5 px-4 font-jb text-xs leading-5 text-text-primary whitespace-pre">
                  <code>{code}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

LeaderboardEntry.displayName = "LeaderboardEntry";
