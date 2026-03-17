"use client";

import { type FileContents, MultiFileDiff } from "@pierre/diffs/react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface RoastSuggestionsDiffProps extends React.HTMLAttributes<HTMLDivElement> {
  originalCode: string;
  improvedCode: string;
  language: string;
}

const LANGUAGE_EXTENSION: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  tsx: "tsx",
  python: "py",
  go: "go",
  rust: "rs",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  php: "php",
  ruby: "rb",
  sql: "sql",
  bash: "sh",
  json: "json",
  yaml: "yaml",
  html: "html",
  css: "css",
  markdown: "md",
  plaintext: "txt",
};

const DIFF_OPTIONS = {
  theme: { dark: "pierre-dark", light: "pierre-dark" },
  diffStyle: "split",
  disableFileHeader: true,
} as const;

function getFileExtension(language: string) {
  return LANGUAGE_EXTENSION[language] ?? "txt";
}

export const RoastSuggestionsDiff = React.forwardRef<
  HTMLDivElement,
  RoastSuggestionsDiffProps
>(({ className, originalCode, improvedCode, language, ...props }, ref) => {
  const filename = React.useMemo(
    () => `submission.${getFileExtension(language)}`,
    [language],
  );

  const oldFile = React.useMemo<FileContents>(
    () => ({ name: filename, contents: originalCode }),
    [filename, originalCode],
  );

  const newFile = React.useMemo<FileContents>(
    () => ({ name: filename, contents: improvedCode }),
    [filename, improvedCode],
  );

  return (
    <div
      ref={ref}
      className={twMerge(
        "overflow-hidden border border-border-primary bg-bg-surface",
        className,
      )}
      {...props}
    >
      <MultiFileDiff
        oldFile={oldFile}
        newFile={newFile}
        options={DIFF_OPTIONS}
      />
    </div>
  );
});

RoastSuggestionsDiff.displayName = "RoastSuggestionsDiff";
