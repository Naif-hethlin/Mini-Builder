import { NextResponse } from "next/server";
import { signup } from "@/lib/auth";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { phone?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بيانات غير صحيحة" },
      { status: 400 },
    );
  }
  const phone = String(body.phone ?? "");
  const name = String(body.name ?? "");

  const result = await signup(phone, name);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  await setSession(result.user.id);
  return NextResponse.json({ ok: true, user: result.user });
}
