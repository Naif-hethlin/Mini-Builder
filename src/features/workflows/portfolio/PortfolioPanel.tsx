"use client";

import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { newId } from "@/shared/lib/id";
import { useProjects } from "@/features/projects";
import type {
  PortfolioProps,
  Section,
} from "@/features/builder/state/types";

export function PortfolioPanel({ projectId }: { projectId: string }) {
  const project = useProjects((s) => s.projects[projectId]);

  const found = project?.pages
    .flatMap((page) =>
      page.design.sections.map((section) => ({ page, section })),
    )
    .find(({ section }) => section.type === "portfolio");

  const section = found?.section as
    | Extract<Section, { type: "portfolio" }>
    | undefined;
  const hostPage = found?.page;

  if (!project) return null;

  if (!section || !hostPage) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-stone-700">
          لا يوجد قسم معرض أعمال في هذا الموقع
        </p>
        <p className="mt-1 text-xs text-stone-500">
          أضف قسم 'معرض الأعمال' من المحرر، ثم ارجع هنا لإدارة الصور.
        </p>
        <Link
          href={`/builder/${projectId}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
        >
          <Edit3 size={12} />
          فتح المحرر
        </Link>
      </div>
    );
  }

  const setProps = (mutator: (p: PortfolioProps) => PortfolioProps) => {
    const nextDesign = {
      ...hostPage.design,
      sections: hostPage.design.sections.map((s) =>
        s.id === section.id && s.type === "portfolio"
          ? { ...s, props: mutator(s.props) }
          : s,
      ),
    };
    useProjects
      .getState()
      .updatePageDesign(projectId, hostPage.id, nextDesign);
  };

  const addItem = () =>
    setProps((p) => ({
      ...p,
      items: [
        ...p.items,
        { id: newId(), imageUrl: "", title: "عمل جديد", category: "" },
      ],
    }));

  const removeItem = (id: string) =>
    setProps((p) => ({
      ...p,
      items: p.items.filter((it) => it.id !== id),
    }));

  const move = (idx: number, dir: -1 | 1) =>
    setProps((p) => {
      const target = idx + dir;
      if (target < 0 || target >= p.items.length) return p;
      const items = [...p.items];
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...p, items };
    });

  const updateItem = (
    id: string,
    field: keyof PortfolioProps["items"][number],
    value: string,
  ) =>
    setProps((p) => ({
      ...p,
      items: p.items.map((it) =>
        it.id === id ? { ...it, [field]: value } : it,
      ),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          {section.props.items.length} عمل في المعرض
        </p>
        <Link
          href={`/builder/${projectId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand"
        >
          <Edit3 size={12} />
          فتح المحرر
          <ExternalLink size={10} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {section.props.items.map((item, idx) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="relative aspect-square bg-stone-100">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <ImageIcon size={28} />
                </div>
              )}
              {/* Reorder + delete */}
              <div className="absolute inset-x-2 top-2 flex justify-between gap-1">
                <div className="flex gap-1 rounded-md bg-white/90 p-0.5 shadow-sm">
                  <button
                    type="button"
                    aria-label="نقل لليمين"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="flex h-6 w-6 items-center justify-center rounded text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="نقل لليسار"
                    onClick={() => move(idx, 1)}
                    disabled={idx === section.props.items.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <ArrowLeft size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="حذف"
                  onClick={() => removeItem(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-stone-500 shadow-sm hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="space-y-2 p-3">
              <input
                type="url"
                value={item.imageUrl}
                placeholder="رابط الصورة"
                onChange={(e) =>
                  updateItem(item.id, "imageUrl", e.target.value)
                }
                className="block h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-xs"
              />
              <input
                type="text"
                value={item.title}
                placeholder="العنوان"
                onChange={(e) =>
                  updateItem(item.id, "title", e.target.value)
                }
                className="block h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
              />
              <input
                type="text"
                value={item.category}
                placeholder="التصنيف"
                onChange={(e) =>
                  updateItem(item.id, "category", e.target.value)
                }
                className="block h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-xs"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 text-stone-500 transition-colors hover:border-brand hover:text-brand"
        >
          <Plus size={20} />
          <span className="text-sm">إضافة عمل</span>
        </button>
      </div>
    </div>
  );
}
