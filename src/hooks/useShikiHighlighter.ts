"use client";

import * as React from "react";
import { getSingletonHighlighter } from "shiki";
import { createCssVariablesTheme } from "@shikijs/core";
import type { BundledLanguage, HighlighterGeneric, BundledTheme } from "shiki";

export type ShikiHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const cssVarsTheme = createCssVariablesTheme({ variablePrefix: "--shiki-" });

const INITIAL_LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "tsx",
  "python",
  "go",
  "rust",
];

export function useShikiHighlighter() {
  const [highlighter, setHighlighter] = React.useState<ShikiHighlighter | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getSingletonHighlighter({
      themes: [cssVarsTheme],
      langs: INITIAL_LANGS,
    } as Parameters<typeof getSingletonHighlighter>[0]).then((h) => {
      if (!cancelled) setHighlighter(h as ShikiHighlighter);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLanguage = React.useCallback(
    async (lang: string) => {
      if (!highlighter) return;
      try {
        const loaded = highlighter.getLoadedLanguages();
        if (!loaded.includes(lang as BundledLanguage)) {
          await highlighter.loadLanguage(lang as BundledLanguage);
        }
      } catch {
        // Language not in bundle — silently ignore, caller handles fallback
      }
    },
    [highlighter],
  );

  return { highlighter, loadLanguage };
}
