export default function FeaturesThumbnail() {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded border border-slate-200 bg-white p-2">
      <div className="mb-1.5 flex flex-col items-center gap-0.5">
        <div className="h-1.5 w-12 rounded-sm bg-slate-700" />
        <div className="h-1 w-16 rounded-sm bg-slate-200" />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-start gap-0.5 rounded-sm bg-slate-50 p-1"
          >
            <div className="h-1.5 w-1.5 rounded-sm bg-slate-400" />
            <div className="h-1 w-full rounded-sm bg-slate-300" />
            <div className="h-0.5 w-full rounded-sm bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
