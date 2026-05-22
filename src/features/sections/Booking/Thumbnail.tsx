export default function BookingThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="flex h-full flex-col gap-1 rounded bg-white p-1.5 shadow-sm">
        <div className="grid grid-cols-2 gap-1">
          <div className="h-2 rounded bg-stone-200" />
          <div className="h-2 rounded bg-stone-200" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-2 rounded bg-stone-200" />
          <div className="h-2 rounded bg-stone-200" />
        </div>
        <div className="mt-auto h-3 rounded bg-brand" />
      </div>
    </div>
  );
}
