"use client";

import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Rocket,
  Upload,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PublishModal } from "@/features/builder/PublishModal";
import {
  exportProjectFile,
  importProjectFile,
  useProjects,
} from "@/features/projects";

export function Website() {
  const { id } = useParams<{ id: string }>();
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useProjects.getState().hydrate();
  }, []);

  const project = useProjects((s) => s.projects[id]);
  const sectionCount =
    project?.pages.reduce((acc, p) => acc + p.design.sections.length, 0) ?? 0;
  const pageCount = project?.pages.length ?? 0;

  // Public URL only meaningful when the project is published.
  const publicUrl =
    typeof window !== "undefined" && project?.slug
      ? `${window.location.origin}/sites/${project.slug}`
      : null;

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("تعذّر النسخ");
    }
  };

  const handleExport = () => {
    if (!project) return;
    exportProjectFile(project);
    toast.success("تم تنزيل الملف");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file || !project) return;

    const confirmed = window.confirm(
      "سيتم استبدال محتوى مشروعك الحالي بمحتوى الملف. هل تريد المتابعة؟",
    );
    if (!confirmed) return;

    const result = await importProjectFile(file);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // importProjectFile creates a NEW project; we want to overwrite the
    // CURRENT one. Move the imported pages into the current project and
    // drop the throwaway project.
    const store = useProjects.getState();
    const patched = {
      ...project,
      pages: result.project.pages,
      updatedAt: Date.now(),
    };
    store.upsert(patched);
    store.remove(result.project.id);
    toast.success("تم استيراد الملف وحلّ محل المحتوى الحالي");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">إدارة الموقع</h1>
        <p className="mt-1 text-sm text-stone-500">
          {sectionCount > 0
            ? `موقعك يحتوي حالياً على ${sectionCount} قسم في ${pageCount} صفحة.`
            : "موقعك فارغ — أضف أقساماً من المحرر."}
        </p>
      </div>

      {/* Published-domain banner — only when live. Big, copyable, with a
          direct visit link. This is the answer to "show me my domain when
          I publish." */}
      {project?.published && publicUrl && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckCircle2 size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-700">
                  منشور — موقعك مرئي للعملاء الآن
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="select-all rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-bold text-stone-800 shadow-sm" dir="ltr">
                    {publicUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-colors hover:border-brand hover:text-brand"
                    title="نسخ الرابط"
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              زر الموقع
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          href={`/builder/${id}`}
          icon={Edit3}
          title="تحرير الموقع"
          description="افتح المحرر لإضافة أو تعديل الأقسام."
        />
        <ActionCard
          href={`/preview/${id}`}
          icon={Eye}
          title="معاينة الموقع"
          description="افتح الموقع كأنك زائر — بدون أدوات التحرير."
          external
        />
        <ActionCard
          icon={Rocket}
          title={project?.published ? "تحديث النشر" : "نشر الموقع"}
          description={
            project?.published
              ? "النطاق مقفل لك. اضغط لإطلاق آخر التغييرات."
              : "اختر نطاقاً عاماً وانشر الموقع للعالم."
          }
          onClick={() => setPublishOpen(true)}
          accent
        />
      </div>

      {/* Live preview iframe — fills the dead space below the action
          cards with the actual site so the owner sees what visitors see
          without leaving the dashboard. */}
      {sectionCount > 0 && (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-stone-400" />
              <span className="text-xs font-bold text-stone-700">
                معاينة حية
              </span>
              <span className="text-[10px] text-stone-400" dir="ltr">
                {project?.published && project.slug
                  ? `/sites/${project.slug}`
                  : `/preview/${id}`}
              </span>
            </div>
            <Link
              href={`/preview/${id}`}
              target="_blank"
              className="text-xs font-bold text-brand hover:text-brand-dark"
            >
              فتح في نافذة جديدة ←
            </Link>
          </div>
          <iframe
            src={`/preview/${id}`}
            className="block h-[640px] w-full bg-white"
            title="معاينة الموقع"
            // We render our own pages, no untrusted content — sandbox is
            // primarily here to silence framing-policy warnings and to
            // keep any third-party script inside the iframe isolated.
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      )}

      {/* Tools — JSON export / import */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900">أدوات الملف</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              صدّر مشروعك كنسخة احتياطية، أو استورد ملفاً لاستبدال المحتوى الحالي.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={!project}
            className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 text-start transition-all hover:border-brand/40 hover:bg-brand-light/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:bg-brand group-hover:text-white">
                <Download size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">تنزيل JSON</p>
                <p className="text-[11px] text-stone-500">
                  احفظ صفحات مشروعك في ملف يمكن استيراده لاحقاً.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            disabled={!project}
            className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 text-start transition-all hover:border-brand/40 hover:bg-brand-light/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:bg-brand group-hover:text-white">
                <Upload size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">استيراد JSON</p>
                <p className="text-[11px] text-stone-500">
                  استبدل محتوى المشروع الحالي بصفحات من ملف.
                </p>
              </div>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      <PublishModal
        open={publishOpen}
        projectId={id}
        onClose={() => setPublishOpen(false)}
      />
    </div>
  );
}

function ActionCard({
  href,
  external,
  icon: Icon,
  title,
  description,
  onClick,
  accent = false,
}: {
  href?: string;
  external?: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const body = (
    <div
      className={`group flex h-full flex-col rounded-2xl border p-5 text-start transition-all hover:shadow-md ${
        accent
          ? "border-brand/30 bg-brand-light/40 hover:border-brand"
          : "border-stone-200 bg-white hover:border-brand/40"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-brand text-white" : "bg-brand-light text-brand"
        }`}
      >
        <Icon size={18} />
      </div>
      <h3 className="text-base font-semibold text-stone-900 group-hover:text-brand">
        {title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
        {description}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target={external ? "_blank" : undefined}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-start">
      {body}
    </button>
  );
}
