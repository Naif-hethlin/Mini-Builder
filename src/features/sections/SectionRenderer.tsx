import type { Section } from "@/app/web-builder/_back/types";

import HeaderRender from "./Header/Render";
import HeroRender from "./Hero/Render";
import FeaturesRender from "./Features/Render";
import CTARender from "./CTA/Render";
import FooterRender from "./Footer/Render";

/**
 * Dispatches a Section to the right preset renderer based on its `type`.
 *
 * Used by:
 *   - The builder's Canvas (real-time preview while editing)
 *   - The public /p/[slug] route (rendering a published design from the DB)
 *
 * This is why the section renderers live in `features/` (shared) and NOT inside
 * `app/web-builder/`: they're used by more than just the builder route.
 *
 * The `layout` type returns null here — its content (rows/cols/components) is
 * handled separately by the LayoutRenderer in Phase 10.
 */
export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case "header":
      return <HeaderRender props={section.props} />;
    case "hero":
      return <HeroRender props={section.props} />;
    case "features":
      return <FeaturesRender props={section.props} />;
    case "cta":
      return <CTARender props={section.props} />;
    case "footer":
      return <FooterRender props={section.props} />;
    case "layout":
      // Layout container — content rendered by LayoutRenderer (Phase 10).
      return null;
  }
}
