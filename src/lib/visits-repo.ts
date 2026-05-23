// Visits — light analytics for the dashboard. Pages and /sites/* routes
// ping `/api/visits` with the project id; we record path / OS / device
// guessed from the UA + a daily-salted hash of the IP so we can compute
// unique visitors without retaining PII.
//
// Dedup: if the same visitor_hash already pinged the same project in
// the last DEDUP_WINDOW, the insert is skipped. This neutralises the
// refresh-spam attack where reloading the page bloats the count.

import { createHash } from "node:crypto";
import { ensureMigrated } from "./migrations";
import { query } from "./db";

const DEDUP_WINDOW_MIN = 30;

/**
 * SHA-256(ip + daily salt). The salt rotates each UTC day so the same
 * IP gets a different hash tomorrow — keeps the hash from being a
 * stable per-person identifier we can correlate across long windows.
 *
 * SESSION_SECRET is already required for cookies; reuse it as the salt
 * base so we don't introduce a new mandatory env var.
 */
function hashIp(ip: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const salt = process.env.SESSION_SECRET ?? "rekaz-fallback-salt";
  return createHash("sha256").update(`${ip}|${salt}|${today}`).digest("hex");
}

export async function recordVisit(input: {
  projectId: string;
  path: string;
  userAgent: string | null;
  referrer: string | null;
  ip: string | null;
}): Promise<void> {
  await ensureMigrated();
  const { os, device } = parseUserAgent(input.userAgent ?? "");
  const visitorHash = input.ip ? hashIp(input.ip) : null;

  // Refresh-spam guard — if the same visitor hit this project recently,
  // don't insert another row. Anonymous visits (no IP) skip the check.
  if (visitorHash) {
    const { rows } = await query<{ exists: boolean }>(
      `SELECT TRUE AS exists
         FROM visits
        WHERE project_id = $1
          AND visitor_hash = $2
          AND created_at >= NOW() - ($3 || ' minutes')::interval
        LIMIT 1`,
      [input.projectId, visitorHash, String(DEDUP_WINDOW_MIN)],
    );
    if (rows.length > 0) return;
  }

  await query(
    `INSERT INTO visits (project_id, path, os, device, referrer, visitor_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.projectId,
      input.path.slice(0, 256),
      os,
      device,
      input.referrer?.slice(0, 256) ?? null,
      visitorHash,
    ],
  );
}

export type VisitMetrics = {
  totalVisits: number;
  visitsThisMonth: number;
  visitsLast24h: number;
  uniqueVisitors: number;
  uniqueVisitorsThisMonth: number;
  spark14: number[]; // last 14 days, oldest → newest
  topOs: Array<{ os: string; count: number }>;
  topDevice: Array<{ device: string; count: number }>;
};

export async function metricsForProject(
  projectId: string,
): Promise<VisitMetrics> {
  await ensureMigrated();

  const [
    totalRow,
    monthRow,
    dayRow,
    uniqRow,
    uniqMonthRow,
    sparkRows,
    osRows,
    deviceRows,
  ] = await Promise.all([
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
    // Unique visitors all-time. visitor_hash is NULL on legacy rows from
    // before the dedup column existed — filter those out so the distinct
    // count isn't inflated by a phantom "unknown" bucket.
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_hash)::text AS count
         FROM visits
        WHERE project_id = $1 AND visitor_hash IS NOT NULL`,
      [projectId],
    ),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT visitor_hash)::text AS count
         FROM visits
        WHERE project_id = $1
          AND visitor_hash IS NOT NULL
          AND created_at >= date_trunc('month', NOW())`,
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
    uniqueVisitors: Number(uniqRow.rows[0]?.count ?? 0),
    uniqueVisitorsThisMonth: Number(uniqMonthRow.rows[0]?.count ?? 0),
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
