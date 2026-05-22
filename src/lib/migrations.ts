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

  // ---- projects ----
  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
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
];

let migrationsRan = false;

export async function ensureMigrated(): Promise<void> {
  if (migrationsRan) return;
  for (const stmt of SCHEMA) {
    await query(stmt);
  }
  migrationsRan = true;
}
