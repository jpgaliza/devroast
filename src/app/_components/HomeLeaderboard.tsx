import Link from "next/link";
import { Button } from "@/components/ui";
import { getHighlightedCodeHtml } from "@/components/ui/CodeBlock.server";
import {
  LeaderboardRoot,
  LeaderboardHeader,
  LeaderboardTitle,
  LeaderboardSubtitle,
  LeaderboardTable,
  LeaderboardTableHead,
  LeaderboardTableRow,
  LeaderboardTableCell,
  LeaderboardFooter,
  LeaderboardScore,
} from "@/components/ui/LeaderboardPreview";
import { getTRPCCaller } from "@/trpc/server";

function formatTotal(total: number): string {
  return new Intl.NumberFormat("en-US").format(total);
}

function getPreviewSnippet(code: string, maxLines = 3): string {
  return code.split("\n").slice(0, maxLines).join("\n");
}

export async function HomeLeaderboard() {
  const caller = await getTRPCCaller();
  const { entries, totalRoasts } = await caller.leaderboard.preview();

  const entriesWithHighlight = await Promise.all(
    entries.map(async (entry) => {
      const snippet = getPreviewSnippet(entry.code);
      const highlightedHtml = await getHighlightedCodeHtml(
        snippet,
        entry.language,
      );
      return { ...entry, snippet, highlightedHtml };
    }),
  );

  return (
    <LeaderboardRoot>
      <LeaderboardHeader>
        <div className="flex flex-col gap-8">
          <LeaderboardTitle>shame_leaderboard</LeaderboardTitle>
          <LeaderboardSubtitle>
            {"// the worst code on the internet, ranked by shame"}
          </LeaderboardSubtitle>
        </div>
        <Link href="/leaderboard">
          <Button
            variant="default"
            className="cursor-pointer bg-transparent border border-border-primary text-text-tertiary hover:bg-bg-elevated font-jb text-[13px] font-medium px-4 py-2 rounded-none"
          >
            $ view_all &gt;&gt;
          </Button>
        </Link>
      </LeaderboardHeader>

      <LeaderboardTable>
        <LeaderboardTableHead>
          <LeaderboardTableCell className="w-10 text-text-tertiary">
            #
          </LeaderboardTableCell>
          <LeaderboardTableCell className="w-15 text-text-tertiary">
            score
          </LeaderboardTableCell>
          <LeaderboardTableCell className="flex-1 text-text-tertiary">
            code
          </LeaderboardTableCell>
          <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
            lang
          </LeaderboardTableCell>
        </LeaderboardTableHead>

        {entriesWithHighlight.length > 0 ? (
          entriesWithHighlight.map((entry) => (
            <LeaderboardTableRow key={entry.rank}>
              <LeaderboardTableCell className="w-10 text-text-tertiary">
                {entry.rank}
              </LeaderboardTableCell>
              <LeaderboardTableCell className="w-15">
                <LeaderboardScore value={entry.score} />
              </LeaderboardTableCell>
              <LeaderboardTableCell className="flex-1 min-w-0">
                {entry.highlightedHtml ? (
                  <div
                    className="code-highlighted code-highlighted-compact font-jb text-xs"
                    dangerouslySetInnerHTML={{ __html: entry.highlightedHtml }}
                  />
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {entry.snippet.split("\n").map((line, i) => (
                      <code
                        key={i}
                        className="font-jb text-xs text-text-primary"
                      >
                        {line}
                      </code>
                    ))}
                  </div>
                )}
              </LeaderboardTableCell>
              <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
                {entry.language}
              </LeaderboardTableCell>
            </LeaderboardTableRow>
          ))
        ) : (
          <LeaderboardTableRow>
            <LeaderboardTableCell className="flex-1 text-text-tertiary py-8 text-center">
              {"// no roasts yet — be the first"}
            </LeaderboardTableCell>
          </LeaderboardTableRow>
        )}
      </LeaderboardTable>

      <LeaderboardFooter>
        {entriesWithHighlight.length > 0 ? (
          <>
            showing top {entriesWithHighlight.length} of{" "}
            {formatTotal(totalRoasts)} ·{" "}
            <Link
              href="/leaderboard"
              className="text-text-tertiary hover:text-primary transition-colors"
            >
              view full leaderboard &gt;&gt;
            </Link>
          </>
        ) : (
          <>
            0 submissions ·{" "}
            <Link
              href="/leaderboard"
              className="text-text-tertiary hover:text-primary transition-colors"
            >
              view full leaderboard &gt;&gt;
            </Link>
          </>
        )}
      </LeaderboardFooter>
    </LeaderboardRoot>
  );
}
