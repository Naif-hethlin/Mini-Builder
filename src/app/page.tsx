// Root route: /
// For now we redirect to /web-builder. Later we may turn this into a landing
// page that markets the builder before sending users in.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/web-builder");
}
