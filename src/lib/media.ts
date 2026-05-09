/**
 * URLs públicas dos assets quando `NEXT_PUBLIC_MEDIA_URL` aponta para o Railway Bucket
 * (ou outro CDN). Paths relativos (`/videos/...`) ficam relativos ao site se a variável
 * não estiver definida (desenvolvimento / deploy só com `public/`).
 */
export function mediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const base = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "").trim();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return base ? `${base}${path}` : path;
}
