export default function ContactThumbnail() {
  return (
    <div className="aspect-[4/2] rounded-md bg-stone-100 p-2">
      <div className="flex h-full gap-1">
        <div className="flex w-1/3 flex-col gap-1">
          <div className="h-2 rounded bg-white shadow-sm" />
          <div className="h-2 rounded bg-white shadow-sm" />
          <div className="h-2 rounded bg-white shadow-sm" />
        </div>
        <div className="flex w-2/3 flex-col gap-1 rounded bg-white p-1.5 shadow-sm">
          <div className="h-1.5 rounded bg-stone-200" />
          <div className="h-1.5 rounded bg-stone-200" />
          <div className="mt-auto h-3 w-12 self-end rounded bg-brand" />
        </div>
      </div>
    </div>
  );
}
