import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { createForOwner, listForOwner } from "@/lib/projects-repo";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const projects = await listForOwner(session.userId);
  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { name?: string; templateType?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const templateType =
    body.templateType === "barber" ||
    body.templateType === "coffee" ||
    body.templateType === "photography"
      ? body.templateType
      : undefined;
  const project = await createForOwner(session.userId, {
    name: body.name,
    templateType,
  });
  return NextResponse.json({ ok: true, project });
}
