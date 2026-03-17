import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
	languageEnum,
	roastModeEnum,
	roasts,
	submissions,
	type Verdict,
	verdictEnum,
} from "@/db/schema";
import { AI_MODEL, generateRoast } from "@/lib/ai";
import {
	isDatabaseConnectionError,
	isRateLimitError,
} from "@/lib/serverErrors";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const submitInputSchema = z.object({
	code: z.string().min(1).max(2000),
	language: z.enum(languageEnum.enumValues),
	mode: z.enum(roastModeEnum.enumValues),
});

const submitOutputSchema = z.object({
	roastId: z.string().uuid(),
});

const getByIdInputSchema = z.object({
	id: z.string().uuid(),
});

const getByIdOutputSchema = z.object({
	roastId: z.string().uuid(),
	score: z.number(),
	verdict: z.enum(verdictEnum.enumValues),
	headline: z.string(),
	feedback: z.array(
		z.object({
			content: z.string(),
			isPositive: z.boolean(),
		}),
	),
	aiModel: z.string(),
	code: z.string(),
	language: z.string(),
	mode: z.enum(roastModeEnum.enumValues),
	linesCount: z.number(),
	createdAt: z.date(),
});

function getVerdictFromScore(score: number): Verdict {
	if (score <= 2.0) return "garbage_fire";
	if (score <= 4.0) return "needs_serious_help";
	if (score <= 6.0) return "questionable";
	if (score <= 8.0) return "not_terrible";
	return "actually_good";
}

function getLinesCount(code: string) {
	if (!code) return 0;
	return code.split(/\r\n|\r|\n/).length;
}

export const roastRouter = createTRPCRouter({
	submit: publicProcedure
		.input(submitInputSchema)
		.output(submitOutputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const linesCount = getLinesCount(input.code);
				const charCount = input.code.length;

				const [submission] = await ctx.db
					.insert(submissions)
					.values({
						code: input.code,
						language: input.language,
						mode: input.mode,
						linesCount,
						charCount,
					})
					.returning({ id: submissions.id });

				if (!submission?.id) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Could not persist submission",
					});
				}

				const generated = await generateRoast(
					input.code,
					input.language,
					input.mode,
				);

				const verdict = getVerdictFromScore(generated.score);

				const [roast] = await ctx.db
					.insert(roasts)
					.values({
						submissionId: submission.id,
						score: generated.score.toFixed(1),
						verdict,
						headline: generated.headline,
						feedback: generated.feedback,
						aiModel: AI_MODEL,
					})
					.returning({ id: roasts.id });

				if (!roast?.id) {
					throw new Error("Could not persist roast");
				}

				return { roastId: roast.id };
			} catch (error) {
				console.error("[tRPC] roast.submit failed", error);

				if (isDatabaseConnectionError(error)) {
					throw new TRPCError({
						code: "SERVICE_UNAVAILABLE",
						message: "Database unavailable",
					});
				}

				throw new TRPCError({
					code: isRateLimitError(error)
						? "TOO_MANY_REQUESTS"
						: "INTERNAL_SERVER_ERROR",
					message: isRateLimitError(error)
						? "AI service quota exceeded"
						: "Failed to generate roast",
				});
			}
		}),

	getById: publicProcedure
		.input(getByIdInputSchema)
		.output(getByIdOutputSchema)
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select({
					roastId: roasts.id,
					score: sql<number>`(${roasts.score})::float`,
					verdict: roasts.verdict,
					headline: roasts.headline,
					feedback: roasts.feedback,
					aiModel: roasts.aiModel,
					code: submissions.code,
					language: submissions.language,
					mode: submissions.mode,
					linesCount: submissions.linesCount,
					createdAt: roasts.createdAt,
				})
				.from(roasts)
				.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
				.where(eq(roasts.id, input.id))
				.limit(1);

			if (!row) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Roast not found" });
			}

			return {
				...row,
				score: Number(row.score.toFixed(1)),
			};
		}),
});
