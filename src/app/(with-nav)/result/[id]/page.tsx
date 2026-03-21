import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareRoastButton } from "@/components/ui";
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
import { generateImprovedCode } from "@/lib/ai";
import { getAbsoluteUrl } from "@/lib/siteUrl";
import {
  formatVerdictLabel,
  getRoastCanonicalPath,
  getRoastOgImagePath,
  getRoastSharePath,
  getRoastResultById,
} from "./resultData";
import { ResponsiveDiff } from "./_components/ResponsiveDiff";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

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

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const roast = await getRoastResultById(id);

  if (!roast) {
    notFound();
  }

  const sharePath = getRoastSharePath(id);

  const [highlightedCode, improvementPlan] = await Promise.all([
    getHighlightedCodeHtml(roast.code, roast.language),
    generateImprovedCode(roast.code, roast.language, roast.feedback).catch(
      () => null,
    ),
  ]);
  const verdictVariant = getVerdictBadgeVariant(roast.verdict);
  const analysisItems = getFeedbackCards(roast.feedback, roast.score);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-10 px-5 py-10 md:px-10 md:py-10 lg:px-20">
        <section className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
          <div className="shrink-0">
            <ScoreRing size={180} stroke={4} value={roast.score} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-2">
              <Badge variant={verdictVariant}>verdict: {roast.verdict}</Badge>
            </div>

            <p className="max-w-190 text-center font-jb text-xl leading-relaxed text-text-primary md:text-left md:text-[28px] md:leading-[1.45]">
              {roast.headline}
            </p>

            <p className="font-jb text-xs text-text-tertiary">
              lang: {roast.language} {" · "} {roast.linesCount} lines
            </p>

            <div>
              <ShareRoastButton
                variant="ghost"
                size="sm"
                relativeUrl={sharePath}
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
              </ShareRoastButton>
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

        {improvementPlan ? (
          <>
            <div className="h-px w-full bg-border-primary" />

            <section className="flex flex-col gap-6">
              <SectionLabel>suggested_improvements</SectionLabel>

              <p className="max-w-220 font-ibm text-sm leading-relaxed text-text-secondary">
                {improvementPlan.summary}
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {improvementPlan.suggestions.map((suggestion, index) => (
                  <CardRoot
                    key={`${index}-${suggestion}`}
                    className="gap-2 bg-transparent p-4"
                  >
                    <CardTitle className="text-accent-green">
                      fix_{String(index + 1).padStart(2, "0")}
                    </CardTitle>
                    <CardDescription>{suggestion}</CardDescription>
                  </CardRoot>
                ))}
              </div>

              <ResponsiveDiff
                originalCode={roast.code}
                improvedCode={improvementPlan.improvedCode}
                language={roast.language}
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { id } = await params;
  const roast = await getRoastResultById(id);

  if (!roast) {
    return {
      title: "Roast not found | devroast",
      description: "This roast does not exist or is no longer available.",
    };
  }

  const canonicalPath = getRoastCanonicalPath(id);
  const imagePath = getRoastOgImagePath(id);
  const verdict = formatVerdictLabel(roast.verdict);
  const title = `${roast.score.toFixed(1)}/10 roast - ${verdict} | devroast`;
  const description = roast.headline;
  const imageUrl = getAbsoluteUrl(imagePath);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: "devroast",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `devroast score ${roast.score.toFixed(1)} out of 10`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
