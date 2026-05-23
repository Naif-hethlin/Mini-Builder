import { SectionThumbnail } from "../SectionThumbnail";
import { createTestimonials } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createTestimonials();

export default function TestimonialsThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
