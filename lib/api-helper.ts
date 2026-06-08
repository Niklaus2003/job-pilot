export function getBackendUrl(path: string): string {
  // Read the environment variable. It must start with NEXT_PUBLIC_ to be visible in the browser.
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${path}`;
}
