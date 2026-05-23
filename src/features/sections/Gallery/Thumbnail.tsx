import { SectionThumbnail } from "../SectionThumbnail";
import { createGallery } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createGallery();

export default function GalleryThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
