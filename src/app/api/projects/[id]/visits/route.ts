// GET /api/projects/[id]/visits — owner-only analytics summary. Returns
// totals, 14-day spark, top OS, top device. The dashboard's Overview
// and Website tabs call this to populate stat cards.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getForOwner } from "@/lib/projects-repo";
import { metricsForProject } from "@/lib/visits-repo";

export async function GET(
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
  // Ownership check — don't leak traffic numbers from other accounts.
  const project = await getForOwner(session.userId, id);
  if (!project)
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );

  const metrics = await metricsForProject(id);
  return NextResponse.json({ ok: true, metrics });
}
