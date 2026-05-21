export default function PortfolioThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="grid h-full grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded bg-white shadow-sm"
          >
            <div className="h-full w-full bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
