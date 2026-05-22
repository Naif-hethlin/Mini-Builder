export default function FAQThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="flex h-full flex-col gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded bg-white px-2 py-1 shadow-sm"
          >
            <div className="h-1 w-12 rounded bg-stone-300" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
