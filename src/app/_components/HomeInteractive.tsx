"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Balancer } from "react-wrap-balancer";
import { Button } from "@/components/ui";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { ToggleLabel, ToggleRoot, ToggleSwitch } from "@/components/ui/Toggle";

const MOCK_ROAST_ID = "550e8400-e29b-41d4-a716-446655440000";
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
  const router = useRouter();
  const characterCount = code.length;
  const isOverLimit = characterCount > HOMEPAGE_CODE_MAX_LENGTH;
  const overLimitCount = Math.max(0, characterCount - HOMEPAGE_CODE_MAX_LENGTH);

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
      <CodeEditor value={code} onChange={setCode} />

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
              disabled={isOverLimit}
              className={[
                "font-jb text-[13px] font-medium px-6 py-2.5 rounded-none",
                isOverLimit
                  ? "bg-border-primary text-text-tertiary cursor-not-allowed"
                  : "cursor-pointer bg-accent-green text-[#0a0a0a] hover:bg-accent-green/90",
              ].join(" ")}
              onClick={() => router.push(`/result/${MOCK_ROAST_ID}`)}
            >
              $ roast_my_code
            </Button>
          </div>
        </div>

        {isOverLimit && (
          <p className="mt-2 text-right font-ibm text-xs text-accent-red">
            {`// limit exceeded: remove ${overLimitCount} characters to continue`}
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
