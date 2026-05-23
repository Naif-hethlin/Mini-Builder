import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

// Curated Unsplash photos — work / studio / café vibes so the default
// gallery doesn't render as empty placeholders.
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80",
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
];

export function createGallery(): Section {
  return {
    id: newId(),
    type: "gallery",
    props: {
      title: "معرض الصور",
      subtitle: "لمحة من أعمالنا الأخيرة",
      columns: 3,
      items: SAMPLE_PHOTOS.map((url, i) => ({
        id: newId(),
        url,
        alt: `صورة ${i + 1}`,
      })),
    },
  };
}
