const DATABASE_ERROR_CODES = new Set([
  "08001",
  "08006",
  "57P01",
  "57P02",
  "57P03",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
]);

function getErrorChain(error: unknown) {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    chain.push(current);
    seen.add(current);
    current = "cause" in current ? current.cause : null;
  }

  if (typeof error === "string") {
    chain.push(error);
  }

  return chain;
}

function getStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== "object" || !(key in value)) {
    return null;
  }

  const property = value[key as keyof typeof value];
  return typeof property === "string" ? property : null;
}

export function isDatabaseConnectionError(error: unknown) {
  return getErrorChain(error).some((entry) => {
    if (typeof entry === "string") {
      return entry.includes("ECONNREFUSED") || entry.includes("Failed query");
    }

    const code = getStringProperty(entry, "code");
    const message = getStringProperty(entry, "message");

    return (
      (code !== null && DATABASE_ERROR_CODES.has(code)) ||
      message?.includes("ECONNREFUSED") === true ||
      message?.includes("Failed query") === true
    );
  });
}

export function isRateLimitError(error: unknown) {
  return getErrorChain(error).some((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    return "status" in entry && entry.status === 429;
  });
}