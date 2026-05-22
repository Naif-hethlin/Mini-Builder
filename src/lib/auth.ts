import "server-only";
import { query } from "./db";
import { ensureMigrated } from "./migrations";

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  created_at: string;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

/** Normalize Arabic-Indic digits and strip everything that isn't a digit
 *  or a leading +. Stores phones in a canonical form so the same number
 *  written different ways still matches. */
function normalizePhone(raw: string): string {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const trimmed = raw.trim();
  let out = "";
  for (const ch of trimmed) {
    const ai = arabicDigits.indexOf(ch);
    if (ai !== -1) out += String(ai);
    else if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === "+" && out === "") out += ch;
  }
  return out;
}

function isValidPhone(p: string): boolean {
  // Accept 8–15 digits (E.164 max is 15). Optional leading +.
  return /^\+?\d{8,15}$/.test(p);
}

export async function signup(
  rawPhone: string,
  rawName: string,
): Promise<AuthResult> {
  await ensureMigrated();
  const phone = normalizePhone(rawPhone);
  const name = rawName.trim();
  if (!isValidPhone(phone)) {
    return { ok: false, error: "رقم الهاتف غير صالح" };
  }
  if (name.length < 2) {
    return { ok: false, error: "الاسم قصير جدًا" };
  }

  const exists = await query<{ id: string }>(
    "SELECT id FROM users WHERE phone = $1 LIMIT 1",
    [phone],
  );
  if (exists.rowCount > 0) {
    return {
      ok: false,
      error: "رقم الهاتف مسجّل بالفعل — استخدم تسجيل الدخول",
    };
  }

  const insert = await query<AuthUser>(
    "INSERT INTO users (phone, name) VALUES ($1, $2) RETURNING id, phone, name, created_at",
    [phone, name],
  );
  return { ok: true, user: insert.rows[0] };
}

/** Login by phone alone — per user spec. No password / OTP / secret. */
export async function login(rawPhone: string): Promise<AuthResult> {
  await ensureMigrated();
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return { ok: false, error: "رقم الهاتف غير صالح" };
  }
  const result = await query<AuthUser>(
    "SELECT id, phone, name, created_at FROM users WHERE phone = $1 LIMIT 1",
    [phone],
  );
  if (result.rowCount === 0) {
    return {
      ok: false,
      error: "ما نلقى حساب بهذا الرقم — جرّب إنشاء حساب",
    };
  }
  return { ok: true, user: result.rows[0] };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  await ensureMigrated();
  const result = await query<AuthUser>(
    "SELECT id, phone, name, created_at FROM users WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rows[0] ?? null;
}
