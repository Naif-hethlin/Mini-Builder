// Route: /templates
//
// Starter picker with the auth overlay stacked on top. We read the session
// cookie SERVER-SIDE so the overlay (or lack thereof) is part of the
// initial HTML — no client-side fetch gap that lets BuilderShowcase flash
// before the overlay covers it on first paint.

import { Suspense } from "react";
import { Toaster } from "sonner";
import { AuthOverlay } from "@/features/auth/AuthOverlay";
import { readSession } from "@/lib/session";
import { BuilderShowcase } from "./_front/BuilderShowcase";

export const metadata = {
  title: "اختر بداية — ركاز",
  description:
    "ابدأ من الصفر أو اختر قالبًا جاهزًا (حلاق، مقهى، مصور) لإطلاق موقعك.",
};

// readSession + AuthOverlay's useSearchParams both force dynamic rendering;
// keep the route off the prerender path.
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await readSession();
  const isAuthed = session !== null;
  return (
    <>
      <BuilderShowcase suspended={!isAuthed} />
      <Suspense fallback={null}>
        <AuthOverlay initialAuthed={isAuthed} />
      </Suspense>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={3000}
      />
    </>
  );
}
