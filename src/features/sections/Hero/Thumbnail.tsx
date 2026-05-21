export default function HeroThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-slate-200 bg-white p-2">
      <div className="grid h-full grid-cols-2 gap-1.5">
        <div className="flex flex-col justify-center gap-1">
          <div className="h-1 w-3/4 rounded-sm bg-slate-300" />
          <div className="h-2 w-full rounded-sm bg-slate-700" />
          <div className="h-1 w-full rounded-sm bg-slate-200" />
          <div className="mt-1 flex gap-1">
            <div className="h-1.5 w-5 rounded-sm bg-slate-900" />
            <div className="h-1.5 w-5 rounded-sm bg-slate-200" />
          </div>
        </div>
        <div className="rounded bg-slate-200" />
      </div>
    </div>
  );
}
