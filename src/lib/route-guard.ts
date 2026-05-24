import "server-only";
import { notFound, redirect } from "next/navigation";
import { getForOwner } from "./projects-repo";
import { readSession } from "./session";

/**
 * Server-side gate for owner-only routes (/dashboard/[id]/*, /builder/[id],
 * /preview/[id]/*). Renders the auth screen for unauthenticated visitors
 * and a generic 404 for anyone trying to peek at a project that isn't
 * theirs — never the real chrome of someone else's site.
 *
 * Returns the resolved ownerId so callers can pass it down if needed.
 */
export async function requireProjectOwner(projectId: string): Promise<{
  ownerId: string;
}> {
  const session = await readSession();
  if (!session) {
    redirect("/templates?auth=open");
  }
  const project = await getForOwner(session.userId, projectId);
  if (!project) {
    notFound();
  }
  return { ownerId: session.userId };
}
