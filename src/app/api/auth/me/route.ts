import { NextResponse } from "next/server";
import { getUserById } from "@/lib/auth";
import { readSession } from "@/lib/session";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const user = await getUserById(session.userId);
  return NextResponse.json({ user });
}
