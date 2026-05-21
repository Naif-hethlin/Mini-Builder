import type { Section } from "@/features/builder/state/types";

import HeaderRender from "./Header/Render";
import HeroRender from "./Hero/Render";
import FeaturesRender from "./Features/Render";
import CTARender from "./CTA/Render";
import FooterRender from "./Footer/Render";

/**
 * Dispatches a Section to the right preset renderer based on its `type`.
 *
 * Used by the builder's Canvas (real-time preview while editing) and the
 * Preview route (rendering a published design without the builder UI),
 * so the renderers live in `features/sections/` and not inside any route
 * folder.
 *
 * The `layout` type is currently unreachable — the Layout/Component data
 * model was dropped in Phase 4. The case stays for exhaustiveness against
 * any future variants.
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
