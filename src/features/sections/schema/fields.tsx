"use client";

import {
  ChevronDown,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { ReactElement } from "react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/cn";
import { Icon as IconifyIcon } from "@iconify/react";
import {
  ICON_CATEGORIES,
  normalizeIconName,
  searchIcons,
} from "@/features/primitives/Icon/library";
import {
  SHAPE_LIBRARY,
  SHAPE_KIND_KEYS,
  getShape,
} from "@/features/primitives/Shape/library";
import { useEffect } from "react";
import type { FieldSchema, FormValue } from "./types";

// =============================================================================
// Shared input styles
// =============================================================================

// iOS Safari zooms into any input <16px on focus. Mobile-first: 16px on
// phones (text-base), 14px on tablet+ (sm:text-sm) where there's no zoom
// penalty.
const inputBase =
  "block w-full rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 focus:outline-offset-0 sm:text-sm";

const fieldLabel = "block text-xs font-medium text-stone-700";

// =============================================================================
// Primitive fields
// =============================================================================

export function TextField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "text" | "url" }>;
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
// Image URL field — upload-from-PC + URL input + live preview.
//
// Uploaded files are resized client-side (max 1600px on the long edge,
// JPEG q=0.85) and stored as data URLs so the design JSON stays
// self-contained — no server / object-store dependency.
// =============================================================================

const MAX_IMAGE_DIMENSION = 1600;
const MAX_FILE_SIZE_MB = 12;
const JPEG_QUALITY = 0.85;

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("لم نتمكن من قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ملف الصورة تالف"));
    img.src = src;
  });
}

/**
 * Read a file → data URL, then downscale via <canvas> if it exceeds the
 * max dimension. PNGs with transparency are re-encoded as JPEG to shrink
 * size — fine for photo content, less ideal for logos. Acceptable trade
 * since the field is mostly used for photo backgrounds.
 */
async function uploadToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("الملف ليس صورة");
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`الحجم أكبر من ${MAX_FILE_SIZE_MB} ميجا`);
  }

  const initialDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(initialDataUrl);

  // Already small enough → store as-is to preserve format/quality.
  if (
    img.width <= MAX_IMAGE_DIMENSION &&
    img.height <= MAX_IMAGE_DIMENSION
  ) {
    return initialDataUrl;
  }

  const scale = MAX_IMAGE_DIMENSION / Math.max(img.width, img.height);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return initialDataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function ImageUrlField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "image-url" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await uploadToDataUrl(file);
      onChange(dataUrl);
      toast.success("تم رفع الصورة");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "تعذّر رفع الصورة";
      toast.error(message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isDataUrl = value.startsWith("data:");
  const hasValue = value.length > 0;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>

      {/* Live preview / drop target */}
      <div
        className={cn(
          "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50",
          hasValue && "border-solid border-stone-200 bg-white",
        )}
      >
        {hasValue ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="معاينة"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="إزالة الصورة"
              title="إزالة الصورة"
              className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900/80 text-white shadow-md hover:bg-stone-900"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-stone-400">
            <ImagePlus size={28} strokeWidth={1.5} />
            <span className="text-[11px] font-medium">لا توجد صورة</span>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-brand">
            جاري الرفع…
          </div>
        )}
      </div>

      {/* Upload button + hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload size={14} />
        {hasValue ? "استبدل الصورة" : "رفع من جهازك"}
      </button>

      {/* URL input — hidden behind a disclosure when a data URL is set so
          the giant base64 string doesn't fill the panel. */}
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between text-[11px] font-medium text-stone-500 hover:text-stone-700">
          <span>{isDataUrl ? "أو الصق رابطاً" : "أو الصق رابط صورة"}</span>
          <ChevronDown
            size={12}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <input
          id={id}
          type="url"
          value={isDataUrl ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "https://…"}
          className={cn(inputBase, "mt-2 h-9 text-base sm:text-xs")}
        />
      </details>
    </div>
  );
}

// =============================================================================
// Color field — swatch button that opens a popover containing a native color
// wheel, brand + neutral preset swatches, and a hex text input. Edits flow
// straight to onChange so the canvas updates live as the user drags the
// color wheel.
// =============================================================================

