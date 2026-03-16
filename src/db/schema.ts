import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "tsx",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "bash",
  "json",
  "yaml",
  "html",
  "css",
  "markdown",
  "plaintext",
]);

export const roastModeEnum = pgEnum("roast_mode", [
  "honest", // revisão construtiva
  "roast",  // sarcasmo máximo
]);

export const verdictEnum = pgEnum("verdict", [
  "garbage_fire",       // 0.0 – 2.0
  "needs_serious_help", // 2.1 – 4.0
  "questionable",       // 4.1 – 6.0
  "not_terrible",       // 6.1 – 8.0
  "actually_good",      // 8.1 – 10.0
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Language = (typeof languageEnum.enumValues)[number];
export type RoastMode = (typeof roastModeEnum.enumValues)[number];
export type Verdict = (typeof verdictEnum.enumValues)[number];

export type FeedbackItem = {
  content: string;
  isPositive: boolean;
};

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const submissions = pgTable("submissions", {
  id:         uuid().primaryKey().defaultRandom(),
  code:       text().notNull(),
  language:   languageEnum().notNull().default("plaintext"),
  linesCount: integer().notNull(),
  charCount:  integer().notNull(),
  mode:       roastModeEnum().notNull().default("roast"),
  createdAt:  timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const roasts = pgTable("roasts", {
  id:           uuid().primaryKey().defaultRandom(),
  submissionId: uuid()
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  score:    numeric({ precision: 3, scale: 1 }).notNull(),
  verdict:  verdictEnum().notNull(),
  headline: text().notNull(),
  feedback: jsonb().$type<FeedbackItem[]>().notNull().default([]),
  aiModel:  text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Roast = typeof roasts.$inferSelect;
export type NewRoast = typeof roasts.$inferInsert;
