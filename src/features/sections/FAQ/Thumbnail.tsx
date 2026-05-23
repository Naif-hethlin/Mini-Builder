import { SectionThumbnail } from "../SectionThumbnail";
import { createFAQ } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createFAQ();

export default function FAQThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
