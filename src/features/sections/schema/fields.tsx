"use client";

import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { useId, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { FieldSchema, FormValue } from "./types";

// =============================================================================
// Shared input styles
// =============================================================================

const inputBase =
  "block w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 focus:outline-offset-0";

const fieldLabel = "block text-xs font-medium text-stone-700";

// =============================================================================
// Primitive fields
// =============================================================================

export function TextField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "text" | "url" | "image-url" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>
      <input
        id={id}
        type={field.kind === "text" ? "text" : "url"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={cn(inputBase, "h-10")}
      />
    </div>
  );
}

export function TextareaField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "textarea" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>
      <textarea
        id={id}
        value={value ?? ""}
        rows={field.rows ?? 3}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={cn(inputBase, "py-2")}
      />
    </div>
  );
}

export function SelectField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "select" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputBase, "h-10 appearance-none ps-3 pe-9")}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Composite fields (Link, ToggleableLink, List)
// =============================================================================

type LinkValue = { label: string; href: string };
type ToggleableLinkValue = LinkValue & { show: boolean };

export function LinkField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "link" }>;
  value: LinkValue;
  onChange: (next: LinkValue) => void;
}) {
  const safe: LinkValue = value ?? { label: "", href: "" };
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className={fieldLabel}>{field.label}</p>
      <input
        type="text"
        value={safe.label}
        placeholder="نص الزر"
        onChange={(e) => onChange({ ...safe, label: e.target.value })}
        className={cn(inputBase, "h-9 bg-white")}
      />
      <input
        type="url"
        value={safe.href}
        placeholder="https://"
        onChange={(e) => onChange({ ...safe, href: e.target.value })}
        className={cn(inputBase, "h-9 bg-white")}
      />
    </div>
  );
}

export function ToggleableLinkField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "toggleable-link" }>;
  value: ToggleableLinkValue;
  onChange: (next: ToggleableLinkValue) => void;
}) {
  const safe: ToggleableLinkValue = value ?? {
    label: "",
    href: "",
    show: true,
  };
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <p className={fieldLabel}>{field.label}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            checked={safe.show}
            onChange={(e) => onChange({ ...safe, show: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300 text-brand focus:ring-brand"
          />
          إظهار
        </label>
      </div>
      {safe.show && (
        <>
          <input
            type="text"
            value={safe.label}
            placeholder="نص الزر"
            onChange={(e) => onChange({ ...safe, label: e.target.value })}
            className={cn(inputBase, "h-9 bg-white")}
          />
          <input
            type="url"
            value={safe.href}
            placeholder="https://"
            onChange={(e) => onChange({ ...safe, href: e.target.value })}
            className={cn(inputBase, "h-9 bg-white")}
          />
        </>
      )}
    </div>
  );
}

// =============================================================================
// List field — handles add/remove/reorder of repeating sub-forms.
// The actual sub-form rendering is delegated back to the Form component via
// the `Renderer` prop to avoid a circular import.
// =============================================================================

export function ListField({
  field,
  value,
  onChange,
  Renderer,
}: {
  field: Extract<FieldSchema, { kind: "list" }>;
  value: FormValue[];
  onChange: (next: FormValue[]) => void;
  Renderer: (props: {
    value: FormValue;
    schema: FieldSchema[];
    onChange: (next: FormValue) => void;
  }) => ReactElement;
}) {
  const items: FormValue[] = Array.isArray(value) ? value : [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const update = (next: FormValue[]) => onChange(next);

  const addItem = () => {
    const created = field.createItem();
    update([...items, created]);
    setOpenIdx(items.length);
  };

  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx));
    if (openIdx === idx) setOpenIdx(null);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    update(copy);
    if (openIdx === idx) setOpenIdx(target);
  };

  const updateItem = (idx: number, next: FormValue) => {
    update(items.map((item, i) => (i === idx ? next : item)));
  };

  const atMax = field.max !== undefined && items.length >= field.max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={fieldLabel}>{field.label}</p>
        <span className="text-xs text-stone-400">{items.length}</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          const title =
            field.itemTitle?.(item, idx) ?? `العنصر ${idx + 1}`;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                  aria-label="نقل لأعلى"
                >
                  <GripVertical size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex-1 truncate text-right text-xs font-medium text-stone-700"
                >
                  {title}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-stone-400 hover:text-brand"
                  aria-label="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {isOpen && (
                <div className="space-y-3 border-t border-stone-100 bg-stone-50 p-3">
                  <Renderer
                    value={item}
                    schema={field.itemSchema}
                    onChange={(next) => updateItem(idx, next)}
                  />
                  <div className="flex justify-end gap-1 text-xs text-stone-500">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="rounded-md px-2 py-1 hover:bg-stone-100 disabled:opacity-40"
                    >
                      نقل للأسفل
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        disabled={atMax}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
      >
        <Plus size={14} />
        إضافة عنصر
      </button>
    </div>
  );
}
