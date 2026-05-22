// Route: /templates
//
// Blueprint-style starter picker with an auth overlay stacked on top.
// First-time visitors get the login/signup card; signed-in users (or
// those who picked "browse without login") see the BlueprintBuilder
// directly.

import { Toaster } from "sonner";
import { AuthOverlay } from "@/features/auth/AuthOverlay";
import { BlueprintBuilder } from "./_front/BlueprintBuilder";

export const metadata = {
  title: "اختر بداية — ركاز",
  description:
    "ابدأ من الصفر أو اختر قالبًا جاهزًا (حلاق، مقهى، مصور) لإطلاق موقعك.",
};

export default function TemplatesPage() {
  return (
    <>
      <BlueprintBuilder />
      <AuthOverlay />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={3000}
      />
    </>
  );
}
