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
} from "@/components/ui/LeaderboardPreview";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <span
      className={[
        "inline-block h-3 animate-pulse bg-bg-elevated rounded-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function LeaderboardRowSkeleton({ rank }: { rank: number }) {
  return (
    <LeaderboardTableRow>
      <LeaderboardTableCell className="w-10 text-text-tertiary">
        {rank}
      </LeaderboardTableCell>
      <LeaderboardTableCell className="w-15">
        <SkeletonLine className="w-8" />
      </LeaderboardTableCell>
      <LeaderboardTableCell className="flex-1">
        <div className="flex flex-col gap-0.5">
          <SkeletonLine className="w-48" />
          <SkeletonLine className="w-36" />
          <SkeletonLine className="w-40" />
        </div>
      </LeaderboardTableCell>
      <LeaderboardTableCell className="w-25 text-right">
        <SkeletonLine className="w-16 ml-auto" />
      </LeaderboardTableCell>
    </LeaderboardTableRow>
  );
}

export function HomeLeaderboardSkeleton() {
  return (
    <LeaderboardRoot>
      <LeaderboardHeader>
        <div className="flex flex-col gap-8">
          <LeaderboardTitle>shame_leaderboard</LeaderboardTitle>
          <LeaderboardSubtitle>
            {"// the worst code on the internet, ranked by shame"}
          </LeaderboardSubtitle>
        </div>
        <span className="h-9 w-32 animate-pulse bg-bg-elevated" />
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
        <LeaderboardRowSkeleton rank={1} />
        <LeaderboardRowSkeleton rank={2} />
        <LeaderboardRowSkeleton rank={3} />
      </LeaderboardTable>

      <LeaderboardFooter>
        <SkeletonLine className="w-64 mx-auto" />
      </LeaderboardFooter>
    </LeaderboardRoot>
  );
}
