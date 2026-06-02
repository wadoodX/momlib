import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nibras.app";

// Only the public, indexable pages. The signed-in app (courses, dashboard,
// admin, settings, search) is auth-gated and intentionally left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/login`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
