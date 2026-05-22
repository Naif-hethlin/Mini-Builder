import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { addPageForOwner } from "@/lib/projects-repo";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const page = await addPageForOwner(session.userId, id, {
    name: body.name,
  });
  if (!page)
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, page });
}
