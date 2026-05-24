"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProjects } from "@/features/projects";

/**
 * First-action modal for new projects. Shown when the project still has
 * one of the auto-generated default names — gives the user a chance to
 * name their site before anything else happens. Dismissible (the user
 * can skip and rename later from the toolbar).
 *
 * Storage: a per-project flag in localStorage so a user who dismisses
 * the prompt without renaming doesn't get it re-shown on every reload
 * of the same project.
 */

const DEFAULT_NAMES = new Set([
  "مشروع جديد",
  "مشروعي الأول",
]);

const storageKey = (id: string) => `rekaz-builder/name-prompt/${id}`;

export function ProjectNamePrompt({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const project = useProjects((s) => s.projects[projectId]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Decide whether to show. Runs once per mount; the parent gates the
  // mount itself behind the same conditions.
  useEffect(() => {
    if (!project) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(storageKey(projectId)) === "1") {
      onDone();
      return;
    }
    if (!DEFAULT_NAMES.has(project.name)) {
      onDone();
      return;
    }
    setName(project.name);
    // Small delay so the modal feels like it arrives, not snaps in.
    const t = setTimeout(() => setOpen(true), 250);
    return () => clearTimeout(t);
  }, [project, projectId, onDone]);

  const close = (markSeen = true) => {
    if (markSeen && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey(projectId), "1");
      } catch {
        /* localStorage unavailable */
      }
    }
    setOpen(false);
    // Let the close animation finish before unmounting via onDone.
    setTimeout(onDone, 180);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === project?.name) {
      close();
      return;
    }
    setSaving(true);
    // Optimistic local update so the toolbar pill updates instantly.
    useProjects.getState().rename(projectId, trimmed);
    // Server sync — fire-and-forget; for local-only projects this 404s
    // and we ignore the error (rename still good locally, the user can
    // re-sync later from the editor).
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: trimmed }),
      });
    } catch {
      /* network — local rename still applied */
    }
    setSaving(false);
    toast.success("تم حفظ اسم المشروع");
    close();
  };

  if (!project || !open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="name-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-prompt-title"
        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      >
        <motion.button
          type="button"
          aria-label="إغلاق"
          onClick={() => close()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
        >
          <button
            type="button"
            onClick={() => close()}
            aria-label="تخطّي"
            className="absolute top-3 end-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={14} />
          </button>

          <div className="bg-tint-peach px-7 pt-7 pb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <Sparkles size={20} />
            </div>
            <h2
              id="name-prompt-title"
              className="text-xl font-bold text-stone-900"
            >
              ما اسم مشروعك؟
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
              سمِّ موقعك ليظهر في لوحة التحكم وفي رابط المشاركة.
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
                if (e.key === "Escape") close();
              }}
              placeholder="مثلاً: مقهى السرّ"
              autoFocus
              dir="auto"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => close()}
                className="rounded-xl px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100"
              >
                تخطّي
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark disabled:opacity-60"
              >
                متابعة
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
