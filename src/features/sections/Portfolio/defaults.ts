import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createPortfolio(): Section {
  return {
    id: newId(),
    type: "portfolio",
    props: {
      title: "أعمالنا",
      subtitle: "لمحة من مشاريعنا الأخيرة",
      columns: 3,
      items: Array.from({ length: 6 }, (_, i) => ({
        id: newId(),
        imageUrl: "",
        title: `مشروع ${i + 1}`,
        category: "تصوير",
      })),
    },
  };
}
