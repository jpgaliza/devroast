import { cache } from "react";
import * as React from "react";
import { createCssVariablesTheme } from "@shikijs/core";
import {
  getSingletonHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
} from "shiki";

type ShikiHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const DEFAULT_LANGUAGE: BundledLanguage = "tsx";
const INITIAL_LANGUAGES: BundledLanguage[] = [
  DEFAULT_LANGUAGE,
  "javascript",
  "typescript",
  "python",
  "sql",
  "java",
];
const cssVarsTheme = createCssVariablesTheme({ variablePrefix: "--shiki-" });

const getCodeHighlighter = cache(async () => {
  return getSingletonHighlighter({
    themes: [cssVarsTheme],
    langs: INITIAL_LANGUAGES,
  } as Parameters<
    typeof getSingletonHighlighter
  >[0]) as Promise<ShikiHighlighter>;
});

export const getHighlightedCodeHtml = cache(
  async (code: string, language: string = DEFAULT_LANGUAGE) => {
    try {
      const highlighter = await getCodeHighlighter();
      const loadedLanguages = highlighter.getLoadedLanguages();

      if (!loadedLanguages.includes(language as BundledLanguage)) {
        await highlighter.loadLanguage(language as BundledLanguage);
      }

      return highlighter.codeToHtml(code, {
        lang: language as BundledLanguage,
        theme: cssVarsTheme,
      });
    } catch {
      return null;
    }
  },
);

export async function CodeBlockServer({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const html = await getHighlightedCodeHtml(code, language ?? DEFAULT_LANGUAGE);

  if (html) {
    return (
      <div
        className="code-highlighted"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre
      style={{
        padding: 12,
        background: "#111",
        color: "#fff",
        overflowX: "auto",
      }}
    >
      <code>{code}</code>
    </pre>
  );
}
