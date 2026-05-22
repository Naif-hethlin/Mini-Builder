"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
import { createPrimitive } from "@/features/primitives/factory";
import {
  PRIMITIVE_PRESETS,
  type PrimitivePresetMeta,
} from "@/features/primitives/registry";
import type { CanvasProps } from "@/features/builder/state/types";
import { cn } from "@/shared/lib/cn";
import {
  selectSelection,
  useBuilderStore,
} from "@/features/builder/state/store";

const BG_CLASS: Record<CanvasProps["background"], string> = {
  transparent: "",
  white: "bg-white",
  stone: "bg-stone-50",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
};

/**
 * Interactive Canvas wrapper used in the builder. Renders the same canvas
 * background + primitives, but each primitive is wrapped in a draggable,
 * clickable shell so the user can position and select it.
 *
 * Mobile flow-fallback is NOT applied here — the builder is desktop-first.
 * The runtime renderer (sections/Canvas/Render.tsx) handles mobile stacking.
 */
export function CanvasEditor({
  sectionId,
  props,
}: {
  sectionId: string;
  props: CanvasProps;
}) {
  const selection = useBuilderStore(selectSelection);
  const setSelection = useBuilderStore((s) => s.setSelection);
  const addPrimitive = useBuilderStore((s) => s.addPrimitive);

  const isCanvasSelected =
    selection.kind === "section" && selection.sectionId === sectionId;
  const isAnyPrimitiveSelectedHere =
    selection.kind === "primitive" && selection.sectionId === sectionId;
  const showFloatingToolbar = isCanvasSelected || isAnyPrimitiveSelectedHere;

  const handleAdd = (type: PrimitivePresetMeta["type"]) => {
    const primitive = createPrimitive(type);
    addPrimitive(sectionId, primitive);
    setSelection({
      kind: "primitive",
      sectionId,
      primitiveId: primitive.id,
    });
  };

  return (
    <div className={`relative ${BG_CLASS[props.background]}`}>
      <div
        className="relative overflow-hidden"
        style={{ minHeight: props.height }}
      >
        {props.primitives.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <p className="max-w-sm text-sm text-stone-400">
              لوحة فارغة. اضغط على القسم لإظهار شريط الإضافة، ثم أضف نصًا
              أو زرًا أو صورة وحركها بحرية.
            </p>
          </div>
        )}

        {props.primitives.map((p) => (
          <DraggablePrimitive
            key={p.id}
            sectionId={sectionId}
            primitive={p}
            selected={
              selection.kind === "primitive" &&
              selection.sectionId === sectionId &&
              selection.primitiveId === p.id
            }
            onSelect={() =>
              setSelection({
                kind: "primitive",
                sectionId,
                primitiveId: p.id,
              })
            }
          />
        ))}
      </div>

      {/* Floating "add primitive" toolbar */}
      {showFloatingToolbar && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute top-3 start-3 z-20 flex items-center gap-0.5 rounded-xl border border-stone-200 bg-white p-1 shadow-lg"
        >
          <span className="px-2 text-[10px] font-medium text-stone-500">
            <Plus size={12} className="inline" /> أضف
          </span>
          {PRIMITIVE_PRESETS.map(({ type, label, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleAdd(type)}
              title={label}
              aria-label={label}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-stone-600 transition-colors hover:bg-brand-light hover:text-brand"
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DraggablePrimitive — pointer-drag wrapper around one primitive
// =============================================================================

const MIN_DRAG_DISTANCE = 4;

function DraggablePrimitive({
  sectionId,
  primitive,
  selected,
  onSelect,
}: {
  sectionId: string;
  primitive: { id: string; x: number; y: number; w: number; h?: number };
  selected: boolean;
  onSelect: () => void;
}) {
  const movePrimitive = useBuilderStore((s) => s.movePrimitive);
  const removePrimitive = useBuilderStore((s) => s.removePrimitive);
  const ref = useRef<HTMLDivElement>(null);

  // Local drag state — only commits to the store on pointer up.
  const [drag, setDrag] = useState<
    | { startX: number; startY: number; dx: number; dy: number; moved: boolean }
    | null
  >(null);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const moved =
        drag.moved ||
        Math.abs(dx) > MIN_DRAG_DISTANCE ||
        Math.abs(dy) > MIN_DRAG_DISTANCE;
      setDrag({ ...drag, dx, dy, moved });
    };
    const onUp = () => {
      if (drag.moved) {
        movePrimitive(sectionId, primitive.id, {
          dx: drag.dx,
          dy: drag.dy,
        });
      } else {
        onSelect();
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, sectionId, primitive.id, movePrimitive, onSelect]);

  const liveX = primitive.x + (drag?.dx ?? 0);
  const liveY = primitive.y + (drag?.dy ?? 0);

  const style: CSSProperties = {
    position: "absolute",
    insetInlineStart: `${liveX}px`,
    top: `${liveY}px`,
    width: `${primitive.w}px`,
    ...(primitive.h !== undefined ? { height: `${primitive.h}px` } : {}),
    cursor: drag ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={ref}
      style={style}
      onPointerDown={(e) => {
        // ignore right-click + secondary buttons
        if (e.button !== 0) return;
        e.stopPropagation();
        setDrag({
          startX: e.clientX,
          startY: e.clientY,
          dx: 0,
          dy: 0,
          moved: false,
        });
      }}
      className={cn(
        "select-none transition-shadow",
        selected
          ? "shadow-[0_0_0_2px_var(--color-brand)]"
          : "hover:shadow-[0_0_0_2px_rgba(232,93,93,0.35)]",
      )}
    >
      <PrimitiveRenderer
        primitive={primitive as Parameters<typeof PrimitiveRenderer>[0]["primitive"]}
        positioned={false}
      />

      {selected && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removePrimitive(sectionId, primitive.id);
          }}
          aria-label="حذف"
          className="absolute -top-3 -end-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
