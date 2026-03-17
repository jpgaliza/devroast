import { ImageResponse } from "@takumi-rs/image-response";
import { formatVerdictLabel, getRoastResultById } from "./resultData";

export const runtime = "nodejs";
export const alt = "devroast roast share card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function getScoreColor(score: number) {
  if (score <= 2) {
    return "#ff5d52";
  }

  if (score <= 4) {
    return "#f5a623";
  }

  if (score <= 6) {
    return "#f0d264";
  }

  return "#29d17d";
}

function getVerdictColor(verdict: string) {
  if (verdict === "garbage_fire" || verdict === "needs_serious_help") {
    return "#ff5d52";
  }

  if (verdict === "questionable") {
    return "#f5a623";
  }

  return "#29d17d";
}

function clampHeadline(headline: string) {
  if (headline.length <= 72) {
    return headline;
  }

  return `${headline.slice(0, 69).trimEnd()}...`;
}

function RoastOgCard({
  score,
  verdict,
  headline,
  language,
  linesCount,
}: {
  score: number;
  verdict: string;
  headline: string;
  language: string;
  linesCount: number;
}) {
  const scoreColor = getScoreColor(score);
  const verdictColor = getVerdictColor(verdict);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#070707",
        color: "#f5f7fb",
        fontFamily: "Geist Mono",
        padding: 48,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 50% 22%, rgba(245,166,35,0.08), transparent 30%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "auto, 72px 72px, 72px 72px",
          opacity: 0.55,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#29d17d",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          <span>&gt;</span>
          <span style={{ color: "#f5f7fb" }}>devroast</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 18,
            lineHeight: 0.9,
          }}
        >
          <span
            style={{
              fontSize: 168,
              fontWeight: 800,
              color: scoreColor,
              letterSpacing: "-0.08em",
            }}
          >
            {score.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: 62,
              fontWeight: 700,
              color: "#536075",
              transform: "translateY(-16px)",
            }}
          >
            /10
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 28,
            color: verdictColor,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: verdictColor,
            }}
          />
          <span>{verdict}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 20,
            color: "#7a8598",
          }}
        >
          <span>lang: {language}</span>
          <span>·</span>
          <span>{linesCount} lines</span>
        </div>

        <p
          style={{
            maxWidth: 920,
            margin: "14px 0 0",
            textAlign: "center",
            fontSize: 34,
            lineHeight: 1.45,
            color: "#f5f7fb",
            textWrap: "balance",
          }}
        >
          “{clampHeadline(headline)}”
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            padding: "12px 18px",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.03)",
            fontSize: 18,
            color: "#9ca7b8",
          }}
        >
          <span style={{ color: verdictColor }}>//</span>
          <span>{formatVerdictLabel(verdict)}</span>
        </div>
      </div>
    </div>
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getRoastResultById(id);

  if (!roast) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    <RoastOgCard
      score={roast.score}
      verdict={roast.verdict}
      headline={roast.headline}
      language={roast.language}
      linesCount={roast.linesCount}
    />,
    {
      width: size.width,
      height: size.height,
      format: "png",
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
