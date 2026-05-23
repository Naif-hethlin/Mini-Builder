import { memo } from "react";
import type { Section } from "@/features/builder/state/types";
import { SectionRenderer } from "./SectionRenderer";

/**
 * High-fidelity sidebar tile preview. Renders the actual SectionRenderer
 * at full width (1100px) inside an overflow-hidden 16:9 frame, then
 * scales it down via CSS transform so the user sees a real miniature of
 * what they'll get instead of a wireframe.
 *
 * `pointer-events-none` on the inner scaled wrapper so any interactive
 * bits (FAQ accordions, Booking form, Contact submit) can't be clicked
 * from inside the sidebar tile.
 */
const RENDER_WIDTH = 1100;
const TILE_WIDTH = 220; // matches the typical sidebar tile width
const SCALE = TILE_WIDTH / RENDER_WIDTH; // ≈ 0.2

export const SectionThumbnail = memo(function SectionThumbnail({
  section,
}: {
  section: Section;
}) {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none origin-top-left select-none"
        style={{
          width: `${RENDER_WIDTH}px`,
          transform: `scale(${SCALE})`,
        }}
      >
        <SectionRenderer section={section} />
      </div>
    </div>
  );
});
