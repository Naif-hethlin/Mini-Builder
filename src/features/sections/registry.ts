import type { ComponentType } from "react";
import type { Section, SectionType } from "@/features/builder/state/types";
import type { FieldSchema } from "./schema/types";

import HeaderThumbnail from "./Header/Thumbnail";
import { createHeader } from "./Header/defaults";
import { headerSchema } from "./Header/schema";

import HeroThumbnail from "./Hero/Thumbnail";
import { createHero } from "./Hero/defaults";
import { heroSchema } from "./Hero/schema";

import FeaturesThumbnail from "./Features/Thumbnail";
import { createFeatures } from "./Features/defaults";
import { featuresSchema } from "./Features/schema";

import CTAThumbnail from "./CTA/Thumbnail";
import { createCTA } from "./CTA/defaults";
import { ctaSchema } from "./CTA/schema";

import FooterThumbnail from "./Footer/Thumbnail";
import { createFooter } from "./Footer/defaults";
import { footerSchema } from "./Footer/schema";

import GalleryThumbnail from "./Gallery/Thumbnail";
import { createGallery } from "./Gallery/defaults";
import { gallerySchema } from "./Gallery/schema";

import TestimonialsThumbnail from "./Testimonials/Thumbnail";
import { createTestimonials } from "./Testimonials/defaults";
import { testimonialsSchema } from "./Testimonials/schema";

import FAQThumbnail from "./FAQ/Thumbnail";
import { createFAQ } from "./FAQ/defaults";
import { faqSchema } from "./FAQ/schema";

import ContactThumbnail from "./Contact/Thumbnail";
import { createContact } from "./Contact/defaults";
import { contactSchema } from "./Contact/schema";

import BookingThumbnail from "./Booking/Thumbnail";
import { createBooking } from "./Booking/defaults";
import { bookingSchema } from "./Booking/schema";

import MenuThumbnail from "./Menu/Thumbnail";
import { createMenu } from "./Menu/defaults";
import { menuSchema } from "./Menu/schema";

import PortfolioThumbnail from "./Portfolio/Thumbnail";
import { createPortfolio } from "./Portfolio/defaults";
import { portfolioSchema } from "./Portfolio/schema";

// =============================================================================
// SECTION REGISTRY
//
// One row per preset section type. Adding a new section type = add one row.
// The Sidebar reads this list to build the library tiles; addSection() reads
// `createDefault()` to produce a fresh section when the user clicks a tile.
// =============================================================================

export type SectionPresetMeta = {
  type: SectionType;
  /** Plain-language name (Arabic) shown under the thumbnail tile. */
  label: string;
  /** Short hint shown on hover (helps non-tech users pick the right one). */
  description: string;
  /** Tiny visual rendered inside the sidebar tile. */
  Thumbnail: ComponentType;
  /** Builds a fresh section instance with a new ID + starter content. */
  createDefault: () => Section;
  /** Form schema describing the section's editable props. */
  schema: FieldSchema[];
};

export const SECTION_PRESETS: SectionPresetMeta[] = [
  {
    type: "header",
    label: "رأس الصفحة",
    description: "شريط علوي يحوي شعارك، روابط التنقل، وزر إجراء.",
    Thumbnail: HeaderThumbnail,
    createDefault: createHeader,
    schema: headerSchema,
  },
  {
    type: "hero",
    label: "البطل",
    description: "بانر كبير في أعلى الصفحة — عنوان، وصف، صورة، وأزرار.",
    Thumbnail: HeroThumbnail,
    createDefault: createHero,
    schema: heroSchema,
  },
  {
    type: "features",
    label: "المزايا",
    description: "شبكة من المزايا مع أيقونات وعناوين وأوصاف.",
    Thumbnail: FeaturesThumbnail,
    createDefault: createFeatures,
    schema: featuresSchema,
  },
  {
    type: "cta",
    label: "دعوة للإجراء",
    description: "بانر بعنوان وزر واحد كبير لتحفيز النقرات.",
    Thumbnail: CTAThumbnail,
    createDefault: createCTA,
    schema: ctaSchema,
  },
  {
    type: "gallery",
    label: "معرض الصور",
    description: "شبكة من الصور (٢ / ٣ / ٤ أعمدة) لعرض أعمالك.",
    Thumbnail: GalleryThumbnail,
    createDefault: createGallery,
    schema: gallerySchema,
  },
  {
    type: "testimonials",
    label: "آراء العملاء",
    description: "بطاقات تقييمات بنجوم وأسماء عملائك.",
    Thumbnail: TestimonialsThumbnail,
    createDefault: createTestimonials,
    schema: testimonialsSchema,
  },
  {
    type: "faq",
    label: "الأسئلة الشائعة",
    description: "أكورديون بأكثر الأسئلة شيوعًا وإجاباتها.",
    Thumbnail: FAQThumbnail,
    createDefault: createFAQ,
    schema: faqSchema,
  },
  {
    type: "contact",
    label: "تواصل معنا",
    description: "نموذج اتصال + معلومات (بريد، هاتف، عنوان).",
    Thumbnail: ContactThumbnail,
    createDefault: createContact,
    schema: contactSchema,
  },
  {
    type: "booking",
    label: "نموذج حجز",
    description: "اسم، تاريخ، وقت، موظف — يُحفظ في لوحة الحجوزات.",
    Thumbnail: BookingThumbnail,
    createDefault: createBooking,
    schema: bookingSchema,
  },
  {
    type: "menu",
    label: "قائمة طعام",
    description: "أصناف ببطاقات (صورة، اسم، وصف، سعر).",
    Thumbnail: MenuThumbnail,
    createDefault: createMenu,
    schema: menuSchema,
  },
  {
    type: "portfolio",
    label: "معرض الأعمال",
    description: "شبكة أعمال (صورة، عنوان، تصنيف) — للمصورين والمصممين.",
    Thumbnail: PortfolioThumbnail,
    createDefault: createPortfolio,
    schema: portfolioSchema,
  },
  {
    type: "footer",
    label: "التذييل",
    description: "أسفل الصفحة — العلامة، أعمدة الروابط، الشبكات الاجتماعية.",
    Thumbnail: FooterThumbnail,
    createDefault: createFooter,
    schema: footerSchema,
  },
];

export function getPreset(type: SectionType) {
  return SECTION_PRESETS.find((p) => p.type === type);
}
