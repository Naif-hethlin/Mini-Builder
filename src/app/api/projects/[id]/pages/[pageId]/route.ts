import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import {
  deletePageForOwner,
  updatePageDesignForOwner,
} from "@/lib/projects-repo";
import type { PageDesign } from "@/features/builder/state/types";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; pageId: string }> },
) {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id, pageId } = await ctx.params;
  let body: { design?: PageDesign };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (!body.design || typeof body.design !== "object") {
    return NextResponse.json(
      { ok: false, error: "design missing" },
      { status: 400 },
    );
  }
  const ok = await updatePageDesignForOwner(
    session.userId,
    id,
    pageId,
    body.design,
  );
  if (!ok)
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; pageId: string }> },
) {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id, pageId } = await ctx.params;
  const result = await deletePageForOwner(session.userId, id, pageId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
