"use client";

import * as React from "react";

export interface ResultCodePanelProps {
  highlightedHtml?: string | null;
  code: string;
  className?: string;
}

function getLineCount(code: string) {
  if (!code) return 1;
  return code.split(/\r\n|\r|\n/).length;
}

export function ResultCodePanel({
  highlightedHtml,
  code,
  className,
}: ResultCodePanelProps) {
  const lineCount = React.useMemo(() => getLineCount(code), [code]);
  const codeScrollRef = React.useRef<HTMLDivElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const syncLineNumbers = React.useCallback(() => {
    if (!codeScrollRef.current || !lineNumbersRef.current) return;
    lineNumbersRef.current.scrollTop = codeScrollRef.current.scrollTop;
  }, []);

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
        <div
          ref={lineNumbersRef}
          className="hide-scrollbar flex w-10 shrink-0 flex-col items-end overflow-y-hidden border-r border-border-primary bg-bg-surface px-2.5 py-4"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <span
              key={`${index + 1}`}
              className="h-5 font-jb text-xs leading-5 text-text-tertiary"
            >
              {index + 1}
            </span>
          ))}
        </div>

        <div
          ref={codeScrollRef}
          onScroll={syncLineNumbers}
          className="min-w-0 flex-1 overflow-auto"
        >
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
