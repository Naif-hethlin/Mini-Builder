export default function CTAThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-stone-200 bg-stone-900 p-2">
      <div className="flex h-full items-center justify-between gap-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="h-1.5 w-12 rounded-sm bg-white" />
          <div className="h-1 w-16 rounded-sm bg-stone-500" />
        </div>
        <div className="h-3 w-8 rounded-sm bg-white" />
      </div>
    </div>
  );
}
