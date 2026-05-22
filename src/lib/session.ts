import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "rekaz_session";
const SESSION_TTL_DAYS = 30;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET is not set — auth refuses to operate without it.",
    );
  }
  return s;
}

/** HMAC-SHA256 sign with the session secret. Web Crypto is built into Node 18+. */
async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64UrlEncode(new Uint8Array(sig));
}

async function verify(payload: string, signature: string): Promise<boolean> {
  const expected = await sign(payload);
  // Constant-time compare on equal length, else fail.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** Sets the rekaz_session cookie for the given user. */
export async function setSession(userId: string): Promise<void> {
  const expires = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const sig = await sign(payload);
  const value = `${payload}.${sig}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

/** Reads the session cookie. Returns null if missing, expired, or tampered. */
export async function readSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  const value = cookie.value;
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  if (!(await verify(payload, sig))) return null;
  const [userId, expiresStr] = payload.split(".");
  if (!userId || !expiresStr) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  return { userId };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