const COLOR_PRESETS = [
  // Brand
  "#e85d5d",
  "#c44e4e",
  "#f28b82",
  "#fdeeea",
  // Neutrals
  "#000000",
  "#1c1917",
  "#475569",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
  "#f1f5f9",
  "#ffffff",
  // Warm / cool accents
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

// Loose hex validator — accepts #abc, #abcd, #abcdef, #abcdef12.
const HEX_RE = /^#?[0-9a-fA-F]{3,8}$/;

function normalizeHex(input: string): string | null {
  const trimmed = input.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function ColorField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "color" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  // The native <input type="color"> can't represent shorthand or transparency,
  // so we feed it a normalized 6-digit hex; if `value` is bad we fall back to
  // black so the wheel still opens.
  const nativeColorValue =
    value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-2 text-start text-sm transition-colors hover:border-brand focus:outline focus:outline-2 focus:outline-brand/30",
          open && "border-brand",
        )}
      >
        <span
          aria-hidden
          className="h-7 w-7 shrink-0 rounded-md border border-stone-200 shadow-inner"
          style={{ background: value || "transparent" }}
        />
        <span className="flex-1 truncate font-mono text-xs text-stone-700">
          {value || "بدون لون"}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-stone-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ColorPopover
          value={value}
          nativeValue={nativeColorValue}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function ColorPopover({
  value,
  nativeValue,
  onChange,
  onClose,
}: {
  value: string;
  nativeValue: string;
  onChange: (color: string) => void;
  onClose: () => void;
}) {
  // The hex input is uncontrolled — `defaultValue` seeds it from the upstream
  // value, and the `key={value}` on the input re-mounts it whenever a preset
  // or the wheel updates the value, so the displayed text stays in sync
  // without a synchronous setState-in-render dance.
  const commitHex = (raw: string) => {
    const next = normalizeHex(raw);
    if (next && next !== value) onChange(next);
  };

  return (
    <>
      {/* Backdrop — click anywhere outside to close. */}
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-transparent"
      />
      <div className="absolute z-40 mt-1 w-full rounded-xl border border-stone-200 bg-white p-3 shadow-xl">
        {/* Native color wheel — full-width swatch you can drag inside. */}
        <label className="mb-2 flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2">
          <input
            type="color"
            value={nativeValue}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <span className="text-xs font-medium text-stone-600">
            اختر لوناً من العجلة
          </span>
        </label>

        {/* Preset swatches */}
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
            ألوان جاهزة
          </p>
          <div className="grid grid-cols-10 gap-1">
            {COLOR_PRESETS.map((c) => {
              const active = c.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  title={c}
                  onClick={() => onChange(c)}
                  className={cn(
                    "h-6 w-6 rounded-md border transition-transform hover:scale-110",
                    active
                      ? "border-stone-900 ring-2 ring-brand"
                      : "border-stone-200",
                  )}
                  style={{ background: c }}
                />
              );
            })}
          </div>
        </div>

        {/* Hex input — uncontrolled; re-keyed on value to refresh defaultValue. */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
            HEX
          </p>
          <input
            key={value}
            type="text"
            defaultValue={value}
            onBlur={(e) => commitHex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitHex((e.target as HTMLInputElement).value);
                onClose();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="#000000"
            className={cn(inputBase, "h-9 font-mono text-base sm:text-xs")}
          />
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Icon picker — backed by Iconify (~200K icons across many collections).
//
// Empty query → grid of curated suggestions grouped by category.
// Non-empty query → debounced fetch to https://api.iconify.design/search.
//
// Stores the Iconify icon id (e.g. "lucide:sparkles", "mdi:home") in the
// form value. The renderer hands the same id to <IconifyIcon /> which
// streams the SVG from the Iconify CDN on first use and caches it.
// =============================================================================

const SEARCH_DEBOUNCE_MS = 220;

export function IconField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "icon" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedValue = normalizeIconName(value);

  // Debounced Iconify search whenever `query` changes. The synchronous
  // state changes (set loading on, clear results/errors) happen in the
  // input's onChange handler so this effect only kicks off the async
  // fetch and writes its result back — no setState-in-effect-body lint.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchIcons(q, 80, controller.signal)
        .then((icons) => {
          setResults(icons);
          setLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setError(err instanceof Error ? err.message : "تعذّر البحث");
          setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (next.trim()) {
      // Active query → flip into loading mode immediately so the user
      // sees feedback before the debounced fetch fires.
      setLoading(true);
      setError(null);
    } else {
      setResults(null);
      setLoading(false);
      setError(null);
    }
  };

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 text-start text-sm transition-colors hover:border-brand focus:outline focus:outline-2 focus:outline-brand/30",
          open && "border-brand",
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-50 text-stone-700">
          <IconifyIcon icon={normalizedValue} width={16} height={16} />
        </span>
        <span className="flex-1 truncate font-mono text-[11px] text-stone-700">
          {normalizedValue}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-stone-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
          />
          <div className="absolute z-40 mt-1 max-h-[460px] w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
            {/* Search */}
            <div className="border-b border-stone-100 p-2">
              <input
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="ابحث في 200,000+ أيقونة…"
                autoFocus
                className={cn(inputBase, "h-9 text-base sm:text-xs")}
              />
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2">
              {query.trim() ? (
                loading ? (
                  <p className="px-2 py-6 text-center text-xs text-stone-500">
                    جاري البحث…
                  </p>
                ) : error ? (
                  <p className="px-2 py-6 text-center text-xs text-rose-600">
                    {error}
                  </p>
                ) : !results || results.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-stone-500">
                    لا نتائج لـ &quot;{query}&quot;
                  </p>
                ) : (
                  <IconGrid
                    names={results}
                    activeName={normalizedValue}
                    onPick={(n) => {
                      onChange(n);
                      setOpen(false);
                    }}
                  />
                )
              ) : (
                ICON_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="mb-3 last:mb-0">
                    <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                      {cat.label}
                    </p>
                    <IconGrid
                      names={cat.icons}
                      activeName={normalizedValue}
                      onPick={(n) => {
                        onChange(n);
                        setOpen(false);
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer attribution / hint */}
            <div className="border-t border-stone-100 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500">
              {results
                ? `${results.length} نتيجة من Iconify`
                : "اكتب اسماً للبحث في كل المكتبات"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function IconGrid({
  names,
  activeName,
  onPick,
}: {
  names: string[];
  activeName: string;
  onPick: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {names.map((name) => {
        const active = name === activeName;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPick(name)}
            aria-label={name}
            title={name}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-brand-light hover:text-brand",
              active && "bg-brand-light text-brand ring-2 ring-brand",
            )}
          >
            <IconifyIcon icon={name} width={16} height={16} />
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Shape picker — preview button + popover with the curated SVG library.
// Stores the shape kind (string) in the form value.
// =============================================================================

export function ShapeField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { kind: "shape" }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const current = getShape(value || "square");

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {field.label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 text-start text-sm transition-colors hover:border-brand focus:outline focus:outline-2 focus:outline-brand/30",
          open && "border-brand",
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-50 text-stone-700">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-4 w-4"
          >
            <path d={current.path} fill="currentColor" />
          </svg>
        </span>
        <span className="flex-1 truncate text-xs font-medium text-stone-700">
          {current.label}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-stone-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
          />
          <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="grid grid-cols-5 gap-1.5">
                {SHAPE_KIND_KEYS.map((kind) => {
                  const def = SHAPE_LIBRARY[kind];
                  const active = kind === value;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => {
                        onChange(kind);
                        setOpen(false);
                      }}
                      title={def.label}
                      aria-label={def.label}
                      className={cn(
                        "flex aspect-square w-full items-center justify-center rounded-md border border-stone-100 bg-white p-2 text-stone-600 transition-colors hover:bg-brand-light hover:text-brand",
                        active && "bg-brand-light text-brand ring-2 ring-brand",
                      )}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-8 w-8"
                      >
                        <path d={def.path} fill="currentColor" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
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
                  className="flex-1 truncate text-start text-xs font-medium text-stone-700"
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
