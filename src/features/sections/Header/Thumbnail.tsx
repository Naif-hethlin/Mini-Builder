/**
 * Mini preview tile for the Header section, shown in the sidebar library.
 * Abstract shapes hinting at the section's structure — not a full render.
 */
export default function HeaderThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-100 px-2 py-1.5">
        <div className="h-1.5 w-8 rounded-sm bg-stone-400" />
        <div className="flex gap-1">
          <div className="h-1 w-4 rounded-sm bg-stone-200" />
          <div className="h-1 w-4 rounded-sm bg-stone-200" />
          <div className="h-1 w-4 rounded-sm bg-stone-200" />
        </div>
        <div className="h-2 w-6 rounded-sm bg-stone-900" />
      </div>
      <div className="h-full bg-stone-50" />
    </div>
  );
}
