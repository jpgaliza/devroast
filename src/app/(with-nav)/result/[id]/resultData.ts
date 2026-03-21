import { cache } from "react";
import { getTRPCCaller } from "@/trpc/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getRoastResultById = cache(async (id: string) => {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }

  const caller = await getTRPCCaller();
  return caller.roast.getById({ id }).catch(() => null);
});

export function getRoastCanonicalPath(id: string) {
  return `/result/${id}`;
}

export function getRoastSharePath(id: string) {
  return `/result/${id}/share`;
}

export function getRoastOgImagePath(id: string) {
  return `/result/${id}/opengraph-image`;
}

export function formatVerdictLabel(verdict: string) {
  return verdict.replaceAll("_", " ");
}