import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بيانات غير صحيحة" },
      { status: 400 },
    );
  }
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  const result = await login(username, password);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  await setSession(result.user.id);
  return NextResponse.json({ ok: true, user: result.user });
}
