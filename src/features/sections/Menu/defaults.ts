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
          imageUrl:
            "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
        },
        {
          id: newId(),
          name: "لاتيه فانيلا",
          description: "لاتيه ناعم بنكهة الفانيلا الطبيعية.",
          price: "22",
          imageUrl:
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80",
        },
        {
          id: newId(),
          name: "كرواسون بالشوكولاتة",
          description: "مخبوز يوميًا، مع حشوة شوكولاتة.",
          price: "14",
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
        },
        {
          id: newId(),
          name: "كيك الجزر",
          description: "قطعة مع كريمة الجبن.",
          price: "20",
          imageUrl:
            "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80",
        },
      ],
    },
  };
}
