import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// This module must only be imported in Server Components, Server Actions,
// and Route Handlers — never in Client Components.
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle({ client, casing: "snake_case" });
