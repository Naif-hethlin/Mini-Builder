import { SectionThumbnail } from "../SectionThumbnail";
import { createCTA } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createCTA();

export default function CTAThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
