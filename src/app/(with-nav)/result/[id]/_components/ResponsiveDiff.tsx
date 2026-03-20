"use client";

import { RoastSuggestionsDiff } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ResponsiveDiffProps {
  originalCode: string;
  improvedCode: string;
  language: string;
}

export function ResponsiveDiff({
  originalCode,
  improvedCode,
  language,
}: ResponsiveDiffProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <RoastSuggestionsDiff
      originalCode={originalCode}
      improvedCode={improvedCode}
      language={language}
      diffStyle={isDesktop ? "split" : "unified"}
    />
  );
}
