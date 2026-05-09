import type { NextConfig } from "next";

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
