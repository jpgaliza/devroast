"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "tsx", name: "TSX" },
  { id: "python", name: "Python" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "php", name: "PHP" },
  { id: "ruby", name: "Ruby" },
  { id: "sql", name: "SQL" },
  { id: "bash", name: "Bash" },
  { id: "json", name: "JSON" },
  { id: "yaml", name: "YAML" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
  { id: "markdown", name: "Markdown" },
] as const;

interface LanguageSelectorProps {
  /** Currently active language id; null means auto-detected. */
  language: string | null;
  /** Called when user picks an override; null = reset to auto. */
  onLanguageChange: (lang: string | null) => void;
}

export const LanguageSelector = ({ language, onLanguageChange }: LanguageSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Avoid SSR mismatch — portal only renders after mount
  React.useEffect(() => setMounted(true), []);

  const displayName =
    SUPPORTED_LANGUAGES.find((l) => l.id === language)?.name ?? language ?? "auto";

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  };

  const closeDropdown = () => setOpen(false);

  const handleSelect = (value: string | null) => {
    onLanguageChange(value);
    closeDropdown();
  };

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on scroll (dropdown is fixed at open-time coords — doesn't follow page)
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      closeDropdown();
    };
    window.addEventListener("scroll", handler, { capture: true });
    return () => window.removeEventListener("scroll", handler, { capture: true });
  }, [open]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 flex flex-col bg-bg-surface border border-border-primary max-h-[280px] overflow-y-auto py-1"
      role="listbox"
      aria-label="Select language"
    >
      {/* Auto option — resets manual override */}
      <button
        type="button"
        role="option"
        aria-selected={language === null}
        onClick={() => handleSelect(null)}
        className={[
          "text-left px-3 py-1.5 font-jb text-xs cursor-pointer transition-colors whitespace-nowrap",
          language === null
            ? "text-accent-green"
            : "text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated",
        ].join(" ")}
      >
        {"// auto"}
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-border-primary" />

      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.id}
          type="button"
          role="option"
          aria-selected={language === lang.id}
          onClick={() => handleSelect(lang.id)}
          className={[
            "text-left px-3 py-1.5 font-jb text-xs cursor-pointer transition-colors whitespace-nowrap",
            language === lang.id
              ? "text-accent-green"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
          ].join(" ")}
        >
          {lang.name}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? closeDropdown : openDropdown}
        className="font-jb text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {"// "}
        <span className={open ? "text-text-primary" : "text-text-secondary"}>{displayName}</span>
        {" ▾"}
      </button>

      {mounted && createPortal(dropdown, document.body)}
    </>
  );
};

LanguageSelector.displayName = "LanguageSelector";
