export default function FooterThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-stone-50 p-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-8 rounded-sm bg-stone-700" />
          <div className="h-1 w-full rounded-sm bg-stone-200" />
          <div className="mt-1 flex gap-1">
            <div className="h-2 w-2 rounded-sm bg-stone-300" />
            <div className="h-2 w-2 rounded-sm bg-stone-300" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="h-1 w-3/4 rounded-sm bg-stone-400" />
          <div className="h-0.5 w-full rounded-sm bg-stone-300" />
          <div className="h-0.5 w-full rounded-sm bg-stone-300" />
          <div className="h-0.5 w-2/3 rounded-sm bg-stone-300" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="h-1 w-3/4 rounded-sm bg-stone-400" />
          <div className="h-0.5 w-full rounded-sm bg-stone-300" />
          <div className="h-0.5 w-full rounded-sm bg-stone-300" />
          <div className="h-0.5 w-2/3 rounded-sm bg-stone-300" />
        </div>
      </div>
    </div>
  );
}
