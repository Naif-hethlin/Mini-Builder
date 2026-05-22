// Route: /templates
//
// Blueprint-style starter picker with an auth overlay stacked on top.
// First-time visitors get the login/signup card; signed-in users (or
// those who picked "browse without login") see the BlueprintBuilder
// directly.

import { Suspense } from "react";
import { Toaster } from "sonner";
import { AuthOverlay } from "@/features/auth/AuthOverlay";
import { BuilderShowcase } from "./_front/BuilderShowcase";

export const metadata = {
  title: "اختر بداية — ركاز",
  description:
    "ابدأ من الصفر أو اختر قالبًا جاهزًا (حلاق، مقهى، مصور) لإطلاق موقعك.",
};

// AuthOverlay reads useSearchParams (for ?auth=open from the /login
// redirect), which forces dynamic rendering. Skip the prerender entirely.
export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  return (
    <>
      <BuilderShowcase />
      <Suspense fallback={null}>
        <AuthOverlay />
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
