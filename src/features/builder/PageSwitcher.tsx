"use client";

import {
  ChevronDown,
  FileText,
  Home,
  Plus,
  Settings as SettingsIcon,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { cn } from "@/shared/lib/cn";
import { useProjects, type Page } from "@/features/projects";

/**
 * Dropdown in the builder toolbar that lists every page in the project,
 * highlights the current one, and lets the user add / star / delete pages.
 *
 * Current page is reflected in the URL via `?page=<slug>` so reload / share
 * preserves the active page.
 */
export function PageSwitcher({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();

  const project = useProjects((s) => s.projects[projectId]);
  const [open, setOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Page | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!project) return null;

  const wantedSlug = searchParams.get("page");
  const sorted = [...project.pages].sort((a, b) => a.order - b.order);
  const current =
    sorted.find((p) => p.slug === wantedSlug) ??
    sorted.find((p) => p.isHome) ??
    sorted[0];

  const navigateTo = (page: Page) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page.isHome) params.delete("page");
    else params.set("page", page.slug);
    const qs = params.toString();
    router.replace(`/builder/${projectId}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
    setOpen(false);
  };

  const handleAdd = () => {
    const page = useProjects.getState().addPage(projectId);
    if (page) {
      toast.success(`أضيفت صفحة "${page.name}"`);
      navigateTo(page);
    }
  };

  const handleSetHome = (page: Page) => {
    useProjects.getState().setHomePage(projectId, page.id);
    toast.success(`"${page.name}" صارت الرئيسية`);
  };

  const handleDelete = async (page: Page) => {
    if (sorted.length === 1) {
      toast.info("لا يمكن حذف الصفحة الوحيدة");
      return;
    }
    const ok = await confirm({
      title: `حذف "${page.name}"؟`,
      description: "سيتم حذف الصفحة وكل أقسامها نهائيًا.",
      confirmLabel: "احذف",
      danger: true,
    });
    if (!ok) return;
    useProjects.getState().removePage(projectId, page.id);
    toast.success("تم الحذف");
    // If we deleted the current page, route back to whatever's now home.
    if (page.id === current?.id) {
      router.replace(`/builder/${projectId}`, { scroll: false });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        // flex + w-full + min-w-0 lets this pill USE the width its
        // wrapper gives it (the Toolbar wraps this in flex-1 on
        // mobile). Without `w-full` the inline-flex button kept its
        // natural content width and overflowed the wrapper —
        // overlapping the undo/redo pill next to it on phones.
        className="flex h-8 w-full min-w-0 items-center gap-1.5 rounded-md border border-stone-200 px-2 text-xs font-medium text-stone-700 transition-colors hover:border-brand hover:text-brand"
      >
        <FileText size={12} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-start">
          {current?.name ?? "صفحة"}
        </span>
        <ChevronDown size={12} className="shrink-0 text-stone-400" />
      </button>

      {open && (
        <div className="absolute top-full start-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {sorted.map((page) => {
              const isCurrent = page.id === current?.id;
              return (
                <li key={page.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                      isCurrent
                        ? "bg-brand-light text-brand"
                        : "text-stone-700 hover:bg-stone-50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => navigateTo(page)}
                      className="flex flex-1 items-center gap-2 truncate text-start text-xs font-medium"
                    >
                      {page.isHome ? (
                        <Home size={12} />
                      ) : (
                        <FileText size={12} />
                      )}
                      <span className="truncate">{page.name}</span>
                      <span className="ms-auto text-[10px] text-stone-400">
                        /{page.slug}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenameTarget(page)}
                      aria-label="إعدادات الصفحة"
                      title="إعدادات الصفحة"
                      className="flex h-6 w-6 items-center justify-center rounded text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-stone-700"
                    >
                      <SettingsIcon size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-1.5 border-t border-stone-100 bg-stone-50 px-2 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
          >
            <Plus size={12} />
            صفحة جديدة
          </button>
        </div>
      )}

      {renameTarget && (
        <PageSettingsDialog
          projectId={projectId}
          page={renameTarget}
          onClose={() => setRenameTarget(null)}
          onSetHome={() => {
            handleSetHome(renameTarget);
            setRenameTarget(null);
          }}
          onDelete={() => {
            handleDelete(renameTarget);
            setRenameTarget(null);
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// PageSettingsDialog — rename + slug + set-home + delete
// =============================================================================

function PageSettingsDialog({
  projectId,
  page,
  onClose,
  onSetHome,
  onDelete,
}: {
  projectId: string;
  page: Page;
  onClose: () => void;
  onSetHome: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [slugError, setSlugError] = useState<string | null>(null);

  const dirty = name !== page.name || slug !== page.slug;

  const handleSave = () => {
    if (name !== page.name) {
      useProjects.getState().renamePage(projectId, page.id, name);
    }
    if (slug !== page.slug) {
      const result = useProjects
        .getState()
        .setPageSlug(projectId, page.id, slug);
      if (!result.ok) {
        setSlugError(result.error);
        return;
      }
    }
    setSlugError(null);
    toast.success("تم الحفظ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-stone-900">
          إعدادات الصفحة
        </h3>
        <p className="mt-1 text-xs text-stone-500">"{page.name}"</p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-stone-700">
              اسم الصفحة
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-700">
              الـ slug في الرابط
            </label>
            <div className="mt-1 flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-base focus-within:border-brand sm:text-sm">
              <span className="text-stone-400">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugError(null);
                  setSlug(e.target.value);
                }}
                className="flex-1 bg-transparent focus:outline-none"
              />
            </div>
            {slugError && (
              <p className="mt-1 text-xs text-red-600">{slugError}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
          <div className="flex gap-1">
            {!page.isHome && (
              <button
                type="button"
                onClick={onSetHome}
                title="اجعل هذه الرئيسية"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-stone-200 px-2 text-xs text-stone-600 hover:border-brand hover:text-brand"
              >
                <Star size={12} />
                اجعلها الرئيسية
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 size={12} />
              حذف
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="rounded-xl bg-brand px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-dark disabled:opacity-50"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
