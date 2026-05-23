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

/** Canonicalize to the Saudi local-mobile form: 05xxxxxxxx (10 digits,
 *  starts with 05). Accepts +966/00966/966/5xxxx variants and folds
 *  them down to one DB key so the same number written different ways
 *  never creates two accounts.
 *
 *  Rules:
 *   - Arabic-Indic digits → ASCII, strip all non-digits.
 *   - Drop a leading "00" or "+966" prefix.
 *   - If the result is 9 digits starting with "5", re-add the local "0". */
export function normalizePhone(raw: string): string {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let digits = "";
  for (const ch of raw.trim()) {
    const ai = arabicDigits.indexOf(ch);
    if (ai !== -1) digits += String(ai);
    else if (ch >= "0" && ch <= "9") digits += ch;
  }
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("966") && digits.length >= 11) {
    digits = digits.slice(3);
  }
  if (digits.length === 9 && digits.startsWith("5")) {
    digits = "0" + digits;
  }
  return digits;
}

function isValidPhone(p: string): boolean {
  // Saudi mobile: exactly 10 digits starting with 05.
  return /^05\d{8}$/.test(p);
}

const PHONE_FORMAT_ERROR =
  "رقم الجوال لازم يبدأ بـ 05 ويتكوّن من 10 أرقام";

export async function signup(
  rawPhone: string,
  rawName: string,
): Promise<AuthResult> {
  await ensureMigrated();
  const phone = normalizePhone(rawPhone);
  const name = rawName.trim();
  if (!isValidPhone(phone)) {
    return { ok: false, error: PHONE_FORMAT_ERROR };
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
      error: "رقم الجوال مسجّل بالفعل — استخدم تسجيل الدخول",
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
    return { ok: false, error: PHONE_FORMAT_ERROR };
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
