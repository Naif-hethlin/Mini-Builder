// POST /api/visits — beacon endpoint. Anonymous, no auth required: any
// visitor on /sites/<slug> or /preview/<id> can ping it. Body is a small
// JSON payload with the project id and the route they're on. We record
// the visit silently and return 204.
//
// The recording fans out via recordVisit() which derives OS/device from
// the request's UA header server-side (more reliable + no PII reaches
// the browser). Errors are swallowed: analytics dropping a row must
// never break a live site.

import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visits-repo";

export async function POST(req: Request) {
  let body: { projectId?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : null;
  const path = typeof body.path === "string" ? body.path : "/";
  if (!projectId) return new NextResponse(null, { status: 400 });

  try {
    await recordVisit({
      projectId,
      path,
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
    });
  } catch {
    // analytics dropping is non-fatal
  }
  return new NextResponse(null, { status: 204 });
}
