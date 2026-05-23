import { SectionThumbnail } from "../SectionThumbnail";
import { createPortfolio } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createPortfolio();

export default function PortfolioThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
