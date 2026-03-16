import "server-only";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "@/db";

export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  return {
    db,
    headers: opts?.req.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
