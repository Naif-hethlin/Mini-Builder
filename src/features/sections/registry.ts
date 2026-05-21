import type { ComponentType } from "react";
import type { Section, SectionType } from "@/features/builder/state/types";

import HeaderThumbnail from "./Header/Thumbnail";
import { createHeader } from "./Header/defaults";

import HeroThumbnail from "./Hero/Thumbnail";
import { createHero } from "./Hero/defaults";

import FeaturesThumbnail from "./Features/Thumbnail";
import { createFeatures } from "./Features/defaults";

import CTAThumbnail from "./CTA/Thumbnail";
import { createCTA } from "./CTA/defaults";

import FooterThumbnail from "./Footer/Thumbnail";
import { createFooter } from "./Footer/defaults";

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
};

export const SECTION_PRESETS: SectionPresetMeta[] = [
  {
    type: "header",
    label: "رأس الصفحة",
    description: "شريط علوي يحوي شعارك، روابط التنقل، وزر إجراء.",
    Thumbnail: HeaderThumbnail,
    createDefault: createHeader,
  },
  {
    type: "hero",
    label: "البطل",
    description: "بانر كبير في أعلى الصفحة — عنوان، وصف، صورة، وأزرار.",
    Thumbnail: HeroThumbnail,
    createDefault: createHero,
  },
  {
    type: "features",
    label: "المزايا",
    description: "شبكة من المزايا مع أيقونات وعناوين وأوصاف.",
    Thumbnail: FeaturesThumbnail,
    createDefault: createFeatures,
  },
  {
    type: "cta",
    label: "دعوة للإجراء",
    description: "بانر بعنوان وزر واحد كبير لتحفيز النقرات.",
    Thumbnail: CTAThumbnail,
    createDefault: createCTA,
  },
  {
    type: "footer",
    label: "التذييل",
    description: "أسفل الصفحة — العلامة، أعمدة الروابط، الشبكات الاجتماعية.",
    Thumbnail: FooterThumbnail,
    createDefault: createFooter,
  },
];
