"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties } from "react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { cn } from "@/shared/lib/cn";
import type { Section } from "./state/types";

/**
 * One canvas section, draggable via its grip handle and clickable to select.
 *
 * Drag listeners are attached to the handle only, so clicks on the section
 * body still toggle selection. PointerSensor's activationConstraint in the
 * parent Canvas avoids accidental drags when the user clicks.
 */
export function SortableSection({
  section,
  selected,
  onSelect,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative cursor-pointer outline-none transition-shadow",
        isDragging && "opacity-60 shadow-lg",
        selected
          ? "shadow-[inset_0_0_0_2px_var(--color-brand)]"
          : "hover:shadow-[inset_0_0_0_2px_rgba(232,93,93,0.25)]",
      )}
    >
      <SectionRenderer section={section} />

      {/* Drag handle — top-start (right in RTL), visible on hover or when selected */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="اسحب لإعادة الترتيب"
        className={cn(
          "absolute top-2 start-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 shadow-sm transition-opacity active:cursor-grabbing",
          selected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
      >
        <GripVertical size={14} />
      </button>
    </div>
  );
}
