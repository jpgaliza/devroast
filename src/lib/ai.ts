import OpenAI from "openai";
import { z } from "zod";
import type { FeedbackItem, RoastMode } from "@/db/schema";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-3.8-flash"];

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

type AIClientConfig = {
	client: OpenAI;
	model: string;
};

let cachedConfig: AIClientConfig | null = null;

function getAIClientConfig(): AIClientConfig {
	if (cachedConfig) {
		return cachedConfig;
	}

	const googleApiKey =
		process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

	if (googleApiKey) {
		cachedConfig = {
			client: new OpenAI({
				apiKey: googleApiKey,
				baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
			}),
			model: GEMINI_MODEL,
		};
		return cachedConfig;
	}

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error(
			"GEMINI_API_KEY (or OPENAI_API_KEY) is not configured",
		);
	}

	cachedConfig = {
		client: new OpenAI({
			apiKey,
			baseURL: "https://api.groq.com/openai/v1",
		}),
		model: GROQ_MODEL,
	};
	return cachedConfig;
}

function getActiveModel() {
	return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
		? GEMINI_MODEL
		: GROQ_MODEL;
}

function stripJsonFences(raw: string): string {
	return raw
		.trim()
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/, "")
		.trim();
}

async function callGeminiNative(
	apiKey: string,
	systemPrompt: string,
	userPrompt: string,
	temperature: number,
): Promise<string> {
	let lastError: Error | null = null;

	for (const modelName of GEMINI_FALLBACK_MODELS) {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

		let response: Response;
		try {
			response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: AbortSignal.timeout(22000),
				body: JSON.stringify({
					systemInstruction: {
						parts: [{ text: systemPrompt }],
					},
					contents: [
						{
							role: "user",
							parts: [{ text: userPrompt }],
						},
					],
					generationConfig: {
						temperature,
						responseMimeType: "application/json",
					},
				}),
			});
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));
			continue;
		}

		if (!response.ok) {
			const errText = await response.text();
			lastError = new Error(
				`Gemini API error (${response.status} on ${modelName}): ${errText}`,
			);
			if (
				response.status === 404 ||
				response.status === 429 ||
				response.status === 503
			) {
				continue;
			}
			throw lastError;
		}

		const data = (await response.json()) as {
			candidates?: Array<{
				content?: { parts?: Array<{ text?: string }> };
			}>;
		};

		const text = data.candidates?.[0]?.content?.parts
			?.map((p) => p.text ?? "")
			.join("")
			.trim();

		if (!text) {
			lastError = new Error(`Gemini (${modelName}) returned an empty response`);
			continue;
		}

		return stripJsonFences(text);
	}

	throw lastError ?? new Error("All Gemini models failed");
}

async function generateJsonCompletion(
	systemPrompt: string,
	userPrompt: string,
	temperature: number,
): Promise<string> {
	const googleApiKey =
		process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

	if (googleApiKey) {
		return callGeminiNative(googleApiKey, systemPrompt, userPrompt, temperature);
	}

	const { client, model } = getAIClientConfig();
	const completion = await client.chat.completions.create({
		model,
		response_format: { type: "json_object" },
		temperature,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
	});

	const content = completion.choices[0]?.message?.content;
	if (!content) {
		throw new Error("AI returned an empty response");
	}

	return stripJsonFences(content);
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
	const content = await generateJsonCompletion(
		getSystemPrompt(mode),
		getUserPrompt(code, language),
		mode === "roast" ? 0.8 : 0.5,
	);

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
	const content = await generateJsonCompletion(
		"You are a senior software engineer that writes practical and safe refactors.",
		getImprovementPrompt(code, language, feedback),
		0.3,
	);

	const parsedJson = JSON.parse(content) as unknown;
	const parsed = aiImprovementSchema.parse(parsedJson);

	return {
		summary: parsed.summary,
		suggestions: parsed.suggestions,
		improvedCode: parsed.improvedCode,
	};
}

export { getActiveModel };
