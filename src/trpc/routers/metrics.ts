import { sql } from "drizzle-orm";
import { z } from "zod";
import { roasts } from "@/db/schema";
import { isDatabaseConnectionError } from "@/lib/serverErrors";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const metricsOverviewSchema = z.object({
  roastedCodes: z.number().int().nonnegative(),
  avgScore: z.number().min(0).max(10),
});

const fallbackMetrics = {
  roastedCodes: 0,
  avgScore: 0,
} satisfies z.infer<typeof metricsOverviewSchema>;

export const metricsRouter = createTRPCRouter({
  overview: publicProcedure.output(metricsOverviewSchema).query(async ({ ctx }) => {
    try {
      const [metrics] = await ctx.db
        .select({
          roastedCodes: sql<number>`count(${roasts.id})::int`,
          avgScore: sql<number>`coalesce(avg(${roasts.score})::float, 0)`,
        })
        .from(roasts);

      const roastedCodes = metrics?.roastedCodes ?? 0;
      const avgScore = Number(metrics?.avgScore ?? 0);

      return {
        roastedCodes,
        avgScore: Number(avgScore.toFixed(1)),
      };
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        console.warn(
          "[tRPC] metrics.overview using fallback because database is unavailable",
        );
      } else {
        console.error("[tRPC] metrics.overview fallback to zero values", error);
      }
      return fallbackMetrics;
    }
  }),
});
