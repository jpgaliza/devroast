"use client";

import { type FileContents, MultiFileDiff } from "@pierre/diffs/react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface RoastSuggestionsDiffProps extends React.HTMLAttributes<HTMLDivElement> {
  originalCode: string;
  improvedCode: string;
  language: string;
  /** Diff layout style: "split" for side-by-side, "unified" for stacked */
  diffStyle?: "split" | "unified";
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

function getFileExtension(language: string) {
  return LANGUAGE_EXTENSION[language] ?? "txt";
}

export const RoastSuggestionsDiff = React.forwardRef<
  HTMLDivElement,
  RoastSuggestionsDiffProps
>(({ className, originalCode, improvedCode, language, diffStyle = "split", ...props }, ref) => {
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

  const diffOptions = React.useMemo(
    () => ({
      theme: { dark: "pierre-dark", light: "pierre-dark" },
      diffStyle,
      disableFileHeader: true,
    }),
    [diffStyle],
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
        options={diffOptions}
      />
    </div>
  );
});

RoastSuggestionsDiff.displayName = "RoastSuggestionsDiff";
