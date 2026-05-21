// Route: /templates
//
// Blueprint-style starter picker. Toggles between two workspaces:
//   - "fresh"     → freeform blueprint canvas + element toolbox.
//   - "templates" → preset starter cards (barber / coffee / photography).
//
// Selecting any path creates a project in localStorage and routes into
// /builder/[id].

import { BlueprintBuilder } from "./_front/BlueprintBuilder";

export const metadata = {
  title: "اختر بداية — ركاز",
  description:
    "ابدأ من الصفر أو اختر قالبًا جاهزًا (حلاق، مقهى، مصور) لإطلاق موقعك.",
};

export default function TemplatesPage() {
  return <BlueprintBuilder />;
}
