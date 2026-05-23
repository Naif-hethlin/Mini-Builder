import { SectionThumbnail } from "../SectionThumbnail";
import { createHero } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createHero();

export default function HeroThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
