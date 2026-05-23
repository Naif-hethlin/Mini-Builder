// Visits — light analytics for the dashboard. Pages and /sites/* routes
// ping `/api/visits` with the project id; we record path / OS / device
// guessed from the UA. The dashboard aggregates these into "total visits,
// this month, top OS, top device, last 14 days spark."
//
// No IP, no fingerprint, no session id — just the bucket counters the
// owner needs to see traffic. Anonymous by design.

import { ensureMigrated } from "./migrations";
import { query } from "./db";

export async function recordVisit(input: {
  projectId: string;
  path: string;
  userAgent: string | null;
  referrer: string | null;
}): Promise<void> {
  await ensureMigrated();
  const { os, device } = parseUserAgent(input.userAgent ?? "");
  await query(
    `INSERT INTO visits (project_id, path, os, device, referrer)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.projectId,
      input.path.slice(0, 256),
      os,
      device,
      input.referrer?.slice(0, 256) ?? null,
    ],
  );
}

export type VisitMetrics = {
  totalVisits: number;
  visitsThisMonth: number;
  visitsLast24h: number;
  spark14: number[]; // last 14 days, oldest → newest
  topOs: Array<{ os: string; count: number }>;
  topDevice: Array<{ device: string; count: number }>;
};

export async function metricsForProject(
  projectId: string,
): Promise<VisitMetrics> {
  await ensureMigrated();

  const [totalRow, monthRow, dayRow, sparkRows, osRows, deviceRows] =
    await Promise.all([
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM visits WHERE project_id = $1`,
        [projectId],
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM visits
         WHERE project_id = $1
           AND created_at >= date_trunc('month', NOW())`,
        [projectId],
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM visits
         WHERE project_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
        [projectId],
      ),
      // 14-day series, gap-filled with zeros via a generated date range so
      // the spark doesn't collapse when a day is empty.
      query<{ day: string; count: string }>(
        `WITH days AS (
           SELECT generate_series(
             date_trunc('day', NOW()) - INTERVAL '13 days',
             date_trunc('day', NOW()),
             INTERVAL '1 day'
           )::date AS day
         )
         SELECT days.day::text AS day, COUNT(visits.id)::text AS count
         FROM days
         LEFT JOIN visits
           ON visits.project_id = $1
           AND date_trunc('day', visits.created_at) = days.day
         GROUP BY days.day
         ORDER BY days.day ASC`,
        [projectId],
      ),
      query<{ os: string | null; count: string }>(
        `SELECT os, COUNT(*)::text AS count
         FROM visits
         WHERE project_id = $1
         GROUP BY os
         ORDER BY count DESC
         LIMIT 5`,
        [projectId],
      ),
      query<{ device: string | null; count: string }>(
        `SELECT device, COUNT(*)::text AS count
         FROM visits
         WHERE project_id = $1
         GROUP BY device
         ORDER BY count DESC
         LIMIT 5`,
        [projectId],
      ),
    ]);

  return {
    totalVisits: Number(totalRow.rows[0]?.count ?? 0),
    visitsThisMonth: Number(monthRow.rows[0]?.count ?? 0),
    visitsLast24h: Number(dayRow.rows[0]?.count ?? 0),
    spark14: sparkRows.rows.map((r) => Number(r.count)),
    topOs: osRows.rows
      .filter((r) => r.os)
      .map((r) => ({ os: r.os as string, count: Number(r.count) })),
    topDevice: deviceRows.rows
      .filter((r) => r.device)
      .map((r) => ({ device: r.device as string, count: Number(r.count) })),
  };
}

// =============================================================================
// UA parsing — kept inline; we only need the top buckets the dashboard
// surfaces. Full UA-parser library would be overkill for "iOS / Android /
// Windows / Mac / Linux / Other".
// =============================================================================
function parseUserAgent(ua: string): {
  os: string;
  device: "mobile" | "tablet" | "desktop";
} {
  const lower = ua.toLowerCase();

  let os = "Other";
  if (/iphone|ipad|ipod|ios/.test(lower)) os = "iOS";
  else if (/android/.test(lower)) os = "Android";
  else if (/windows/.test(lower)) os = "Windows";
  else if (/mac os x|macintosh/.test(lower)) os = "macOS";
  else if (/linux/.test(lower)) os = "Linux";

  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (/ipad|tablet/.test(lower)) device = "tablet";
  else if (/mobile|iphone|android(?!.*tablet)/.test(lower)) device = "mobile";

  return { os, device };
}
