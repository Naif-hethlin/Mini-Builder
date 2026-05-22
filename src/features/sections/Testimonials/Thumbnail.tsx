export default function TestimonialsThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="grid h-full grid-cols-2 gap-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded bg-white p-1.5 shadow-sm"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j} className="h-1 w-1 rounded-full bg-brand/60" />
              ))}
            </div>
            <div className="h-1 w-full rounded bg-stone-200" />
            <div className="h-1 w-2/3 rounded bg-stone-200" />
            <div className="mt-auto h-1 w-1/2 rounded bg-stone-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
