import "server-only";
import type { MetadataRoute } from "next";
import { query } from "@/lib/db";
import { ensureMigrated } from "@/lib/migrations";

const SITE = "https://builder.naifhub.com";

type PublishedRow = {
  slug: string;
  updated_at: Date;
  page_slug: string;
  is_home: boolean;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static surfaces
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/templates`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Published-site pages — fetched directly from Postgres so the sitemap
  // reflects what's actually live without a separate cron.
  try {
    await ensureMigrated();
    const { rows } = await query<PublishedRow>(
      `SELECT pr.slug AS slug, pr.updated_at AS updated_at,
              pg.slug AS page_slug, pg.is_home AS is_home
         FROM projects pr
         JOIN pages pg ON pg.project_id = pr.id
        WHERE pr.published = TRUE AND pr.slug IS NOT NULL`,
    );
    for (const r of rows) {
      const url = r.is_home
        ? `${SITE}/sites/${r.slug}`
        : `${SITE}/sites/${r.slug}/${r.page_slug}`;
      entries.push({
        url,
        lastModified: r.updated_at,
        changeFrequency: "weekly",
        priority: r.is_home ? 0.8 : 0.5,
      });
    }
  } catch {
    // If DB is unavailable, still return the static entries.
  }

  return entries;
}
