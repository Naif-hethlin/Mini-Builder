"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Trash2,
} from "lucide-react";
import type { CSSProperties } from "react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { cn } from "@/shared/lib/cn";
import type { Section } from "./state/types";

/**
 * One canvas section, draggable via its grip handle and clickable to select.
 *
 * Hover (or selection) reveals two floating toolbars:
 *   - Drag handle in the top-start corner (right in RTL).
 *   - Action pill in the top-end corner: move up / move down / duplicate /
 *     delete.
 */
export function SortableSection({
  section,
  selected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  selected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
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

  const reveal = selected
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

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

      {/* Drag handle — top-start */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="اسحب لإعادة الترتيب"
        className={cn(
          "absolute top-2 start-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 shadow-sm transition-opacity active:cursor-grabbing",
          reveal,
        )}
      >
        <GripVertical size={14} />
      </button>

      {/* Action pill — top-end */}
      <div
        className={cn(
          "absolute top-2 end-2 z-10 flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5 shadow-sm transition-opacity",
          reveal,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ToolbarButton
          icon={<ArrowUp size={14} />}
          label="نقل لأعلى"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        />
        <ToolbarButton
          icon={<ArrowDown size={14} />}
          label="نقل لأسفل"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        />
        <ToolbarButton
          icon={<Copy size={14} />}
          label="نسخ"
          onClick={onDuplicate}
        />
        <ToolbarButton
          icon={<Trash2 size={14} />}
          label="حذف"
          onClick={onDelete}
          danger
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        danger
          ? "text-stone-500 hover:bg-red-50 hover:text-red-600"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
      )}
    >
      {icon}
    </button>
  );
}
