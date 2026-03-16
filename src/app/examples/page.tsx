import { Button } from "@/components/ui/button";
import { ToggleRoot, ToggleSwitch, ToggleLabel } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { InputRoot, InputLabel, InputField } from "@/components/ui/Input";
import { CodeBlockServer } from "@/components/ui/CodeBlock.server";
import { ScoreRing } from "@/components/ui/ScoreRing";
import {
  CodeEditorRoot,
  CodeEditorHeader,
  CodeEditorScrollArea,
} from "@/components/ui/CodeEditor";
import {
  CardRoot,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { DiffLine } from "@/components/ui/DiffLine";
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
import { NavbarRoot, NavbarBrand, NavbarLinks } from "@/components/ui/Navbar";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";

/* ─── Shared section heading ─── */
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-jb text-sm font-bold text-accent-green">//</span>
      <span className="font-jb text-sm font-bold text-text-primary">
        {label}
      </span>
    </div>
  );
}

const sampleCode = `export function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

export default async function UIExamplesPage() {
  return (
    <main className="min-h-screen bg-page px-10 py-12 space-y-16 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <span className="font-jb text-2xl font-bold text-accent-green">$</span>
        <h1 className="font-jb text-2xl font-bold text-text-primary">
          component_showcase
        </h1>
      </div>

      {/* ── 1. Typography ── */}
      <section className="space-y-6">
        <SectionTitle label="typography" />
        <div className="space-y-3">
          <p className="font-jb text-4xl font-bold text-text-primary">
            paste your code. get roasted.
          </p>
          <p className="font-ibm text-sm text-text-secondary">
            // drop your code below and we&apos;ll rate it — brutally honest or
            full roast mode
          </p>
          <p className="font-jb text-xs text-text-tertiary">
            // secondary label or metadata
          </p>
        </div>
      </section>

      {/* ── 2. Buttons ── */}
      <section className="space-y-6">
        <SectionTitle label="buttons" />
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="default">$ roast_my_code</Button>
          <Button variant="secondary">$ share_roast</Button>
          <Button variant="ghost">$ view_all &gt;&gt;</Button>
          <Button variant="destructive">$ delete</Button>
          <Button variant="default" isLoading>
            Loading
          </Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* ── 3. Toggle ── */}
      <section className="space-y-6">
        <SectionTitle label="toggle" />
        <div className="flex items-center gap-8">
          <ToggleRoot>
            <ToggleSwitch defaultChecked isOn />
            <ToggleLabel isOn>roast mode</ToggleLabel>
          </ToggleRoot>
          <ToggleRoot>
            <ToggleSwitch />
            <ToggleLabel>roast mode</ToggleLabel>
          </ToggleRoot>
        </div>
      </section>

      {/* ── 4. Badge status ── */}
      <section className="space-y-6">
        <SectionTitle label="badge_status" />
        <div className="flex items-center gap-6">
          <Badge variant="critical">critical</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="good">good</Badge>
          <Badge variant="default">default</Badge>
          <Badge variant="critical">needs_serious_help</Badge>
        </div>
      </section>

      {/* ── 5. Cards ── */}
      <section className="space-y-6">
        <SectionTitle label="cards" />
        <div className="flex flex-col gap-4 max-w-[480px]">
          <CardRoot>
            <CardHeader>
              <Badge variant="critical">critical</Badge>
            </CardHeader>
            <CardTitle>using var instead of const/let</CardTitle>
            <CardDescription>
              the var keyword is function-scoped rather than block-scoped, which
              can lead to unexpected behavior and bugs. modern javascript uses
              const for immutable bindings and let for mutable ones.
            </CardDescription>
          </CardRoot>
          <CardRoot>
            <CardHeader>
              <Badge variant="warning">warning</Badge>
            </CardHeader>
            <CardTitle>missing error handling</CardTitle>
            <CardDescription>
              async operations should always have proper error handling to
              prevent unhandled promise rejections and improve application
              resilience.
            </CardDescription>
          </CardRoot>
          <CardRoot>
            <CardHeader>
              <Badge variant="good">good</Badge>
            </CardHeader>
            <CardTitle>consistent naming conventions</CardTitle>
            <CardDescription>
              variable and function names follow camelCase consistently
              throughout the codebase, making it easier to read and maintain.
            </CardDescription>
          </CardRoot>
        </div>
      </section>

      {/* ── 6. Code block ── */}
      <section className="space-y-6">
        <SectionTitle label="code_block" />
        <CodeEditorRoot className="max-w-[560px] h-auto">
          <CodeEditorHeader fileName="calculate.js" />
          <CodeEditorScrollArea
            value={sampleCode}
            lineCount={6}
            readOnly
          />
        </CodeEditorRoot>
        <div className="mt-6">
          <CodeBlockServer
            code={`export const sum = (a: number, b: number) => a + b;`}
            language="ts"
          />
        </div>
      </section>

      {/* ── 7. Diff line ── */}
      <section className="space-y-6">
        <SectionTitle label="diff_line" />
        <div className="max-w-[560px] flex flex-col">
          <DiffLine type="removed" code="var total = 0;" />
          <DiffLine type="added" code="const total = 0;" />
          <DiffLine
            type="context"
            code={"for (let i = 0; i < items.length; i++) {"}
          />
        </div>
      </section>

      {/* ── 8. Table row (leaderboard) ── */}
      <section className="space-y-6">
        <SectionTitle label="table_row" />
        <LeaderboardRoot>
          <LeaderboardHeader>
            <LeaderboardTitle>hall of shame</LeaderboardTitle>
            <LeaderboardSubtitle>worst code of the week</LeaderboardSubtitle>
          </LeaderboardHeader>
          <LeaderboardTable>
            <LeaderboardTableHead>
              <LeaderboardTableCell className="text-text-tertiary w-12">
                #
              </LeaderboardTableCell>
              <LeaderboardTableCell className="text-text-tertiary flex-1">
                snippet
              </LeaderboardTableCell>
              <LeaderboardTableCell className="text-text-tertiary w-20 text-right">
                score
              </LeaderboardTableCell>
            </LeaderboardTableHead>
            <LeaderboardTableRow>
              <LeaderboardTableCell className="text-text-tertiary w-12">
                01
              </LeaderboardTableCell>
              <LeaderboardTableCell className="text-text-primary flex-1">
                spaghetti_factory.js
              </LeaderboardTableCell>
              <LeaderboardTableCell className="w-20 text-right">
                <LeaderboardScore value={1.2} />
              </LeaderboardTableCell>
            </LeaderboardTableRow>
            <LeaderboardTableRow>
              <LeaderboardTableCell className="text-text-tertiary w-12">
                02
              </LeaderboardTableCell>
              <LeaderboardTableCell className="text-text-primary flex-1">
                cursed_callback.ts
              </LeaderboardTableCell>
              <LeaderboardTableCell className="w-20 text-right">
                <LeaderboardScore value={3.4} />
              </LeaderboardTableCell>
            </LeaderboardTableRow>
            <LeaderboardTableRow>
              <LeaderboardTableCell className="text-text-tertiary w-12">
                03
              </LeaderboardTableCell>
              <LeaderboardTableCell className="text-text-primary flex-1">
                utils_final_v3.js
              </LeaderboardTableCell>
              <LeaderboardTableCell className="w-20 text-right">
                <LeaderboardScore value={6.8} />
              </LeaderboardTableCell>
            </LeaderboardTableRow>
          </LeaderboardTable>
          <LeaderboardFooter>showing 3 of 24 entries</LeaderboardFooter>
        </LeaderboardRoot>
      </section>

      {/* ── 8b. Score ring ── */}
      <section className="space-y-6">
        <SectionTitle label="score_ring" />
        <div className="flex items-center gap-8">
          <ScoreRing value={1.5} max={10} size={160} />
          <ScoreRing value={4.2} max={10} size={160} />
          <ScoreRing value={8.7} max={10} size={160} />
        </div>
      </section>

      {/* ── 9. Navbar ── */}
      <section className="space-y-6">
        <SectionTitle label="navbar" />
        <div className="border border-border-primary">
          <NavbarRoot>
            <NavbarBrand>
              <Logo />
            </NavbarBrand>
            <NavbarLinks>
              <NavLink href="#">leaderboard</NavLink>
              <Button variant="ghost" size="sm">
                $ sign_in
              </Button>
            </NavbarLinks>
          </NavbarRoot>
        </div>
      </section>

      {/* ── Input ── */}
      <section className="space-y-6">
        <SectionTitle label="input" />
        <div className="max-w-sm space-y-4">
          <InputRoot>
            <InputLabel>email</InputLabel>
            <InputField placeholder="dev@example.com" />
          </InputRoot>
          <InputRoot>
            <InputLabel>username</InputLabel>
            <InputField
              placeholder="$ your_handle"
              defaultValue="codecriminal"
            />
          </InputRoot>
        </div>
      </section>
    </main>
  );
}
