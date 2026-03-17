import OpenAI from "openai";
import { z } from "zod";
import type { FeedbackItem, RoastMode } from "@/db/schema";

const AI_MODEL = "llama-3.3-70b-versatile";

const roastSystemPrompt =
	"You are a ruthless senior engineer doing a brutal code review. Be sarcastic, sharp, and technically precise. Your job is to tear apart this code with maximum sarcasm while still being technically accurate. Never be cruel for no reason - every joke must have technical substance.";

const honestSystemPrompt =
	"You are an experienced senior engineer doing a thorough and constructive code review. Be direct, professional, and helpful. Identify real issues and real strengths.";

const aiRoastSchema = z.object({
	score: z.number().min(0).max(10),
	headline: z.string().min(1),
	feedback: z
		.array(
			z.object({
				content: z.string().min(1),
				isPositive: z.boolean(),
			}),
		)
		.min(3)
		.max(5),
});

const aiImprovementSchema = z.object({
	summary: z.string().min(1),
	suggestions: z.array(z.string().min(1)).min(3).max(6),
	improvedCode: z.string().min(1),
});

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
	if (openaiClient) {
		return openaiClient;
	}

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY is not configured");
	}

	openaiClient = new OpenAI({
		apiKey,
		baseURL: "https://api.groq.com/openai/v1",
	});
	return openaiClient;
}

function getSystemPrompt(mode: RoastMode) {
	return mode === "roast" ? roastSystemPrompt : honestSystemPrompt;
}

function getUserPrompt(code: string, language: string) {
	return [
		`Review the following ${language} code and respond with a JSON object exactly matching this structure:`,
		"{",
		'  "score": <number 0.0-10.0, one decimal>,',
		'  "headline": <one punchy sentence summarizing the review>,',
		'  "feedback": [',
		'    { "content": <specific observation>, "isPositive": <true|false> },',
		"    ...  // 3 to 5 items",
		"  ]",
		"}",
		"Code:",
		`\`\`\`${language}`,
		code,
		"```",
	].join("\n");
}

function getImprovementPrompt(
	code: string,
	language: string,
	feedback: FeedbackItem[],
) {
	const feedbackLines = feedback
		.map((item, index) => `${index + 1}. ${item.content}`)
		.join("\n");

	return [
		`Improve the following ${language} code based on the review feedback.`,
		"Return a JSON object exactly matching this structure:",
		"{",
		'  "summary": <one short sentence describing the overall refactor>,',
		'  "suggestions": [<3 to 6 short, concrete improvements>],',
		'  "improvedCode": <full improved code string, same language>,',
		"}",
		"Rules:",
		"- Keep original behavior unless it is clearly broken.",
		"- Focus on readability, naming, safety, and maintainability.",
		"- Do not include markdown code fences in improvedCode.",
		"- Keep improvedCode as a complete file/snippet.",
		"Review feedback:",
		feedbackLines,
		"Original code:",
		`\`\`\`${language}`,
		code,
		"```",
	].join("\n");
}

export async function generateRoast(
	code: string,
	language: string,
	mode: RoastMode,
): Promise<{
	score: number;
	headline: string;
	feedback: FeedbackItem[];
}> {
	const client = getOpenAIClient();

	const completion = await client.chat.completions.create({
		model: AI_MODEL,
		response_format: { type: "json_object" },
		temperature: mode === "roast" ? 0.8 : 0.5,
		messages: [
			{
				role: "system",
				content: getSystemPrompt(mode),
			},
			{
				role: "user",
				content: getUserPrompt(code, language),
			},
		],
	});

	const content = completion.choices[0]?.message?.content;
	if (!content) {
		throw new Error("OpenAI returned an empty response");
	}

	const parsedJson = JSON.parse(content) as unknown;
	const parsed = aiRoastSchema.parse(parsedJson);

	return {
		score: Number(parsed.score.toFixed(1)),
		headline: parsed.headline,
		feedback: parsed.feedback,
	};
}

export async function generateImprovedCode(
	code: string,
	language: string,
	feedback: FeedbackItem[],
): Promise<{
	summary: string;
	suggestions: string[];
	improvedCode: string;
}> {
	const client = getOpenAIClient();

	const completion = await client.chat.completions.create({
		model: AI_MODEL,
		response_format: { type: "json_object" },
		temperature: 0.3,
		messages: [
			{
				role: "system",
				content:
					"You are a senior software engineer that writes practical and safe refactors.",
			},
			{
				role: "user",
				content: getImprovementPrompt(code, language, feedback),
			},
		],
	});

	const content = completion.choices[0]?.message?.content;
	if (!content) {
		throw new Error("OpenAI returned an empty improvement response");
	}

	const parsedJson = JSON.parse(content) as unknown;
	const parsed = aiImprovementSchema.parse(parsedJson);

	return {
		summary: parsed.summary,
		suggestions: parsed.suggestions,
		improvedCode: parsed.improvedCode,
	};
}

export { AI_MODEL };
