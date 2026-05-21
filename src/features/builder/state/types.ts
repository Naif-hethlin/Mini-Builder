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
// THE 6 ATOMIC COMPONENT PROP TYPES (used inside Layout sections)
// =============================================================================

export type ImageComponentProps = {
  url: string;
  alt: string;
  rounded: boolean;
};

export type TextComponentProps = {
  body: string;
  align: "left" | "center" | "right";
};

export type HeadingComponentProps = {
  text: string;
  level: 1 | 2 | 3 | 4;
  align: "left" | "center" | "right";
};

export type ButtonComponentProps = {
  label: string;
  href: string;
  variant: "solid" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
};

export type FeaturedItemProps = {
  imageUrl: string;
  title: string;
  price: string;
  href: string;
};

export type CommentsComponentProps = {
  title: string;
  placeholder: string;
  requireName: boolean;
};

// -----------------------------------------------------------------------------
// A COMPONENT is a discriminated union of the 6 atomic types.
// Discriminated by the `type` field — TS will narrow `props` to the right shape
// once you've checked the `type`.
// -----------------------------------------------------------------------------

export type Component =
  | { id: string; type: "image"; props: ImageComponentProps }
  | { id: string; type: "text"; props: TextComponentProps }
  | { id: string; type: "heading"; props: HeadingComponentProps }
  | { id: string; type: "button"; props: ButtonComponentProps }
  | { id: string; type: "featured-item"; props: FeaturedItemProps }
  | { id: string; type: "comments"; props: CommentsComponentProps };

export type ComponentType = Component["type"];

// =============================================================================
// THE LAYOUT SECTION — contains rows -> columns -> components
// =============================================================================

export type LayoutColumn = {
  id: string;
  width: number; // percentage 0–100 (resize handles change this)
  components: Component[];
};

export type LayoutRow = {
  id: string;
  columns: LayoutColumn[];
};

export type LayoutProps = {
  rows: LayoutRow[];
};

// =============================================================================
// A SECTION is one of 6 types: 5 presets + 1 Layout container
// =============================================================================

export type Section =
  | { id: string; type: "header"; props: HeaderProps }
  | { id: string; type: "hero"; props: HeroProps }
  | { id: string; type: "features"; props: FeaturesProps }
  | { id: string; type: "cta"; props: CTAProps }
  | { id: string; type: "footer"; props: FooterProps }
  | { id: string; type: "layout"; props: LayoutProps };

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
 * - "none" — nothing selected; edit panel shows "select a section to edit"
 * - "section" — a section is selected; edit panel shows its props form
 * - "component" — a component inside a Layout is selected; edit panel shows
 *   the component's props form (the path tells us which Layout/row/col it's in)
 */
export type Selection =
  | { kind: "none" }
  | { kind: "section"; sectionId: string }
  | {
      kind: "component";
      sectionId: string;
      rowId: string;
      colId: string;
      componentId: string;
    };

/** The canvas preview width (Desktop/Tablet/Mobile toggle in the toolbar). */
export type DeviceMode = "desktop" | "tablet" | "mobile";

/** Builder UI language. The design itself has no inherent language — only the UI does. */
export type Language = "ar" | "en";

/** Which tab is active on the bottom mobile tab bar (only used <md screens). */
export type MobileTab = "library" | "canvas" | "editor";

/** Which tab is active in the LEFT sidebar (always visible on desktop). */
export type SidebarTab = "sections" | "layouts" | "components";
