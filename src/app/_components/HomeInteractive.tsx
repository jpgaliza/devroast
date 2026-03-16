"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Balancer } from "react-wrap-balancer";
import { Button } from "@/components/ui";
import { CodeEditor } from "@/components/ui/CodeEditor";
import {
  LeaderboardRoot,
  LeaderboardHeader,
  LeaderboardTitle,
  LeaderboardSubtitle,
  LeaderboardTable,
  LeaderboardTableHead,
  LeaderboardTableRow,
  LeaderboardTableCell,
  LeaderboardFooter,
  LeaderboardScore,
} from "@/components/ui/LeaderboardPreview";
import { ToggleLabel, ToggleRoot, ToggleSwitch } from "@/components/ui/Toggle";

const MOCK_ROAST_ID = "550e8400-e29b-41d4-a716-446655440000";
const HOMEPAGE_CODE_MAX_LENGTH = 2000;

interface HomeInteractiveProps {
  children: React.ReactNode;
}

export function HomeInteractive({ children }: HomeInteractiveProps) {
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
      <LeaderboardRoot>
        <LeaderboardHeader>
          <div className="flex flex-col gap-8">
            <LeaderboardTitle>shame_leaderboard</LeaderboardTitle>
            <LeaderboardSubtitle>
              // the worst code on the internet, ranked by shame
            </LeaderboardSubtitle>
          </div>
          <Link href="/leaderboard">
            <Button
              variant="default"
              className="cursor-pointer bg-transparent border border-border-primary text-text-tertiary hover:bg-bg-elevated font-jb text-[13px] font-medium px-4 py-2 rounded-none"
            >
              $ view_all &gt;&gt;
            </Button>
          </Link>
        </LeaderboardHeader>
        <LeaderboardTable>
          <LeaderboardTableHead>
            <LeaderboardTableCell className="w-10 text-text-tertiary">
              #
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-15 text-text-tertiary">
              score
            </LeaderboardTableCell>
            <LeaderboardTableCell className="flex-1 text-text-tertiary">
              code
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
              lang
            </LeaderboardTableCell>
          </LeaderboardTableHead>
          {/* Rows */}
          <LeaderboardTableRow>
            <LeaderboardTableCell className="w-10 text-text-tertiary">
              1
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-15">
              <LeaderboardScore value={1.2} />
            </LeaderboardTableCell>
            <LeaderboardTableCell className="flex-1 text-text-secondary">
              <div className="flex flex-col gap-0.5">
                <code className="text-text-primary">
                  eval(prompt("enter code"))
                </code>
                <code className="text-text-primary">
                  document.write(response)
                </code>
                <code className="text-text-tertiary">
                  // trust the user lol
                </code>
              </div>
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
              javascript
            </LeaderboardTableCell>
          </LeaderboardTableRow>
          <LeaderboardTableRow>
            <LeaderboardTableCell className="w-10 text-text-tertiary">
              2
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-15">
              <LeaderboardScore value={1.8} />
            </LeaderboardTableCell>
            <LeaderboardTableCell className="flex-1 text-text-secondary">
              <div className="flex flex-col gap-0.5">
                <code className="text-text-primary">
                  {`if (x == true) { return true; }`}
                </code>
                <code className="text-text-primary">
                  {`else if (x == false) { return false; }`}
                </code>
                <code className="text-text-primary">
                  {`else { return !false; }`}
                </code>
              </div>
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
              typescript
            </LeaderboardTableCell>
          </LeaderboardTableRow>
          <LeaderboardTableRow>
            <LeaderboardTableCell className="w-10 text-text-tertiary">
              3
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-15">
              <LeaderboardScore value={2.1} />
            </LeaderboardTableCell>
            <LeaderboardTableCell className="flex-1 text-text-secondary">
              <div className="flex flex-col gap-0.5">
                <code className="text-text-primary">
                  SELECT * FROM users WHERE 1=1
                </code>
                <code className="text-text-tertiary">
                  -- TODO: add authentication
                </code>
              </div>
            </LeaderboardTableCell>
            <LeaderboardTableCell className="w-25 text-text-tertiary text-right">
              sql
            </LeaderboardTableCell>
          </LeaderboardTableRow>
        </LeaderboardTable>
        <LeaderboardFooter>
          showing top 3 of 2,847 ·{" "}
          <Link
            href="/leaderboard"
            className="text-text-tertiary hover:text-primary transition-colors"
          >
            view full leaderboard &gt;&gt;
          </Link>
        </LeaderboardFooter>
      </LeaderboardRoot>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}
