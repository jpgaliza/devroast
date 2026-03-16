import "server-only";

import { cache } from "react";
import { createTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc/routers/_app";

export const getTRPCCaller = cache(async () => {
  const context = await createTRPCContext();
  return appRouter.createCaller(context);
});
