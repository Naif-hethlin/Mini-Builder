/**
 * Mini preview tile for the Header section, shown in the sidebar library.
 * Abstract shapes hinting at the section's structure — not a full render.
 */
export default function HeaderThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
        <div className="h-1.5 w-8 rounded-sm bg-slate-400" />
        <div className="flex gap-1">
          <div className="h-1 w-4 rounded-sm bg-slate-200" />
          <div className="h-1 w-4 rounded-sm bg-slate-200" />
          <div className="h-1 w-4 rounded-sm bg-slate-200" />
        </div>
        <div className="h-2 w-6 rounded-sm bg-slate-900" />
      </div>
      <div className="h-full bg-slate-50" />
    </div>
  );
}
