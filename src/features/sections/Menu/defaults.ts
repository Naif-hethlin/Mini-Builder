import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createMenu(): Section {
  return {
    id: newId(),
    type: "menu",
    props: {
      title: "قائمة الطعام",
      subtitle: "أصناف اخترناها لك بعناية",
      currency: "ر.س",
      columns: 2,
      items: [
        {
          id: newId(),
          name: "كابتشينو",
          description: "إسبريسو مزدوج مع حليب مخفوق.",
          price: "18",
          imageUrl: "",
        },
        {
          id: newId(),
          name: "لاتيه فانيلا",
          description: "لاتيه ناعم بنكهة الفانيلا الطبيعية.",
          price: "22",
          imageUrl: "",
        },
        {
          id: newId(),
          name: "كرواسون بالشوكولاتة",
          description: "مخبوز يوميًا، مع حشوة شوكولاتة.",
          price: "14",
          imageUrl: "",
        },
        {
          id: newId(),
          name: "كيك الجزر",
          description: "قطعة مع كريمة الجبن.",
          price: "20",
          imageUrl: "",
        },
      ],
    },
  };
}
