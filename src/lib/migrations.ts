import "server-only";
import { query } from "./db";

/**
 * Idempotent schema setup. Runs on first DB access. Re-running is safe.
 *
 * Auth model: signup = phone + name. Login = phone only.
 * No password, no email, no recovery — explicit user spec.
 */
const SCHEMA = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,

  // ---- users table (target shape; nullable cols + ALTERs below handle
  //      upgrading from the earlier username/password_hash schema).
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Forward migration: add the new cols if the table was created with
  // the old shape, backfill, drop old cols, then enforce NOT NULL + UNIQUE.
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`,
  // Only attempt to backfill from `username` if that legacy column still
  // exists — on fresh DBs (or after a prior migration ran) it doesn't,
  // and referencing it would throw.
  `DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'username'
     ) THEN
       UPDATE users
         SET phone = COALESCE(phone, username, id::text),
             name  = COALESCE(name, username, 'user')
         WHERE phone IS NULL OR name IS NULL;
     ELSE
       UPDATE users
         SET phone = COALESCE(phone, id::text),
             name  = COALESCE(name, 'user')
         WHERE phone IS NULL OR name IS NULL;
     END IF;
   END $$;`,
  `ALTER TABLE users DROP COLUMN IF EXISTS username;`,
  `ALTER TABLE users DROP COLUMN IF EXISTS password_hash;`,
  `DO $$ BEGIN
     ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
   EXCEPTION WHEN others THEN NULL; END $$;`,
  `DO $$ BEGIN
     ALTER TABLE users ALTER COLUMN name SET NOT NULL;
   EXCEPTION WHEN others THEN NULL; END $$;`,
  `DO $$ BEGIN
     ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
   EXCEPTION WHEN others THEN NULL; END $$;`,

  // Re-canonicalize legacy phones to the Saudi local form (05xxxxxxxx).
  // Done in SQL so the migration is self-contained and idempotent.
  //
  // If a row's canonical form would collide with another existing row,
  // we leave that row alone — we never auto-merge two accounts since
  // that would silently re-parent the wrong user's projects.
  `CREATE OR REPLACE FUNCTION rekaz_canon_phone(p TEXT) RETURNS TEXT AS $func$
   DECLARE d TEXT;
   BEGIN
     d := regexp_replace(COALESCE(p, ''), '[^0-9]', '', 'g');
     IF left(d, 2) = '00' THEN d := substring(d FROM 3); END IF;
     IF left(d, 3) = '966' AND length(d) >= 11 THEN d := substring(d FROM 4); END IF;
     IF length(d) = 9 AND left(d, 1) = '5' THEN d := '0' || d; END IF;
     RETURN d;
   END;
   $func$ LANGUAGE plpgsql IMMUTABLE;`,
  `UPDATE users u
     SET phone = rekaz_canon_phone(u.phone)
   WHERE u.phone IS NOT NULL
     AND u.phone <> rekaz_canon_phone(u.phone)
     AND NOT EXISTS (
       SELECT 1 FROM users u2
       WHERE u2.id <> u.id
         AND u2.phone = rekaz_canon_phone(u.phone)
     );`,

  // ---- projects ----
  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Publishing — slug is the public URL piece (/sites/<slug>). Unique
  // across all projects when set; NULL when the project hasn't been
  // published yet.
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE;`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;`,
  `DO $$ BEGIN
     ALTER TABLE projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);
   EXCEPTION WHEN others THEN NULL; END $$;`,
  `CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    "order" INT NOT NULL DEFAULT 0,
    is_home BOOLEAN NOT NULL DEFAULT FALSE,
    design JSONB NOT NULL DEFAULT '{"version":1,"sections":[]}'::JSONB,
    UNIQUE (project_id, slug)
  );`,
  `CREATE INDEX IF NOT EXISTS pages_project_idx ON pages(project_id);`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    staff_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE INDEX IF NOT EXISTS bookings_project_idx ON bookings(project_id);`,

  // Lightweight visit log — one row per page view (preview + published).
  // No PII: we keep only the project id, the path bucket, a coarse device
  // tag derived from the UA, and the day. Enough for the dashboard
  // "visits / OS / device" stats, nothing more.
  `CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    os TEXT,
    device TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE INDEX IF NOT EXISTS visits_project_day_idx ON visits(project_id, created_at);`,

  // visitor_hash = SHA-256(ip + daily-rotated-salt). Stored opaquely so
  // the raw IP never lands in the DB. Lets us:
  //   - COUNT(DISTINCT visitor_hash) for the "unique visitors" stat
  //   - skip inserting a duplicate row when the same hash visited the
  //     same project within the last 30 minutes (refresh-spam guard)
  `ALTER TABLE visits ADD COLUMN IF NOT EXISTS visitor_hash TEXT;`,
  `CREATE INDEX IF NOT EXISTS visits_project_hash_idx
     ON visits(project_id, visitor_hash, created_at);`,
];

let migrationsRan = false;

export async function ensureMigrated(): Promise<void> {
  if (migrationsRan) return;
  for (const stmt of SCHEMA) {
    await query(stmt);
  }
  migrationsRan = true;
}
