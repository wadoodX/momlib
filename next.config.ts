import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow loading the dev server from extra origins (e.g. a phone on the
  // LAN), not just localhost. Next 16 blocks /_next/* dev resources from non-
  // allowlisted origins, which leaves client JS unhydrated. Set DEV_ORIGINS in
  // .env.local (comma-separated hosts/IPs, e.g. DEV_ORIGINS=192.168.1.42). No
  // effect on production; localhost is always allowed.
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
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
