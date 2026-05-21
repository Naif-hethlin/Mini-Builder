// Route: /web-builder
//
// This file is a Server Component (no "use client" directive). It does no
// interactive work itself — it just imports the Builder component, which
// declares "use client" and contains all the interactive UI.
//
// This pattern (server-component page + client-component subtree) is what
// makes the builder SSR-friendly: the HTML shell is server-rendered, the
// interactive bits hydrate after.

import { Builder } from "./_front/Builder";

export const metadata = {
  title: "Mini Website Builder",
  description: "Build your website by clicking, dragging, and editing — no code.",
};

export default function WebBuilderPage() {
  return <Builder />;
}
