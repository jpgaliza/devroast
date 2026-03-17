function normalizeUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return new URL(normalizeUrl(configuredUrl));
  }

  return new URL("http://localhost:3000");
}

export function getAbsoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}