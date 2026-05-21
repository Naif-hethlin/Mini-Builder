"use client";

import {
  Download,
  Eye,
  FolderOpen,
  Languages,
  LayoutDashboard,
  Monitor,
  Redo2,
  Rocket,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { IconButton } from "@/shared/ui/IconButton";
import { Logo } from "@/shared/ui/Logo";
import {
  ProjectPicker,
  exportProjectFile,
  useProjects,
} from "@/features/projects";
import type { DeviceMode } from "./state/types";
import {
  selectCanRedo,
  selectCanUndo,
  selectDeviceMode,
  selectLanguage,
  selectProjectId,
  useBuilderStore,
} from "./state/store";

// All three device modes, in display order, with their lucide icons.
const DEVICES: Array<{ mode: DeviceMode; Icon: typeof Monitor; label: string }> =
  [
    { mode: "desktop", Icon: Monitor, label: "Desktop" },
    { mode: "tablet", Icon: Tablet, label: "Tablet" },
    { mode: "mobile", Icon: Smartphone, label: "Mobile" },
  ];

export function Toolbar() {
  // Read each slice with its OWN selector so re-renders are narrow:
  // editing the design doesn't trigger Toolbar re-renders, only undo/redo state changes do.
  const canUndo = useBuilderStore(selectCanUndo);
  const canRedo = useBuilderStore(selectCanRedo);
  const deviceMode = useBuilderStore(selectDeviceMode);
  const language = useBuilderStore(selectLanguage);
  const projectId = useBuilderStore(selectProjectId);

  // Actions are stable function references — no re-render concerns.
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const clearDesign = useBuilderStore((s) => s.clearDesign);
  const setDeviceMode = useBuilderStore((s) => s.setDeviceMode);
  const setLanguage = useBuilderStore((s) => s.setLanguage);

  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSave = () => {
    // Auto-save covers the actual writing; this is the explicit confirm path.
    toast.success("تم الحفظ");
  };

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
    <header className="flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2">
      {/* ── Left: brand ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 items-center gap-2.5">
        <Logo height={22} />
        <span className="hidden truncate text-sm text-stone-500 sm:inline">
          المنشئ
        </span>
        {projectId && (
          <Link
            href={`/dashboard/${projectId}`}
            title="لوحة التحكم"
            className="ms-2 hidden h-7 items-center gap-1.5 rounded-md border border-stone-200 px-2 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand sm:inline-flex"
          >
            <LayoutDashboard size={12} />
            لوحة التحكم
          </Link>
        )}
      </div>

      {/* ── Middle: device preview toggle ──────────────────────────────── */}
      <div className="flex items-center gap-0.5 rounded-md bg-stone-100 p-1">
        {DEVICES.map(({ mode, Icon, label }) => (
          <IconButton
            key={mode}
            icon={<Icon size={16} />}
            label={label}
            active={deviceMode === mode}
            onClick={() => setDeviceMode(mode)}
            className="h-7 w-7"
          />
        ))}
      </div>

      {/* ── Right: history + file ops + language + publish ─────────────── */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={<Undo2 size={16} />}
          label="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={undo}
        />
        <IconButton
          icon={<Redo2 size={16} />}
          label="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={redo}
        />

        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" />

        <IconButton
          icon={<Save size={16} />}
          label="حفظ"
          onClick={handleSave}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<FolderOpen size={16} />}
          label="فتح مشروع"
          onClick={() => setPickerOpen(true)}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<Download size={16} />}
          label="تصدير JSON"
          onClick={handleExport}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<Eye size={16} />}
          label="معاينة"
          onClick={() => {
            if (!projectId) return;
            window.open(`/preview/${projectId}`, "_blank");
          }}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<Trash2 size={16} />}
          label="مسح الصفحة"
          onClick={handleClear}
        />

        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" />

        <button
          type="button"
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          aria-label="Toggle language"
          title="Toggle language"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        >
          <Languages size={14} />
          {language === "ar" ? "AR" : "EN"}
        </button>

        <button
          type="button"
          onClick={() => toast.info("النشر التلقائي قريبًا — استخدم التصدير حالياً")}
          className="ms-1 inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <Rocket size={14} />
          <span className="hidden sm:inline">نشر</span>
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
