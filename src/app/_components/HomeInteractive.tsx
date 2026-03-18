"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Balancer } from "react-wrap-balancer";
import { Button } from "@/components/ui";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { ToggleLabel, ToggleRoot, ToggleSwitch } from "@/components/ui/Toggle";
import type { Language } from "@/db/schema";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import { useTRPC } from "@/trpc/client";

const HOMEPAGE_CODE_MAX_LENGTH = 2000;

interface HomeInteractiveProps {
  children: React.ReactNode;
  leaderboardSlot?: React.ReactNode;
}

export function HomeInteractive({
  children,
  leaderboardSlot,
}: HomeInteractiveProps) {
  const [code, setCode] = React.useState("");
  const [roastMode, setRoastMode] = React.useState(true);
  const [language, setLanguage] = React.useState<Language | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [analyzingDots, setAnalyzingDots] = React.useState("...");
  const { detectedLanguage } = useLanguageDetection(code);

  const router = useRouter();
  const trpc = useTRPC();

  const submitMutation = useMutation(
    trpc.roast.submit.mutationOptions({
      onSuccess: ({ roastId }) => {
        const resultPath = `/result/${roastId}`;

        setIsNavigating(true);
        setErrorMessage("// roast ready, opening result...");
        router.prefetch(resultPath);
        React.startTransition(() => {
          router.push(resultPath);
        });
      },
      onError: (error) => {
        setIsNavigating(false);
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          setErrorMessage(
            "// ai service quota exceeded, check your api key billing",
          );
        } else if (error.data?.code === "SERVICE_UNAVAILABLE") {
          setErrorMessage(
            "// database unavailable, start postgres and try again",
          );
        } else {
          setErrorMessage("// failed to analyze code, please try again");
        }
      },
    }),
  );

  const characterCount = code.length;
  const isOverLimit = characterCount > HOMEPAGE_CODE_MAX_LENGTH;
  const overLimitCount = Math.max(0, characterCount - HOMEPAGE_CODE_MAX_LENGTH);
  const isSubmitDisabled =
    submitMutation.isPending ||
    isNavigating ||
    isOverLimit ||
    code.trim().length === 0;
  const isBusy = submitMutation.isPending || isNavigating;

  React.useEffect(() => {
    if (!isBusy) {
      setAnalyzingDots("...");
      return;
    }

    let dots = 1;
    const intervalId = window.setInterval(() => {
      setAnalyzingDots(".".repeat(dots));
      dots = dots === 3 ? 1 : dots + 1;
    }, 350);

    return () => window.clearInterval(intervalId);
  }, [isBusy]);

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    setIsNavigating(false);
    setErrorMessage(null);

    const effectiveLanguage = (language ??
      (detectedLanguage as Language | undefined) ??
      "plaintext") as Language;

    submitMutation.mutate({
      code,
      language: effectiveLanguage,
      mode: roastMode ? "roast" : "honest",
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-240">
      {/* Title */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <span className="text-accent-green font-jb text-4xl font-bold">
            $
          </span>
          <h1 className="text-text-primary font-jb text-4xl font-bold">
            <Balancer>paste your code. get roasted.</Balancer>
          </h1>
        </div>
        <p className="text-text-secondary font-ibm text-sm">
          <Balancer>
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </Balancer>
        </p>
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
        language={language}
        onLanguageChange={(lang) =>
          setLanguage((lang as Language | null) ?? null)
        }
      />

      {/* Actions Bar */}
      <div className="w-full max-w-195">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Roast Toggle */}
          <div className="flex items-center gap-4">
            <ToggleRoot>
              <ToggleSwitch
                checked={roastMode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRoastMode(e.target.checked)
                }
              />
              <ToggleLabel isOn={roastMode}>roast mode</ToggleLabel>
            </ToggleRoot>
            <span className="text-text-tertiary font-ibm text-xs">
              {"// maximum sarcasm enabled"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={[
                "font-jb text-xs",
                isOverLimit ? "text-accent-red" : "text-text-tertiary",
              ].join(" ")}
            >
              {characterCount}/{HOMEPAGE_CODE_MAX_LENGTH} chars
            </span>

            {/* Right: Submit Button */}
            <Button
              variant="default"
              disabled={isSubmitDisabled}
              className={[
                "font-jb text-[13px] font-medium px-6 py-2.5 rounded-none",
                isSubmitDisabled
                  ? "bg-border-primary text-text-tertiary cursor-not-allowed"
                  : "cursor-pointer bg-accent-green text-[#0a0a0a] hover:bg-accent-green/90",
                isBusy ? "button-loading" : "",
              ].join(" ")}
              onClick={handleSubmit}
            >
              {isNavigating ? (
                <>
                  $ opening_result
                  <span className="inline-block w-4 text-left">{analyzingDots}</span>
                </>
              ) : submitMutation.isPending ? (
                <>
                  $ analyzing
                  <span className="inline-block w-4 text-left">{analyzingDots}</span>
                </>
              ) : (
                "$ roast_my_code"
              )}
            </Button>
          </div>
        </div>

        {isOverLimit && (
          <p className="mt-2 text-right font-ibm text-xs text-accent-red">
            {`// limit exceeded: remove ${overLimitCount} characters to continue`}
          </p>
        )}

        {errorMessage && (
          <p
            className={[
              "mt-2 text-right font-ibm text-xs",
              isNavigating ? "text-accent-green" : "text-accent-red",
            ].join(" ")}
          >
            {errorMessage}
          </p>
        )}
      </div>

      {/* Footer Stats */}
      {children}

      {/* Spacer */}
      <div className="h-24" />

      {/* Leaderboard Preview */}
      {leaderboardSlot}

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}
