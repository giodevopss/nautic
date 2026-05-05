export function getPublicApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (base) return base;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3001";
  }
  return "";
}
