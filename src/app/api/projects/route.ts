import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import {
  createForOwner,
  getForOwner,
  listForOwner,
} from "@/lib/projects-repo";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const projects = await listForOwner(session.userId);
  return NextResponse.json({ ok: true, projects });
}

// One project per user — POST is idempotent. If the user already owns a
// project, return it instead of creating a second one. The product is a
// single-site builder, not a multi-project workspace.
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const existing = await listForOwner(session.userId);
  if (existing.length > 0) {
    const full = await getForOwner(session.userId, existing[0].id);
    if (full) {
      return NextResponse.json({ ok: true, project: full, existing: true });
    }
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
  return NextResponse.json({ ok: true, project, existing: false });
}
