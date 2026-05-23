import { SectionThumbnail } from "../SectionThumbnail";
import { createPricing } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createPricing();

export default function PricingThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
