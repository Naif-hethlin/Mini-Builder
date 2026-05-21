export default function MenuThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="grid h-full grid-cols-2 gap-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-1 rounded bg-white p-1.5 shadow-sm"
          >
            <div className="h-full w-5 rounded bg-stone-200" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-1.5 w-3/4 rounded bg-stone-300" />
              <div className="h-1.5 w-full rounded bg-stone-200" />
              <div className="mt-auto h-1.5 w-8 rounded bg-brand/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
