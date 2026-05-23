import { SectionThumbnail } from "../SectionThumbnail";
import { createFeatures } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createFeatures();

export default function FeaturesThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
