import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { listForOwner } from "@/lib/projects-repo";
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

  // Returning the most-recent project's id lets the client route
  // straight to /dashboard/<id> on login. listForOwner is already
  // ordered by updated_at DESC.
  const projects = await listForOwner(result.user.id);
  const projectId = projects[0]?.id ?? null;

  return NextResponse.json({ ok: true, user: result.user, projectId });
}
