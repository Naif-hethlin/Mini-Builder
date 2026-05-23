import { SectionThumbnail } from "../SectionThumbnail";
import { createHeader } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createHeader();

export default function HeaderThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
