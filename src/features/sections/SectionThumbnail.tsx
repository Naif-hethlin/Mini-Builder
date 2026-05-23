import { memo } from "react";
import type { Section } from "@/features/builder/state/types";
import { SectionRenderer } from "./SectionRenderer";

/**
 * High-fidelity sidebar tile preview. The trick: we render the actual
 * SectionRenderer at a wide "design" width inside a fixed-aspect outer
 * frame, then scale it down via CSS transform anchored top-left. We
 * also size the inner to exactly the design aspect (16:9) so the
 * scaled visual fills the tile without dead space.
 *
 * `pointer-events-none + select-none` so any interactive bits (FAQ
 * accordion, Booking form, Contact submit) can't fire from inside the
 * sidebar tile.
 */
const DESIGN_W = 1280;
const DESIGN_H = 720; // 16:9 of DESIGN_W
const PREVIEW_W = 256; // typical sidebar tile inner width
const SCALE = PREVIEW_W / DESIGN_W; // ≈ 0.2

export const SectionThumbnail = memo(function SectionThumbnail({
  section,
}: {
  section: Section;
}) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 origin-top-left select-none"
        style={{
          width: `${DESIGN_W}px`,
          height: `${DESIGN_H}px`,
          transform: `scale(${SCALE})`,
        }}
      >
        <SectionRenderer section={section} />
      </div>
    </div>
  );
});
