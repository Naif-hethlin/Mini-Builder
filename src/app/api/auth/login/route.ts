import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بيانات غير صحيحة" },
      { status: 400 },
    );
  }
  const phone = String(body.phone ?? "");

  const result = await login(phone);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  await setSession(result.user.id);
  return NextResponse.json({ ok: true, user: result.user });
}
