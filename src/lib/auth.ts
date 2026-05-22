import "server-only";
import bcrypt from "bcryptjs";
import { query } from "./db";
import { ensureMigrated } from "./migrations";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;
const MIN_PASSWORD = 6;

export type AuthUser = {
  id: string;
  username: string;
  created_at: string;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateCredentials(
  username: string,
  password: string,
): string | null {
  if (!USERNAME_RE.test(username))
    return "اسم المستخدم 3–32 خانة (أحرف لاتينية، أرقام، _ . -)";
  if (password.length < MIN_PASSWORD)
    return `كلمة المرور ${MIN_PASSWORD} خانات على الأقل`;
  return null;
}

export async function signup(
  rawUsername: string,
  password: string,
): Promise<AuthResult> {
  await ensureMigrated();
  const username = normalizeUsername(rawUsername);
  const err = validateCredentials(username, password);
  if (err) return { ok: false, error: err };

  const exists = await query<{ id: string }>(
    "SELECT id FROM users WHERE username = $1 LIMIT 1",
    [username],
  );
  if (exists.rowCount > 0) {
    return { ok: false, error: "اسم المستخدم مستخدم بالفعل" };
  }

  const hash = await bcrypt.hash(password, 10);
  const insert = await query<AuthUser>(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
    [username, hash],
  );
  return { ok: true, user: insert.rows[0] };
}

export async function login(
  rawUsername: string,
  password: string,
): Promise<AuthResult> {
  await ensureMigrated();
  const username = normalizeUsername(rawUsername);
  if (!USERNAME_RE.test(username) || password.length < MIN_PASSWORD) {
    return { ok: false, error: "بيانات الدخول غير صحيحة" };
  }

  const result = await query<{
    id: string;
    username: string;
    password_hash: string;
    created_at: string;
  }>(
    "SELECT id, username, password_hash, created_at FROM users WHERE username = $1 LIMIT 1",
    [username],
  );
  if (result.rowCount === 0) {
    return { ok: false, error: "بيانات الدخول غير صحيحة" };
  }
  const row = result.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return { ok: false, error: "بيانات الدخول غير صحيحة" };
  return {
    ok: true,
    user: {
      id: row.id,
      username: row.username,
      created_at: row.created_at,
    },
  };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  await ensureMigrated();
  const result = await query<AuthUser>(
    "SELECT id, username, created_at FROM users WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rows[0] ?? null;
}
