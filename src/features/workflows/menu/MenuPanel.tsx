"use client";

import { Edit3, ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { newId } from "@/shared/lib/id";
import { useProjects } from "@/features/projects";
import type {
  MenuProps,
  Section,
} from "@/features/builder/state/types";

export function MenuPanel({ projectId }: { projectId: string }) {
  const project = useProjects((s) => s.projects[projectId]);

  // Find the first Menu section across all pages of the project.
  const found = project?.pages
    .flatMap((page) =>
      page.design.sections.map((section) => ({ page, section })),
    )
    .find(({ section }) => section.type === "menu");

  const menuSection = found?.section as
    | Extract<Section, { type: "menu" }>
    | undefined;
  const hostPage = found?.page;

  if (!project) return null;

  if (!menuSection || !hostPage) {
    return (
      <EmptyState
        href={`/builder/${projectId}`}
        title="لا يوجد قسم قائمة طعام في هذا الموقع"
        description="أضف قسم 'قائمة طعام' من المحرر، ثم ارجع هنا لإدارة الأصناف."
      />
    );
  }

  const setProps = (mutator: (p: MenuProps) => MenuProps) => {
    const nextDesign = {
      ...hostPage.design,
      sections: hostPage.design.sections.map((s) =>
        s.id === menuSection.id && s.type === "menu"
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
        {
          id: newId(),
          name: "صنف جديد",
          description: "",
          price: "0",
          imageUrl: "",
        },
      ],
    }));

  const updateItem = (
    id: string,
    field: keyof MenuProps["items"][number],
    value: string,
  ) =>
    setProps((p) => ({
      ...p,
      items: p.items.map((it) =>
        it.id === id ? { ...it, [field]: value } : it,
      ),
    }));

  const removeItem = (id: string) =>
    setProps((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">
            القائمة الحالية: {menuSection.props.items.length} صنف
          </p>
        </div>
        <Link
          href={`/builder/${projectId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand"
        >
          <Edit3 size={12} />
          فتح المحرر
          <ExternalLink size={10} />
        </Link>
      </div>

      <div className="space-y-2">
        {menuSection.props.items.map((item) => (
          <div
            key={item.id}
            className="grid items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr,1fr,90px,40px]"
          >
            <input
              type="text"
              value={item.name}
              placeholder="اسم الصنف"
              onChange={(e) => updateItem(item.id, "name", e.target.value)}
              className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
            />
            <input
              type="text"
              value={item.description}
              placeholder="وصف قصير"
              onChange={(e) =>
                updateItem(item.id, "description", e.target.value)
              }
              className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={item.price}
                placeholder="0"
                onChange={(e) =>
                  updateItem(item.id, "price", e.target.value)
                }
                className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
              />
              <span className="text-xs text-stone-400">
                {menuSection.props.currency}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label="حذف"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-stone-300 px-3 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand"
        >
          <Plus size={14} />
          إضافة صنف
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-10 text-center">
      <p className="text-sm font-medium text-stone-700">{title}</p>
      <p className="mt-1 text-xs text-stone-500">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
      >
        <Edit3 size={12} />
        فتح المحرر
      </Link>
    </div>
  );
}

// Local re-export to keep prior imports clean.
export {};
