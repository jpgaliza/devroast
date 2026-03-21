import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// This module must only be imported in Server Components, Server Actions,
// and Route Handlers — never in Client Components.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is not configured");
}

const isLocalDatabase =
	databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

const client = postgres(databaseUrl, {
	// Serverless runtimes should keep a tiny pool to avoid exhausting DB connections.
	max: 1,
	prepare: false,
	ssl: isLocalDatabase ? false : "require",
});

export const db = drizzle({ client, casing: "snake_case" });
