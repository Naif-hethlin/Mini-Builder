"use client";

import { motion } from "framer-motion";
import {
  Download,
  FolderOpen,
  FolderUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { EmptyState } from "@/shared/ui/EmptyState";
import { exportProjectFile, importProjectFile } from "./io";
import { useProjects } from "./store";
import type { ProjectMeta } from "./types";

/**
 * Modal listing all locally-saved projects. Open via Toolbar's folder button.
 *
 * Rows: open / export / delete. Footer: create new + import from JSON.
 */
export function ProjectPicker({
  currentProjectId,
  onClose,
}: {
  currentProjectId: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to projects so the list updates after import/delete.
  const projectsMap = useProjects((s) => s.projects);
  const list: ProjectMeta[] = Object.values(projectsMap)
    .map(({ design: _d, ...meta }) => meta)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOpen = (id: string) => {
    onClose();
    if (id !== currentProjectId) router.push(`/builder/${id}`);
  };

  const handleExport = (id: string) => {
    const project = useProjects.getState().get(id);
    if (!project) return;
    exportProjectFile(project);
    toast.success(`تم تصدير ${project.name}`);
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: `حذف ${name}؟`,
      description: "لن تتمكن من استعادة هذا المشروع بعد الحذف.",
      confirmLabel: "نعم، احذف",
      danger: true,
    });
    if (!ok) return;
    useProjects.getState().remove(id);
    toast.success(`تم حذف ${name}`);
    if (id === currentProjectId) {
      onClose();
      router.push("/templates");
    }
  };

  const handleNew = () => {
    const project = useProjects.getState().create({ name: "مشروع جديد" });
    onClose();
    router.push(`/builder/${project.id}`);
  };

  const handleImport = async (file: File) => {
    const result = await importProjectFile(file);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`تم استيراد ${result.project.name}`);
    onClose();
    router.push(`/builder/${result.project.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="مشاريعي"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      <motion.button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">مشاريعي</h2>
            <p className="text-xs text-stone-500">{list.length} مشروع محفوظ محليًا</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-3">
          {list.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="لا توجد مشاريع محفوظة بعد"
              description="ابدأ بمشروع جديد أو استورد ملف JSON محفوظ مسبقًا."
              className="p-8"
            />
          ) : (
            <ul className="space-y-1.5">
              {list.map((p) => (
                <li
                  key={p.id}
                  className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                    p.id === currentProjectId
                      ? "border-brand bg-brand-light/40"
                      : "border-stone-200 bg-white hover:border-brand/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpen(p.id)}
                    className="flex-1 text-right"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      آخر تعديل: {formatRelative(p.updatedAt)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(p.id)}
                    aria-label="تصدير"
                    title="تصدير"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    aria-label="حذف"
                    title="حذف"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-stone-100 bg-stone-50 px-3 py-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-white hover:text-stone-900"
          >
            <FolderUp size={14} />
            استيراد JSON
          </button>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
          >
            <Plus size={14} />
            مشروع جديد
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diffMs < min) return "الآن";
  if (diffMs < hr) return `قبل ${Math.floor(diffMs / min)} دقيقة`;
  if (diffMs < day) return `قبل ${Math.floor(diffMs / hr)} ساعة`;
  if (diffMs < 7 * day) return `قبل ${Math.floor(diffMs / day)} يوم`;
  return new Date(ts).toLocaleDateString("ar");
}
