import { HomeMetricsNumbers } from "@/app/_components/HomeMetricsNumbers";
import { getTRPCCaller } from "@/trpc/server";

export async function HomeMetrics() {
  const caller = await getTRPCCaller();
  const metrics = await caller.metrics.overview();

  return (
    <HomeMetricsNumbers
      roastedCodes={metrics.roastedCodes}
      avgScore={metrics.avgScore}
    />
  );
}
