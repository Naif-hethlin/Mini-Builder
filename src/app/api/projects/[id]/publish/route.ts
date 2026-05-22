import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import {
  publishForOwner,
  unpublishForOwner,
} from "@/lib/projects-repo";

// POST /api/projects/[id]/publish — body { slug }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  const { id } = await ctx.params;

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }
  if (typeof body.slug !== "string" || !body.slug.trim()) {
    return NextResponse.json(
      { ok: false, error: "slug_required" },
      { status: 400 },
    );
  }

  const result = await publishForOwner(session.userId, id, body.slug);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, project: result.project });
}

// DELETE /api/projects/[id]/publish — takes the project offline.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  const { id } = await ctx.params;
  const ok = await unpublishForOwner(session.userId, id);
  if (!ok)
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}
