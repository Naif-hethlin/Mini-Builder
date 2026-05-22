import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import {
  deleteForOwner,
  getForOwner,
  renameForOwner,
} from "@/lib/projects-repo";

async function requireUser() {
  const session = await readSession();
  if (!session) return null;
  return session;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const project = await getForOwner(session.userId, id);
  if (!project)
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, project });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (typeof body.name === "string" && body.name.trim()) {
    const ok = await renameForOwner(session.userId, id, body.name.trim());
    if (!ok)
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await deleteForOwner(session.userId, id);
  if (!ok)
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
