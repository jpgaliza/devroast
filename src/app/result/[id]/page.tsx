import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "@/components/ui/Card";
import { getHighlightedCodeHtml } from "@/components/ui/CodeBlock.server";
import { ResultCodePanel } from "@/components/ui/ResultCodePanel";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { getTRPCCaller } from "@/trpc/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-jb text-sm font-bold text-accent-green">
        {"//"}
      </span>
      <h2 className="font-jb text-sm font-bold text-text-primary">
        {children}
      </h2>
    </div>
  );
}

function getVerdictBadgeVariant(verdict: string): BadgeVariant {
  if (verdict === "garbage_fire" || verdict === "needs_serious_help") {
    return "critical";
  }
  if (verdict === "questionable") {
    return "warning";
  }
  return "good";
}

function getFeedbackCards(
  feedback: Array<{ content: string; isPositive: boolean }>,
  score: number,
): Array<{
  key: string;
  variant: BadgeVariant;
  label: string;
  title: string;
  description: string;
}> {
  let hasCritical = false;

  return feedback.map((item, index) => {
    let variant: BadgeVariant;

    if (item.isPositive) {
      variant = "good";
    } else if (score < 5 && !hasCritical) {
      variant = "critical";
      hasCritical = true;
    } else {
      variant = "warning";
    }

    return {
      key: `${index}-${item.content}`,
      variant,
      label: variant,
      title: item.content,
      description: item.isPositive
        ? "Strength found in this submission."
        : "Issue that should be improved.",
    };
  });
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

  const caller = await getTRPCCaller();
  const roast = await caller.roast.getById({ id }).catch(() => null);

  if (!roast) {
    notFound();
  }

  const highlightedCode = await getHighlightedCodeHtml(
    roast.code,
    roast.language,
  );
  const verdictVariant = getVerdictBadgeVariant(roast.verdict);
  const analysisItems = getFeedbackCards(roast.feedback, roast.score);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-10 px-5 py-10 md:px-10 md:py-10 lg:px-20">
        <section className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="shrink-0">
            <ScoreRing size={180} stroke={4} value={roast.score} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={verdictVariant}>verdict: {roast.verdict}</Badge>
            </div>

            <p className="max-w-190 font-jb text-xl leading-relaxed text-text-primary md:text-[28px] md:leading-[1.45]">
              {roast.headline}
            </p>

            <p className="font-jb text-xs text-text-tertiary">
              lang: {roast.language} {" · "} {roast.linesCount} lines
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
                disabled
              >
                share_roast
              </Button>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-4">
          <SectionLabel>your_submission</SectionLabel>
          <ResultCodePanel
            className="h-106"
            code={roast.code}
            highlightedHtml={highlightedCode}
          />
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionLabel>detailed_analysis</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {analysisItems.map((item) => (
              <CardRoot
                key={item.key}
                className="gap-3 bg-transparent p-4 md:p-5"
              >
                <CardHeader>
                  <Badge variant={item.variant}>{item.label}</Badge>
                </CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardRoot>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
