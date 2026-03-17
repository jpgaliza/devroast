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

export { AI_MODEL };
