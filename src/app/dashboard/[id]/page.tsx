// Route: /dashboard/[id]
//
// Placeholder until M3 (Phases 15–17 build the real dashboard).

export const metadata = {
  title: "لوحة التحكم — ركاز",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-brand">قريباً</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          لوحة التحكم
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          المشروع: <span className="font-mono text-stone-700">{id}</span>
        </p>
      </div>
    </main>
  );
}
