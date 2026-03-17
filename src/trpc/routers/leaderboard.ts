import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { roasts, submissions } from "@/db/schema";
import { isDatabaseConnectionError } from "@/lib/serverErrors";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const leaderboardPreviewEntrySchema = z.object({
  rank: z.number().int().positive(),
  score: z.number().min(0).max(10),
  code: z.string(),
  language: z.string(),
});

const leaderboardPreviewSchema = z.object({
  totalRoasts: z.number().int().nonnegative(),
  entries: z.array(leaderboardPreviewEntrySchema),
});

const fallbackLeaderboardPreview = {
  totalRoasts: 0,
  entries: [],
} satisfies z.infer<typeof leaderboardPreviewSchema>;

// ─── List (full leaderboard, up to 20 entries) ───────────────────────────────

const leaderboardListEntrySchema = z.object({
  rank: z.number().int().positive(),
  score: z.number().min(0).max(10),
  code: z.string(),
  language: z.string(),
  lines: z.number().int().nonnegative(),
});

const leaderboardListSchema = z.object({
  totalRoasts: z.number().int().nonnegative(),
  avgScore: z.number().min(0).max(10),
  entries: z.array(leaderboardListEntrySchema),
});

const fallbackLeaderboardList = {
  totalRoasts: 0,
  avgScore: 0,
  entries: [],
} satisfies z.infer<typeof leaderboardListSchema>;

export const leaderboardRouter = createTRPCRouter({
  preview: publicProcedure.output(leaderboardPreviewSchema).query(async ({ ctx }) => {
    try {
      const [countResult] = await ctx.db
        .select({
          totalRoasts: sql<number>`count(${roasts.id})::int`,
        })
        .from(roasts);

      const rows = await ctx.db
        .select({
          score: sql<number>`(${roasts.score})::float`,
          code: submissions.code,
          language: submissions.language,
        })
        .from(roasts)
        .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
        .orderBy(asc(roasts.score), asc(roasts.createdAt))
        .limit(3);

      return {
        totalRoasts: countResult?.totalRoasts ?? 0,
        entries: rows.map((row, index) => ({
          rank: index + 1,
          score: Number(row.score.toFixed(1)),
          code: row.code,
          language: row.language,
        })),
      };
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        console.warn(
          "[tRPC] leaderboard.preview using fallback because database is unavailable",
        );
      } else {
        console.error("[tRPC] leaderboard.preview fallback to empty values", error);
      }
      return fallbackLeaderboardPreview;
    }
  }),

  list: publicProcedure.output(leaderboardListSchema).query(async ({ ctx }) => {
    try {
      const [stats] = await ctx.db
        .select({
          totalRoasts: sql<number>`count(${roasts.id})::int`,
          avgScore: sql<number>`coalesce(avg(${roasts.score})::float, 0)`,
        })
        .from(roasts);

      const rows = await ctx.db
        .select({
          score: sql<number>`(${roasts.score})::float`,
          code: submissions.code,
          language: submissions.language,
          lines: submissions.linesCount,
        })
        .from(roasts)
        .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
        .orderBy(asc(roasts.score), asc(roasts.createdAt))
        .limit(20);

      return {
        totalRoasts: stats?.totalRoasts ?? 0,
        avgScore: Number((stats?.avgScore ?? 0).toFixed(1)),
        entries: rows.map((row, index) => ({
          rank: index + 1,
          score: Number(row.score.toFixed(1)),
          code: row.code,
          language: row.language,
          lines: row.lines,
        })),
      };
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        console.warn(
          "[tRPC] leaderboard.list using fallback because database is unavailable",
        );
      } else {
        console.error("[tRPC] leaderboard.list fallback to empty values", error);
      }
      return fallbackLeaderboardList;
    }
  }),
});