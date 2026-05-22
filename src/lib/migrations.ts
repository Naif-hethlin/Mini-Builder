import "server-only";
import { query } from "./db";

/**
 * Idempotent schema setup. Runs on first DB access (see ensureMigrated).
 * Add new tables / columns here using CREATE … IF NOT EXISTS or ALTER …
 * IF NOT EXISTS so re-running is always safe.
 */
const SCHEMA = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
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
