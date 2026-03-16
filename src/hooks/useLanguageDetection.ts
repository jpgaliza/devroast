"use client";

import * as React from "react";

// highlight.js language name → Shiki language ID (only mismatches listed)
const HLJS_TO_SHIKI: Record<string, string> = {
  xml: "html",
  sh: "bash",
  shell: "bash",
  js: "javascript",
  ts: "typescript",
  cs: "csharp",
  "c++": "cpp",
  plain: "plaintext",
};

// Constrain auto-detection to code languages only.
// Excluding xml/html prevents TypeScript generics (<T>) and JSX from being
// misidentified as markup — markup languages are added by the user manually.
const DETECTION_SUBSET = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "cpp",
  "cs",
  "php",
  "ruby",
  "sql",
  "bash",
  "json",
  "yaml",
  "css",
  "markdown",
];

function mapToShikiId(hljsLang: string): string {
  const lower = hljsLang.toLowerCase();
  return HLJS_TO_SHIKI[lower] ?? lower;
}

// Languages where hljs tends to give inflated scores on generic code.
// When one of these "wins" but a more specific language is close behind,
// prefer the runner-up.
const OVERMATCH_LANGUAGES = new Set(["bash", "shell", "sh", "markdown"]);

// Minimum relevance score to accept a detection result.
// Anything below this is too low-confidence.
const MIN_RELEVANCE = 3;

export function useLanguageDetection(code: string) {
  const [detectedLanguage, setDetectedLanguage] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (!code.trim()) {
      setDetectedLanguage(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const hljs = (await import("highlight.js/lib/common")).default;
        const result = hljs.highlightAuto(code, DETECTION_SUBSET);

        if (!result.language || (result.relevance ?? 0) < MIN_RELEVANCE) {
          setDetectedLanguage(undefined);
          return;
        }

        let lang = result.language;

        // If an overmatch language won but a more specific language is a
        // close runner-up (within 3 points), prefer the runner-up.
        if (
          OVERMATCH_LANGUAGES.has(lang) &&
          result.secondBest?.language &&
          !OVERMATCH_LANGUAGES.has(result.secondBest.language) &&
          (result.relevance ?? 0) - (result.secondBest.relevance ?? 0) < 3
        ) {
          lang = result.secondBest.language;
        }

        setDetectedLanguage(mapToShikiId(lang));
      } catch {
        // hljs unavailable — no detection
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code]);

  return { detectedLanguage, setDetectedLanguage };
}
