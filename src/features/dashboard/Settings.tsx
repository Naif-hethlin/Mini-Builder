"use client";

import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProjects } from "@/features/projects";
import { useConfirm } from "@/shared/ui/ConfirmProvider";

const RENAME_DEBOUNCE_MS = 500;

export function Settings() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const confirm = useConfirm();

  useEffect(() => {
    useProjects.getState().hydrate();
  }, []);

  const project = useProjects((s) => s.projects[id]);

  const [name, setName] = useState(project?.name ?? "");

  // Sync local input when project name changes from elsewhere.
  useEffect(() => {
    setName(project?.name ?? "");
  }, [project?.name]);

  // Debounced rename — write through after the user stops typing.
  useEffect(() => {
    if (!project) return;
    if (name === project.name) return;
    const t = setTimeout(() => {
      useProjects.getState().rename(id, name);
    }, RENAME_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [name, project, id]);

  const handleDelete = async () => {
    if (!project) return;
    const ok = await confirm({
      title: `حذف ${project.name}؟`,
      description: "سيتم حذف المشروع وكل أقسامه نهائياً.",
      confirmLabel: "نعم، احذف",
      danger: true,
    });
    if (!ok) return;
    useProjects.getState().remove(id);
    toast.success(`تم حذف ${project.name}`);
    router.push("/templates");
  };

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          المشروع غير موجود.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">إعدادات المشروع</h1>
        <p className="mt-1 text-sm text-stone-500">
          تعديل اسم المشروع أو حذفه نهائياً.
        </p>
      </div>

      {/* Rename */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">اسم المشروع</h2>
        <p className="mt-1 text-xs text-stone-500">
          يظهر في قائمة المشاريع والشريط العلوي للوحة التحكم.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المشروع"
          className="mt-4 block h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
        />
      </section>

      {/* Metadata */}
      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Meta label="معرف المشروع" value={project.id} mono />
          <Meta
            label="القالب"
            value={project.templateType ?? "من الصفر"}
          />
          <Meta
            label="تم الإنشاء"
            value={new Date(project.createdAt).toLocaleString("ar")}
          />
          <Meta
            label="آخر تعديل"
            value={new Date(project.updatedAt).toLocaleString("ar")}
          />
        </dl>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-700">منطقة خطرة</h2>
        <p className="mt-1 text-xs text-red-600/80">
          حذف المشروع لا يمكن التراجع عنه.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
        >
          <Trash2 size={14} />
          حذف المشروع
        </button>
      </section>
    </div>
  );
}

function Meta({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd
        className={`mt-0.5 text-sm text-stone-900 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
