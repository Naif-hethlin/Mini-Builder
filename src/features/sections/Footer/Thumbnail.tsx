import { SectionThumbnail } from "../SectionThumbnail";
import { createFooter } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createFooter();

export default function FooterThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
