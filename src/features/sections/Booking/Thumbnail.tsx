import { SectionThumbnail } from "../SectionThumbnail";
import { createBooking } from "./defaults";

// Memoized at module load — the default content never changes for the tile.
const SAMPLE = createBooking();

export default function BookingThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
