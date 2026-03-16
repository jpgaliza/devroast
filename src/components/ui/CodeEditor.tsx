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

  const lineCount = React.useMemo(
    () => Math.max((value || "").split("\n").length, 16),
    [value],
  );

  // Sync scroll between textarea and pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  React.useImperativeHandle(ref, () => textareaRef.current!);

  return (
    <div
      className={[
        "w-full max-w-[780px] min-h-[360px] bg-input border border-border-primary rounded-sm overflow-hidden flex flex-col relative",
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
          language={detectedLanguage}
          onLanguageChange={setDetectedLanguage}
        />
      </div>

      {/* Code Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line Numbers */}
        <div className="w-12 bg-bg-surface border-r border-border-primary py-4 px-3 flex flex-col items-end gap-[6px] shrink-0 text-right">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className="text-text-tertiary font-jb text-xs leading-[20px]"
            >
              {i + 1}
            </span>
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
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-text-primary font-jb text-xs leading-[20px] p-4 resize-none outline-none placeholder:text-text-tertiary overflow-auto"
          />
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full bg-transparent text-text-primary font-jb text-xs leading-[20px] p-4 resize-none outline-none overflow-auto pointer-events-none"
          >
            <code
              className={`language-${detectedLanguage}`}
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
