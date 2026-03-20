import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { LeaderboardEntry } from "@/components/ui";
import { getHighlightedCodeHtml } from "@/components/ui/CodeBlock.server";
import { getTRPCCaller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "leaderboard - devroast",
  description: "The most roasted code on the internet, ranked by shame",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const getLeaderboardList = unstable_cache(
  async () => {
    const caller = await getTRPCCaller();
    return caller.leaderboard.list();
  },
  ["leaderboard-list-v2"],
  { revalidate: 3600, tags: ["leaderboard"] },
);

export const revalidate = 3600;

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
  const { totalRoasts, avgScore, entries } = await getLeaderboardList();

  const entriesWithHighlight = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      highlightedHtml: await getHighlightedCodeHtml(entry.code, entry.language),
    })),
  );

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-4 md:px-20 py-6 md:py-10">
        {/* Hero Section */}
        <div className="mb-6 md:mb-10 flex flex-col gap-3 md:gap-4">
          {/* Title */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-accent-green font-jb text-xl md:text-[32px] font-bold">
              &gt;
            </span>
            <h1 className="text-text-primary font-jb text-lg md:text-[28px] font-bold">
              shame_leaderboard
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-text-secondary font-ibm text-xs md:text-sm">
            // the most roasted code on the internet
          </p>

          {/* Stats */}
          <div className="flex items-center gap-2 text-text-tertiary font-ibm text-xs">
            <span>{formatNumber(totalRoasts)} submissions</span>
            <span>·</span>
            <span>avg score: {avgScore.toFixed(1)}/10</span>
          </div>
        </div>

        {/* Leaderboard Entries */}
        {entriesWithHighlight.length > 0 ? (
          <div className="flex flex-col gap-4 md:gap-5">
            {entriesWithHighlight.map((entry) => (
              <LeaderboardEntry
                key={entry.roastId}
                roastId={entry.roastId}
                rank={entry.rank}
                score={entry.score}
                code={entry.code}
                language={entry.language}
                lines={entry.lines}
                highlightedHtml={entry.highlightedHtml ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-tertiary">
            <span className="font-jb text-sm">// no submissions yet</span>
            <span className="font-ibm text-xs">
              be the first to get roasted
            </span>
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-12 md:h-20" />
      </div>
    </main>
  );
}
