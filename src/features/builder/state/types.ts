// =============================================================================
// THE DATA MODEL
//
// A PAGE is a list of SECTIONS.
// Each SECTION is one of 6 types: 5 presets (Header/Hero/Features/CTA/Footer)
//   + 1 Layout container that holds nested COMPONENTS.
// A COMPONENT is one of 6 atomic types (Image/Text/Heading/Button/FeaturedItem/Comments).
//
// This file ONLY defines the shape of data. No behavior, no React, no Zustand.
// =============================================================================

// -----------------------------------------------------------------------------
// Shared bits used inside section/component props
// -----------------------------------------------------------------------------

export type Link = {
  label: string;
  href: string;
};

export type ToggleableLink = Link & {
  show: boolean; // controls whether the button is rendered
};

// =============================================================================
// THE 5 PRESET SECTION PROP TYPES
// =============================================================================

export type HeaderProps = {
  brand: Link;
  links: Link[]; // dynamic list — user can add/remove nav links
  ctaButton: ToggleableLink;
};

export type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  primaryButton: ToggleableLink;
  secondaryButton: ToggleableLink;
  layout: "image-right" | "image-left" | "image-bg" | "no-image";
  alignment: "left" | "center";
};

export type FeaturesProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Array<{
    id: string; // every list item has its own id for stable React keys + DnD
    icon: string; // lucide-react icon name, e.g. "Coffee"
    title: string;
    description: string;
  }>;
  columns: 2 | 3 | 4;
};

export type CTAProps = {
  title: string;
  description: string;
  button: Link;
  style: "solid" | "gradient" | "subtle";
};

export type FooterProps = {
  brand: { text: string; tagline: string };
  columns: Array<{
    id: string;
    title: string;
    links: Link[];
  }>;
  socials: Array<{
    id: string;
    platform: "twitter" | "instagram" | "linkedin" | "whatsapp";
    href: string;
  }>;
  copyright: string;
};

// =============================================================================
// A SECTION is one of the 5 preset types. The Layout/Component freeform model
// from earlier drafts is intentionally NOT included — see docs/PLAN.md "Builder
// is NOT fully freeform".
// =============================================================================

export type Section =
  | { id: string; type: "header"; props: HeaderProps }
  | { id: string; type: "hero"; props: HeroProps }
  | { id: string; type: "features"; props: FeaturesProps }
  | { id: string; type: "cta"; props: CTAProps }
  | { id: string; type: "footer"; props: FooterProps };

export type SectionType = Section["type"];

// =============================================================================
// THE PAGE — the top-level object that gets exported to JSON
// =============================================================================

export type PageDesign = {
  version: 1; // schema version — lets us migrate later if needed
  sections: Section[];
};

// =============================================================================
// UI STATE (NOT part of the exported design — lives in the store but doesn't
// get saved to JSON or to undo/redo history)
// =============================================================================

/**
 * What's currently selected for editing.
 * - "none" — nothing selected; edit panel shows "select a section to edit".
 * - "section" — a section is selected; edit panel shows its props form.
 */
export type Selection =
  | { kind: "none" }
  | { kind: "section"; sectionId: string };

/** The canvas preview width (Desktop/Tablet/Mobile toggle in the toolbar). */
export type DeviceMode = "desktop" | "tablet" | "mobile";

/** Builder UI language. The design itself has no inherent language — only the UI does. */
export type Language = "ar" | "en";

/** Which tab is active on the bottom mobile tab bar (only used <md screens). */
export type MobileTab = "library" | "canvas" | "editor";
