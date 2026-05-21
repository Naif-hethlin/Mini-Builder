import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createGallery(): Section {
  return {
    id: newId(),
    type: "gallery",
    props: {
      title: "معرض الصور",
      subtitle: "لمحة من أعمالنا الأخيرة",
      columns: 3,
      items: Array.from({ length: 6 }, () => ({
        id: newId(),
        url: "",
        alt: "صورة",
      })),
    },
  };
}
