import { SectionThumbnail } from "../SectionThumbnail";
import { createContact } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createContact();

export default function ContactThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
