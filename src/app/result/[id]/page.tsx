import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import {
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "@/components/ui/Card";
import { getHighlightedCodeHtml } from "@/components/ui/CodeBlock.server";
import { DiffLine, type DiffLineType } from "@/components/ui/DiffLine";
import { ScoreRing } from "@/components/ui/ScoreRing";

const MOCK_ROAST_ID = "550e8400-e29b-41d4-a716-446655440000";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RESULT_DATA = {
  score: 3.5,
  verdict: "needs_serious_help",
  headline:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  lineSummary: "7 lines",
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
};

const ANALYSIS_ITEMS = [
  {
    variant: "critical" as const,
    label: "critical",
    title: "using var instead of const/let",
    description:
      "var is function-scoped and leads to hoisting issues. use const by default, let when reassignment is needed.",
  },
  {
    variant: "warning" as const,
    label: "warning",
    title: "imperative loop pattern",
    description:
      "for loops are verbose and error-prone vs. reduce() or map() for cleaner, functional transformations.",
  },
  {
    variant: "good" as const,
    label: "good",
    title: "clear naming conventions",
    description:
      "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
  },
  {
    variant: "good" as const,
    label: "good",
    title: "single responsibility",
    description:
      "the function does one thing well — calculates a total, no side effects, no mixed concerns, no hidden complexity.",
  },
];

const DIFF_LINES: Array<{ type: DiffLineType; code: string }> = [
  { type: "context", code: "function calculateTotal(items) {" },
  { type: "removed", code: "  var total = 0;" },
  { type: "removed", code: "  for (var i = 0; i < items.length; i++) {" },
  { type: "removed", code: "    total = total + items[i].price;" },
  { type: "removed", code: "  }" },
  { type: "removed", code: "" },
  {
    type: "added",
    code: "  return items.reduce((sum, item) => sum + item.price, 0);",
  },
  { type: "context", code: "}" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-jb text-sm font-bold text-accent-green">//</span>
      <h2 className="font-jb text-sm font-bold text-text-primary">{children}</h2>
    </div>
  );
}

function CodePanel({
  highlightedHtml,
  code,
  className,
}: {
  highlightedHtml?: string | null;
  code: string;
  className?: string;
}) {
  const lines = code.split("\n");

  return (
    <div
      className={[
        "overflow-hidden border border-border-primary bg-input",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-full min-h-0">
        <div className="flex w-10 shrink-0 flex-col items-end overflow-hidden border-r border-border-primary bg-bg-surface px-2.5 py-4">
          {lines.map((_, index) => (
            <span
              key={`${index + 1}`}
              className="h-5 font-jb text-xs leading-5 text-text-tertiary"
            >
              {index + 1}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-auto">
          {highlightedHtml ? (
            <div
              className="code-highlighted"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="m-0 whitespace-pre p-4 font-jb text-xs leading-5 text-text-primary">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [{ id: MOCK_ROAST_ID }];
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const highlightedCode = await getHighlightedCodeHtml(
    RESULT_DATA.code,
    RESULT_DATA.language,
  );

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-10 px-5 py-10 md:px-10 md:py-10 lg:px-20">
        <section className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="shrink-0">
            <ScoreRing size={180} stroke={4} value={RESULT_DATA.score} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="critical">verdict: {RESULT_DATA.verdict}</Badge>
            </div>

            <p className="max-w-190 font-jb text-xl leading-relaxed text-text-primary md:text-[28px] md:leading-[1.45]">
              {RESULT_DATA.headline}
            </p>

            <p className="font-jb text-xs text-text-tertiary">
              lang: {RESULT_DATA.language} {" · "} {RESULT_DATA.lineSummary}
            </p>

            <div>
              <Button
                variant="ghost"
                size="sm"
                icon={
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M8 1H11V4" stroke="currentColor" strokeWidth="1" />
                    <path d="M11 1L6 6" stroke="currentColor" strokeWidth="1" />
                    <path
                      d="M10 7V10.5C10 10.7761 9.77614 11 9.5 11H1.5C1.22386 11 1 10.7761 1 10.5V2.5C1 2.22386 1.22386 2 1.5 2H5"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                }
                className="rounded-none px-3 py-2 text-xs"
              >
                share_roast
              </Button>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-4">
          <SectionLabel>your_submission</SectionLabel>
          <CodePanel
            className="h-106"
            code={RESULT_DATA.code}
            highlightedHtml={highlightedCode}
          />
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionLabel>detailed_analysis</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ANALYSIS_ITEMS.map((item) => (
              <CardRoot key={item.title} className="gap-3 bg-transparent p-4 md:p-5">
                <CardHeader>
                  <Badge variant={item.variant}>{item.label}</Badge>
                </CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardRoot>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionLabel>suggested_fix</SectionLabel>

          <div className="overflow-hidden border border-border-primary bg-input">
            <div className="border-b border-border-primary px-4 py-3 font-jb text-xs text-text-tertiary">
              your_code.ts {" -> "} improved_code.ts
            </div>
            <div className="divide-y divide-border-primary/30">
              {DIFF_LINES.map((line, index) => (
                <DiffLine
                  key={`${line.type}-${index}`}
                  type={line.type}
                  code={line.code}
                  className="py-2.25"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}