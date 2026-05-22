import "server-only";
import { Pool } from "pg";

declare global {
  // Allow a singleton across Next.js hot reloads in dev.
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] DATABASE_URL is not set. Auth/DB features will fail until it's provided.",
  );
}

export const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString,
    // Conservative pool — the app is light-traffic and Postgres is on the
    // same host. Avoid leaking too many connections during dev hot reloads.
    max: 5,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

/**
 * Convenience tagged-query helper. Use as:
 *
 *   const { rows } = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
 */
export async function query<T = unknown>(
  text: string,
  params: unknown[] = [],
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await pool.query(text, params);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0,
  };
}
