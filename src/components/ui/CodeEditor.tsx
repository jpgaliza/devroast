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
  maxLength?: number;
  showLanguageSelector?: boolean;
  /** Controlled language; when provided the parent owns the selection state. */
  language?: string | null;
  onLanguageChange?: (lang: string | null) => void;
}

const PLACEHOLDER_LINES = `// paste your code here...
// we'll roast it for you`;

export const CodeEditor = React.forwardRef<
  HTMLTextAreaElement,
  CodeEditorProps
>(
  (
    {
      value = "",
      onChange,
      placeholder,
      className,
      maxLength,
      showLanguageSelector = true,
      language: controlledLanguage,
      onLanguageChange,
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const preRef = React.useRef<HTMLPreElement>(null);
    const lineNumbersRef = React.useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { detectedLanguage, setDetectedLanguage } =
      useLanguageDetection(value);

    // `null` means auto mode; only a non-null value is a manual override.
    const hasManualOverride = controlledLanguage != null;
    const activeLanguage = hasManualOverride
      ? controlledLanguage
      : detectedLanguage;

    const highlightedHtml = React.useMemo(() => {
      const trimmedValue = value.trimEnd();
      if (!trimmedValue) return "";
      try {
        return hljs.highlight(trimmedValue, {
          language: activeLanguage || "plaintext",
          ignoreIllegals: true,
        }).value;
      } catch (error) {
        console.error(error);
        return value; // fallback to plain text
      }
    }, [value, activeLanguage]);

    const lineCount = React.useMemo(() => {
      if (!value) {
        // Calculate how many lines fit in the editor height
        // Mobile: 380px - 32px (header) = 348px
        // Desktop: 480px - 40px (header) = 440px
        // Padding: 16px top + 16px bottom = 32px
        // Available mobile: 348px - 32px = 316px
        // Available desktop: 440px - 32px = 408px
        // Line height: 20px
        // Lines mobile: 316px / 20px = 15.8 ≈ 16 lines
        // Lines desktop: 408px / 20px = 20.4 ≈ 20 lines
        return isMobile ? 16 : 20;
      }
      const lines = value.split("\n");
      // Don't count empty trailing lines
      const actualLines = value.endsWith("\n")
        ? lines.length - 1
        : lines.length;
      return Math.max(actualLines, isMobile ? 16 : 20);
    }, [value, isMobile]);

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
          "w-full max-w-[780px] h-[380px] md:h-[480px] bg-input border border-border-primary rounded-sm overflow-hidden flex flex-col relative",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Window Header */}
        <div className="flex items-center justify-between h-8 md:h-10 px-3 md:px-4 border-b border-border-primary shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-red" />
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-amber" />
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-green" />
          </div>
          {showLanguageSelector && (
            <LanguageSelector
              language={activeLanguage ?? null}
              onLanguageChange={(lang) => {
                if (onLanguageChange) {
                  onLanguageChange?.(lang);
                } else {
                  setDetectedLanguage(lang ?? undefined);
                }
              }}
            />
          )}
        </div>

        {/* Code Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="w-9 md:w-12 bg-bg-surface border-r border-border-primary shrink-0 overflow-y-auto overflow-x-hidden hide-scrollbar"
            style={{
              paddingTop: "16px",
              paddingBottom: "16px",
              paddingLeft: "8px",
              paddingRight: "8px",
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
                  padding: 0,
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
              onChange={(e) => {
                const nextValue = e.target.value;
                onChange?.(
                  typeof maxLength === "number"
                    ? nextValue.slice(0, maxLength)
                    : nextValue,
                );
              }}
              onScroll={handleScroll}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={!value ? (placeholder ?? PLACEHOLDER_LINES) : ""}
              spellCheck={false}
              maxLength={maxLength}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-text-primary resize-none outline-none placeholder:text-text-tertiary overflow-auto px-3 md:px-4"
              style={{
                fontFamily: "var(--font-jb)",
                fontSize: "12px",
                lineHeight: "20px",
                paddingTop: "16px",
                paddingBottom: "16px",
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
              className="absolute inset-0 w-full h-full bg-transparent text-text-primary resize-none outline-none overflow-auto pointer-events-none px-3 md:px-4"
              style={{
                fontFamily: "var(--font-jb)",
                fontSize: "12px",
                lineHeight: "20px",
                paddingTop: "16px",
                paddingBottom: "16px",
                margin: 0,
                border: "none",
                whiteSpace: "pre",
                wordWrap: "normal",
                overflowWrap: "normal",
              }}
            >
              <code
                className={`language-${activeLanguage ?? "plaintext"}`}
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
  },
);

CodeEditor.displayName = "CodeEditor";
