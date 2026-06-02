import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nibras.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the auth-gated app out of the index (these redirect to /login anyway).
      disallow: ["/admin", "/dashboard", "/settings", "/search", "/courses", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
