"use client";

import * as React from "react";
import Link from "next/link";
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
  /** Roast id used to navigate to the result page */
  roastId?: string;
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
      roastId,
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
        <div className="flex h-10 md:h-12 w-full items-center justify-between border-b border-border-primary px-3 md:px-5">
          {/* Left: Rank + Score */}
          {roastId ? (
            <Link
              href={`/result/${roastId}`}
              aria-label={`Open roast #${rank} with score ${score.toFixed(1)}`}
              className="flex items-center gap-2 md:gap-4 cursor-pointer rounded-sm transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {/* Rank */}
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="font-jb text-xs md:text-[13px] text-text-tertiary">
                  #
                </span>
                <span className="font-jb text-xs md:text-[13px] font-bold text-accent-amber">
                  {rank}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="font-jb text-[10px] md:text-xs text-text-tertiary">
                  score:
                </span>
                <span
                  className={scoreVariants({
                    severity: getScoreSeverity(score),
                  })}
                >
                  {score.toFixed(1)}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Rank */}
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="font-jb text-xs md:text-[13px] text-text-tertiary">
                  #
                </span>
                <span className="font-jb text-xs md:text-[13px] font-bold text-accent-amber">
                  {rank}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="font-jb text-[10px] md:text-xs text-text-tertiary">
                  score:
                </span>
                <span
                  className={scoreVariants({
                    severity: getScoreSeverity(score),
                  })}
                >
                  {score.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Right: Language + Lines */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="font-jb text-[10px] md:text-xs text-text-secondary">
              {language}
            </span>
            <span className="font-jb text-[10px] md:text-xs text-text-tertiary">
              {lines} lines
            </span>
          </div>
        </div>

        {/* Code Block */}
        <div
          className="h-24 md:h-30 w-full overflow-auto"
          style={{ background: "var(--color-input)" }}
        >
          <div className="grid min-h-full leaderboard-code-grid">
            {/* Line Numbers */}
            <div className="flex flex-col items-end border-r border-border-primary bg-bg-surface py-2.5 md:py-3.5 pr-1.5 md:pr-2.5">
              {Array.from({ length: actualLineCount }, (_, i) => (
                <span
                  key={i}
                  className="font-jb text-[10px] md:text-xs leading-5 text-text-tertiary"
                >
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Code Content */}
            <div className="min-w-0">
              {highlightedHtml ? (
                <div
                  className="code-highlighted code-highlighted-leaderboard py-2.5 md:py-3.5 px-3 md:px-4"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              ) : (
                <pre className="py-2.5 md:py-3.5 px-3 md:px-4 font-jb text-[10px] md:text-xs leading-5 text-text-primary whitespace-pre">
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
