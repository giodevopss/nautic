import type { NextConfig } from "next";

const apiUpstream =
  process.env.API_UPSTREAM_URL?.trim().replace(/\/$/, "") ?? "";

function mediaRemotePattern():
  | { protocol: "http" | "https"; hostname: string }
  | undefined {
  const raw = process.env.NEXT_PUBLIC_MEDIA_URL?.trim();
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (!u.hostname) return undefined;
    return {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
    };
  } catch {
    return undefined;
  }
}

const mediaPattern = mediaRemotePattern();

const nextConfig: NextConfig = {
  env: {
    /** Injetado no cliente no build quando existe proxy /api */
    NEXT_PUBLIC_API_SAME_ORIGIN: apiUpstream ? "1" : "",
  },
  async rewrites() {
    if (!apiUpstream) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiUpstream}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      ...(mediaPattern ? [mediaPattern] : []),
    ],
  },
};

export default nextConfig;
