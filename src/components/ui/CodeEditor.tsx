import "highlight.js/styles/github-dark.css";
import hljs from "highlight.js";
import * as React from "react";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import { LanguageSelector } from "./LanguageSelector";

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const PLACEHOLDER_LINES = `// paste your code here...
// we'll roast it for you`;

export const CodeEditor = React.forwardRef<
  HTMLTextAreaElement,
  CodeEditorProps
>(({ value = "", onChange, placeholder, className }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLPreElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const { detectedLanguage, setDetectedLanguage } = useLanguageDetection(value);

  const highlightedHtml = React.useMemo(() => {
    const trimmedValue = value.trimEnd();
    if (!trimmedValue) return "";
    try {
      return hljs.highlight(trimmedValue, {
        language: detectedLanguage || "plaintext",
        ignoreIllegals: true,
      }).value;
    } catch (error) {
      console.error(error);
      return value; // fallback to plain text
    }
  }, [value, detectedLanguage]);

  const lineCount = React.useMemo(() => {
    if (!value) {
      // Calculate how many lines fit in the editor height
      // Editor height: 480px - 40px (header) = 440px
      // Padding: 16px top + 16px bottom = 32px
      // Available: 440px - 32px = 408px
      // Line height: 20px
      // Lines: 408px / 20px = 20.4 ≈ 20 lines
      return 20;
    }
    const lines = value.split("\n");
    // Don't count empty trailing lines
    const actualLines = value.endsWith("\n") ? lines.length - 1 : lines.length;
    return Math.max(actualLines, 20);
  }, [value]);

  // Sync scroll between textarea and pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  React.useImperativeHandle(ref, () => textareaRef.current!);

  return (
    <div
      className={[
        "w-full max-w-[780px] h-[480px] bg-input border border-border-primary rounded-sm overflow-hidden flex flex-col relative",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Window Header */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-border-primary shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-red" />
          <span className="w-3 h-3 rounded-full bg-accent-amber" />
          <span className="w-3 h-3 rounded-full bg-accent-green" />
        </div>
        <LanguageSelector
          language={detectedLanguage ?? null}
          onLanguageChange={(lang) => setDetectedLanguage(lang ?? undefined)}
        />
      </div>

      {/* Code Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-bg-surface border-r border-border-primary shrink-0 overflow-y-auto overflow-x-hidden hide-scrollbar"
          style={{
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "12px",
            paddingRight: "12px"
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-text-tertiary text-right"
              style={{
                fontFamily: "var(--font-jb)",
                fontSize: "12px",
                lineHeight: "20px",
                height: "20px",
                margin: 0,
                padding: 0
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onScroll={handleScroll}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={!value ? (placeholder ?? PLACEHOLDER_LINES) : ""}
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-text-primary resize-none outline-none placeholder:text-text-tertiary overflow-auto"
            style={{
              fontFamily: "var(--font-jb)",
              fontSize: "12px",
              lineHeight: "20px",
              padding: "16px",
              margin: 0,
              border: "none",
              whiteSpace: "pre",
              wordWrap: "normal",
              overflowWrap: "normal",
            }}
          />
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full bg-transparent text-text-primary resize-none outline-none overflow-auto pointer-events-none"
            style={{
              fontFamily: "var(--font-jb)",
              fontSize: "12px",
              lineHeight: "20px",
              padding: "16px",
              margin: 0,
              border: "none",
              whiteSpace: "pre",
              wordWrap: "normal",
              overflowWrap: "normal",
            }}
          >
            <code
              className={`language-${detectedLanguage}`}
              style={{
                padding: 0,
                margin: 0,
                border: "none",
                background: "transparent",
                fontSize: "12px",
                lineHeight: "20px",
                fontFamily: "var(--font-jb)",
                display: "inline",
                whiteSpace: "pre",
              }}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
            {!value && !isFocused && (
              <span className="text-text-tertiary">
                {placeholder ?? PLACEHOLDER_LINES}
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = "CodeEditor";
