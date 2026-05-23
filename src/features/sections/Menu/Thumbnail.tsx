import { SectionThumbnail } from "../SectionThumbnail";
import { createMenu } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createMenu();

export default function MenuThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
