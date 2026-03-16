import { LeaderboardEntry } from "@/components/ui";
import { getHighlightedCodeHtml } from "@/components/ui/CodeBlock.server";

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface LeaderboardData {
  rank: number;
  score: number;
  code: string;
  language: string;
  lines: number;
}

const LEADERBOARD_DATA: LeaderboardData[] = [
  {
    rank: 1,
    score: 1.2,
    language: "javascript",
    lines: 3,
    code: `eval(prompt("enter code"));
document.write(response);
// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.0,
    language: "python",
    lines: 5,
    code: `def is_even(n):
    if n % 2 == 0:
        return True
    else:
        return False`,
  },
  {
    rank: 3,
    score: 2.1,
    language: "sql",
    lines: 2,
    code: `SELECT * FROM users WHERE 1=1;
-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    language: "typescript",
    lines: 4,
    code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }
// bulletproof logic`,
  },
  {
    rank: 5,
    score: 2.5,
    language: "java",
    lines: 5,
    code: `public void sortArray(int[] arr) {
    // TODO: implement sorting
    System.out.println("Array is now sorted!");
    return;
}`,
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
  const entries = await Promise.all(
    LEADERBOARD_DATA.map(async (entry) => ({
      ...entry,
      highlightedHtml: await getHighlightedCodeHtml(entry.code, entry.language),
    })),
  );

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-20 py-10">
        {/* Hero Section */}
        <div className="mb-10 flex flex-col gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <span className="text-accent-green font-jb text-[32px] font-bold">
              &gt;
            </span>
            <h1 className="text-text-primary font-jb text-[28px] font-bold">
              shame_leaderboard
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-text-secondary font-ibm text-sm">
            // the most roasted code on the internet
          </p>

          {/* Stats */}
          <div className="flex items-center gap-2 text-text-tertiary font-ibm text-xs">
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="flex flex-col gap-5">
          {entries.map((entry) => (
            <LeaderboardEntry
              key={entry.rank}
              rank={entry.rank}
              score={entry.score}
              code={entry.code}
              language={entry.language}
              lines={entry.lines}
              highlightedHtml={entry.highlightedHtml ?? undefined}
            />
          ))}
        </div>

        {/* Bottom Spacer */}
        <div className="h-20" />
      </div>
    </main>
  );
}
