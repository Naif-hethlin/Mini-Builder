export default function PricingThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-white p-2">
      <div className="mb-1.5 flex flex-col items-center gap-0.5">
        <div className="h-1.5 w-12 rounded-sm bg-stone-700" />
        <div className="h-1 w-16 rounded-sm bg-stone-200" />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex flex-col items-stretch gap-0.5 rounded-sm p-1 ${
              i === 1
                ? "bg-brand-light/50 ring-1 ring-brand"
                : "bg-stone-50"
            }`}
          >
            <div className="h-1 w-1/2 rounded-sm bg-stone-400" />
            <div className="my-0.5 h-2 w-full rounded-sm bg-stone-700" />
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-0.5 w-full rounded-sm bg-stone-300"
              />
            ))}
            <div
              className={`mt-0.5 h-1.5 w-full rounded-sm ${
                i === 1 ? "bg-brand" : "bg-stone-200"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
