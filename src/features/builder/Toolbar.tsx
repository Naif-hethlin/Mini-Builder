"use client";

import {
  Download,
  Eye,
  FolderOpen,
  LayoutDashboard,
  PaintBucket,
  Redo2,
  Rocket,
  Settings,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import {
  ProjectPicker,
  exportProjectFile,
  useProjects,
} from "@/features/projects";
import { PageSwitcher } from "./PageSwitcher";
import {
  selectCanRedo,
  selectCanUndo,
  selectProjectId,
  useBuilderStore,
} from "./state/store";

const PANEL_CLASS =
  "bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100";

const PILL_GROUP_CLASS =
  "flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100";

export function Toolbar() {
  // Narrow selectors so editing a section's design doesn't re-render the Toolbar.
  const canUndo = useBuilderStore(selectCanUndo);
  const canRedo = useBuilderStore(selectCanRedo);
  const projectId = useBuilderStore(selectProjectId);

  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const clearDesign = useBuilderStore((s) => s.clearDesign);

  const [pickerOpen, setPickerOpen] = useState(false);

  const projectName = useProjects((s) =>
    projectId ? s.projects[projectId]?.name : undefined,
  );

  const handleExport = () => {
    if (!projectId) return;
    const project = useProjects.getState().get(projectId);
    if (!project) return;
    exportProjectFile(project);
    toast.success(`تم تصدير ${project.name}`);
  };

  const confirm = useConfirm();
  const handleClear = async () => {
    const ok = await confirm({
      title: "مسح الصفحة بالكامل؟",
      description:
        "سيتم حذف كل الأقسام من هذا المشروع. تقدر تتراجع بالضغط على Ctrl+Z.",
      confirmLabel: "نعم، امسح",
      cancelLabel: "إلغاء",
      danger: true,
    });
    if (!ok) return;
    clearDesign();
    toast.success("تم مسح الصفحة");
  };

  return (
    <header
      className={cn(
        "z-30 flex h-16 shrink-0 items-center justify-between gap-3 px-4",
        PANEL_CLASS,
      )}
    >
      {/* ── Left: brand chip + nav pills ────────────────────────────── */}
      <div className="flex h-full items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl bg-brand-light px-3 py-1.5 text-brand">
          <Logo height={20} />
        </span>

        <div className="mx-2 h-6 w-px bg-slate-200" />

        <nav
          aria-label="أقسام البناء"
          className="flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1"
        >
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-4 py-1.5 text-sm font-bold text-brand-dark shadow-sm">
            <PaintBucket size={14} />
            المنشئ
          </span>
          {projectId && (
            <Link
              href={`/dashboard/${projectId}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <LayoutDashboard size={14} />
              لوحة التحكم
            </Link>
          )}
        </nav>
      </div>

      {/* ── Center: project status pill + page switcher ─────────────── */}
      <div className="hidden items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-4 py-1.5 lg:flex">
        <span className="truncate text-sm font-bold text-slate-700">
          {projectName ?? "مشروع جديد"}
        </span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          تم الحفظ
        </span>
        {projectId && (
          <>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <PageSwitcher projectId={projectId} />
          </>
        )}
      </div>

      {/* On smaller screens collapse the status pill — keep just the page
          switcher so multi-page projects stay usable. */}
      {projectId && (
        <div className="lg:hidden">
          <PageSwitcher projectId={projectId} />
        </div>
      )}

      {/* ── Right: history + view group + publish ───────────────────── */}
      <div className="flex items-center gap-3">
        <div className={PILL_GROUP_CLASS}>
          <ToolbarIconButton
            icon={<Undo2 size={15} />}
            label="تراجع (Ctrl+Z)"
            disabled={!canUndo}
            onClick={undo}
          />
          <ToolbarIconButton
            icon={<Redo2 size={15} />}
            label="إعادة (Ctrl+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
          />
        </div>

        <div className={cn(PILL_GROUP_CLASS, "hidden sm:flex")}>
          <ToolbarIconButton
            icon={<Eye size={15} />}
            label="معاينة"
            onClick={() => {
              if (!projectId) return;
              window.open(`/preview/${projectId}`, "_blank");
            }}
          />
          <ToolbarIconButton
            icon={<FolderOpen size={15} />}
            label="فتح مشروع"
            onClick={() => setPickerOpen(true)}
          />
          <ToolbarIconButton
            icon={<Download size={15} />}
            label="تصدير JSON"
            onClick={handleExport}
          />
          <ToolbarIconButton
            icon={<Trash2 size={15} />}
            label="مسح الصفحة"
            onClick={handleClear}
            danger
          />
          <ToolbarIconButton
            icon={<Settings size={15} />}
            label="إعدادات"
            onClick={() => {
              if (!projectId) return;
              window.location.assign(`/dashboard/${projectId}/settings`);
            }}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            toast.info("النشر التلقائي قريبًا — استخدم التصدير حالياً")
          }
          className="inline-flex items-center gap-2 rounded-xl border border-brand bg-gradient-to-l from-brand-dark to-brand px-5 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(232,93,93,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(232,93,93,0.35)]"
        >
          <span className="hidden sm:inline">نشر الموقع</span>
          <Rocket size={14} />
        </button>
      </div>

      {pickerOpen && (
        <ProjectPicker
          currentProjectId={projectId}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </header>
  );
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "hover:bg-rose-50 hover:text-rose-600"
          : "hover:bg-white hover:text-slate-800 hover:shadow-sm",
      )}
    >
      {icon}
    </button>
  );
}
