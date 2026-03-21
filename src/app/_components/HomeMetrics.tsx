import { unstable_cache } from "next/cache";
import { HomeMetricsNumbers } from "@/app/_components/HomeMetricsNumbers";
import { getTRPCCaller } from "@/trpc/server";

const getMetricsOverview = unstable_cache(
  async () => {
    const caller = await getTRPCCaller();
    return caller.metrics.overview();
  },
  ["home-metrics-overview-v1"],
  { revalidate: 3600, tags: ["metrics"] },
);

export async function HomeMetrics() {
  const metrics = await getMetricsOverview();

  return (
    <HomeMetricsNumbers
      roastedCodes={metrics.roastedCodes}
      avgScore={metrics.avgScore}
    />
  );
}
