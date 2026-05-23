"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Globe,
  Loader2,
  Rocket,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { cn } from "@/shared/lib/cn";
import { useProjects } from "@/features/projects";

const SLUG_HINT_RE = /^[a-z0-9-]+$/;

/**
 * Publish dialog — lets the user pick a slug for the public URL and
 * push the project live at `/sites/<slug>`. Toggling off takes the
 * project offline.
 *
 * Talks to /api/projects/[id]/publish; on success the result is
 * mirrored into the local useProjects store so the builder's status
 * pill and any open dashboards stay in sync.
 */
export function PublishModal({
  open,
  projectId,
  onClose,
}: {
  open: boolean;
  projectId: string;
  onClose: () => void;
}) {
  const project = useProjects((s) => s.projects[projectId]);
  const patchProject = (patch: Partial<NonNullable<typeof project>>) => {
    const current = useProjects.getState().projects[projectId];
    if (!current) return;
    useProjects.getState().upsert({ ...current, ...patch });
  };

  const [slug, setSlug] = useState(project?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const confirm = useConfirm();

  // Re-seed the input each time the modal opens or the project's
  // server-side slug changes.
  useEffect(() => {
    if (open) setSlug(project?.slug ?? "");
  }, [open, project?.slug]);

  const publicUrl =
    typeof window !== "undefined" && project?.slug
      ? `${window.location.origin}/sites/${project.slug}`
      : "";

  const handlePublish = async () => {
    if (!slug.trim()) {
      toast.error("اكتب الـ slug أولاً");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as
        | {
            ok: true;
            project: { id: string; slug: string; publishedAt?: number | null };
          }
        | { ok: false; error: string };
      if (!res.ok || !data.ok) {
        toast.error(
          ("error" in data && data.error) || "تعذّر النشر — حاول لاحقاً",
        );
        return;
      }
      // Mirror locally so the builder updates instantly.
      patchProject({
        slug: data.project.slug,
        published: true,
        publishedAt: data.project.publishedAt ?? Date.now(),
      });
      toast.success("الموقع منشور");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async () => {
    const ok = await confirm({
      title: "إيقاف النشر؟",
      description: `سيتم إيقاف الموقع المنشور على /sites/${project?.slug}.`,
      confirmLabel: "نعم، أوقف",
      cancelLabel: "إلغاء",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        toast.error("تعذّر إيقاف النشر");
        return;
      }
      patchProject({ published: false });
      toast.success("تم إيقاف النشر");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  };

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

  const slugLooksValid =
    slug.length === 0 || (slug.length >= 3 && SLUG_HINT_RE.test(slug));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="publish-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Rocket size={16} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    نشر الموقع
                  </h2>
                  <p className="text-xs text-stone-500">
                    اختر رابطاً عاماً لمشروعك.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {project?.published && project.slug && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    منشور الآن
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-white p-2 text-xs">
                    <Globe size={12} className="shrink-0 text-emerald-500" />
                    <span className="flex-1 truncate font-mono text-stone-700">
                      {publicUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                      aria-label="نسخ"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  الرابط (slug)
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-stone-200 bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="select-none border-e border-stone-100 bg-stone-50 px-3 py-2.5 font-mono text-xs text-stone-500">
                    /sites/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-")
                          .replace(/-{2,}/g, "-"),
                      )
                    }
                    placeholder="my-cafe"
                    className="flex-1 bg-transparent px-3 py-2.5 font-mono text-sm focus:outline-none"
                  />
                </div>
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    slugLooksValid ? "text-stone-500" : "text-rose-600",
                  )}
                >
                  {slugLooksValid
                    ? "أحرف صغيرة، أرقام، أو شرطات. مثال: my-cafe."
                    : "الـ slug لازم ≥ 3 حرف ولا يحتوي رموزاً."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 pt-4">
                {project?.published && (
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Trash2 size={12} />
                    إيقاف النشر
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={busy || !slug.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white shadow-md shadow-brand/30 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {project?.published ? "تحديث الرابط" : "نشر الآن"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
