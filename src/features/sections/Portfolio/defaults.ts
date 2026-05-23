import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

// Photography / studio sample work — keeps the default portfolio
// looking real instead of a wall of grey placeholders.
const SAMPLE_WORK = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    title: "موقع شركة تقنية",
    category: "تطوير",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&q=80",
    title: "هوية بصرية لمقهى",
    category: "تصميم",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80",
    title: "متجر إلكتروني",
    category: "تطوير",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
    title: "كتاب صور",
    category: "تصوير",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?w=800&q=80",
    title: "حملة سوشيال",
    category: "تسويق",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=800&q=80",
    title: "تصوير منتجات",
    category: "تصوير",
  },
];

export function createPortfolio(): Section {
  return {
    id: newId(),
    type: "portfolio",
    props: {
      title: "أعمالنا",
      subtitle: "لمحة من مشاريعنا الأخيرة",
      columns: 3,
      items: SAMPLE_WORK.map((w) => ({
        id: newId(),
        ...w,
      })),
    },
  };
}
