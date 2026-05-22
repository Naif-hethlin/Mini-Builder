export default function CanvasThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="relative h-full rounded bg-white shadow-sm">
        <span className="absolute top-1 start-1 h-2 w-8 rounded bg-stone-300" />
        <span className="absolute top-4 start-4 h-1.5 w-12 rounded bg-stone-200" />
        <span className="absolute bottom-2 end-2 h-3 w-10 rounded-full bg-brand/70" />
        <span className="absolute top-1 end-2 h-3 w-3 rounded-sm bg-brand-soft/60" />
      </div>
    </div>
  );
}
