"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
import { createPrimitive } from "@/features/primitives/factory";
import {
  PRIMITIVE_PRESETS,
  type PrimitivePresetMeta,
} from "@/features/primitives/registry";
import type { Primitive } from "@/features/primitives/types";
import type { CanvasProps } from "@/features/builder/state/types";
import { cn } from "@/shared/lib/cn";
import {
  selectSelection,
  useBuilderStore,
} from "@/features/builder/state/store";
import {
  InlinePrimitiveEditor,
  isInlineEditable,
} from "./InlinePrimitiveEditor";

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
        // overflow-x-auto so primitives positioned past the visible
        // canvas (e.g. when an exploded section sized for 1200px lands
        // in a narrower viewport) stay reachable via horizontal scroll
        // instead of being clipped off.
        className="relative overflow-x-auto overflow-y-hidden"
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
          />
        ))}
      </div>

      {/* Floating "add primitive" toolbar — pinned bottom-center so it
          can't sit on top of the SortableSection grip handle (top-start)
          or the action pill (top-end). Both are 32px squares; this toolbar
          stays well clear. */}
      {showFloatingToolbar && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-stone-200 bg-white p-1 shadow-lg"
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
}: {
  sectionId: string;
  primitive: Primitive;
  selected: boolean;
}) {
  const movePrimitive = useBuilderStore((s) => s.movePrimitive);
  const removePrimitive = useBuilderStore((s) => s.removePrimitive);
  const updatePrimitive = useBuilderStore((s) => s.updatePrimitive);
  const setSelection = useBuilderStore((s) => s.setSelection);
  const ref = useRef<HTMLDivElement>(null);

  // Drag state lives in a ref so the pointermove/up listeners can be
  // attached ONCE per drag (in onPointerDown) without re-running an effect
  // every time dx/dy update. The earlier setState-per-move approach
  // re-attached listeners constantly, opening a tiny gap where a move
  // event could land between `removeEventListener` and the next
  // `addEventListener` — that's the "drag stops responding mid-drag"
  // symptom users hit.
  // dxState is kept as React state purely for the live render below.
  const dragRef = useRef<
    | { startX: number; startY: number; dx: number; dy: number; moved: boolean }
    | null
  >(null);
  const [dxState, setDxState] = useState<{ dx: number; dy: number } | null>(
    null,
  );

  // Inline-edit state — toggled by click-while-selected or double-click.
  // Gated by `selected` in render so deselecting elsewhere implicitly
  // exits edit mode without an effect-driven setState.
  const [editing, setEditing] = useState(false);
  const isEditing = editing && selected;

  const liveX = primitive.x + (dxState?.dx ?? 0);
  const liveY = primitive.y + (dxState?.dy ?? 0);

  // NOTE: `left` (not `insetInlineStart`). The primitive's `x` is measured
  // in viewport-relative pixels (it tracks `e.clientX`), so it must anchor
  // to the LEFT edge even on this RTL page — otherwise drags read as
  // inverted (drag right, move left).
  const rotation = primitive.rotation ?? 0;
  const style: CSSProperties = {
    position: "absolute",
    left: `${liveX}px`,
    top: `${liveY}px`,
    width: `${primitive.w}px`,
    ...(primitive.h !== undefined ? { height: `${primitive.h}px` } : {}),
    cursor: isEditing ? "text" : dxState ? "grabbing" : "grab",
    touchAction: "none",
    ...(rotation !== 0
      ? { transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }
      : {}),
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (isEditing) return;
    e.stopPropagation();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      moved: false,
    };
    setDxState({ dx: 0, dy: 0 });

    // Capture the pointer so we keep receiving move/up even if the cursor
    // leaves the primitive's box.
    e.currentTarget.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      drag.dx = dx;
      drag.dy = dy;
      if (
        !drag.moved &&
        (Math.abs(dx) > MIN_DRAG_DISTANCE || Math.abs(dy) > MIN_DRAG_DISTANCE)
      ) {
        drag.moved = true;
      }
      setDxState({ dx, dy });
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };

    const onUp = () => {
      const drag = dragRef.current;
      cleanup();
      dragRef.current = null;
      setDxState(null);
      if (!drag) return;
      if (drag.moved) {
        movePrimitive(sectionId, primitive.id, { dx: drag.dx, dy: drag.dy });
      } else if (selected && isInlineEditable(primitive.type)) {
        setEditing(true);
      } else {
        setSelection({ kind: "primitive", sectionId, primitiveId: primitive.id });
      }
    };

    const onCancel = () => {
      cleanup();
      dragRef.current = null;
      setDxState(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  return (
    <div
      ref={ref}
      style={style}
      onPointerDown={onPointerDown}
      // The browser fires a synthetic click after pointerup; without this,
      // it bubbles to the parent SortableSection's onClick and overwrites
      // the primitive selection with a section selection — i.e. clicking
      // an image inside a canvas would select the canvas instead.
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        if (!isInlineEditable(primitive.type)) return;
        e.stopPropagation();
        setSelection({
          kind: "primitive",
          sectionId,
          primitiveId: primitive.id,
        });
        setEditing(true);
      }}
      className={cn(
        "select-none transition-shadow",
        isEditing && "select-text",
        selected
          ? "shadow-[0_0_0_2px_var(--color-brand)]"
          : "hover:shadow-[0_0_0_2px_rgba(232,93,93,0.35)]",
      )}
    >
      {isEditing ? (
        <InlinePrimitiveEditor
          primitive={primitive}
          onCommit={(nextProps) => {
            updatePrimitive(
              sectionId,
              primitive.id,
              (p) =>
                ({ ...p, props: nextProps }) as Primitive,
            );
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <PrimitiveRenderer primitive={primitive} positioned={false} />
      )}

      {selected && !isEditing && (
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
