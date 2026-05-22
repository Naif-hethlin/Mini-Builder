import type { MetadataRoute } from "next";

const SITE = "https://builder.naifhub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Public-facing surfaces — landing, templates picker, and published
        // sites.
        allow: ["/", "/templates", "/sites"],
        // Builder / dashboard / preview are gated by auth; keep them out
        // of search index.
        disallow: ["/builder", "/dashboard", "/preview", "/api"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
