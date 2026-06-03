import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow loading the dev server from the LAN IP (e.g. testing on a
  // phone), not just localhost. Next 16 blocks /_next/* dev resources from other
  // origins by default; when blocked, client JS can't hydrate and the page shows
  // only its non-animated parts (the motion/Reveal sections stay at opacity:0).
  // Add any host you open the dev server from here. No effect on production.
  allowedDevOrigins: ["192.168.1.126"],
  experimental: {
    proxyClientMaxBodySize: "55mb",
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
