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

  // Live resize state — populated while the user drags one of the eight
  // bounding-box handles. Same one-listener-per-drag pattern as move.
  const resizeRef = useRef<{
    anchor: ResizeAnchor;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origLeft: number;
    origTop: number;
  } | null>(null);
  const [liveResize, setLiveResize] = useState<{
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);

  // Inline-edit state — toggled by click-while-selected or double-click.
  // Gated by `selected` in render so deselecting elsewhere implicitly
  // exits edit mode without an effect-driven setState.
  const [editing, setEditing] = useState(false);
  const isEditing = editing && selected;

  const liveX = liveResize?.x ?? primitive.x + (dxState?.dx ?? 0);
  const liveY = liveResize?.y ?? primitive.y + (dxState?.dy ?? 0);
  const liveW = liveResize?.w ?? primitive.w;
  const liveH = liveResize?.h ?? primitive.h;

  // NOTE: `left` (not `insetInlineStart`). The primitive's `x` is measured
  // in viewport-relative pixels (it tracks `e.clientX`), so it must anchor
  // to the LEFT edge even on this RTL page — otherwise drags read as
  // inverted (drag right, move left).
  const rotation = primitive.rotation ?? 0;
  const style: CSSProperties = {
    position: "absolute",
    left: `${liveX}px`,
    top: `${liveY}px`,
    width: `${liveW}px`,
    ...(liveH !== undefined ? { height: `${liveH}px` } : {}),
    cursor: isEditing ? "text" : dxState ? "grabbing" : "grab",
    touchAction: "none",
    ...(rotation !== 0
      ? { transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }
      : {}),
  };

  const startResize = (anchor: ResizeAnchor, e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // Don't let the underlying move-drag fire when the user grabs a handle.
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Snapshot the primitive's current geometry. If h is missing we seed it
    // from the rendered box so the user can shrink/grow it freely.
    const measuredH =
      primitive.h ??
      ref.current?.getBoundingClientRect().height ??
      primitive.w;

    resizeRef.current = {
      anchor,
      startX: e.clientX,
      startY: e.clientY,
      origW: primitive.w,
      origH: measuredH,
      origLeft: primitive.x,
      origTop: primitive.y,
    };
    setLiveResize({
      w: primitive.w,
      h: measuredH,
      x: primitive.x,
      y: primitive.y,
    });

    // Latest computed geometry — kept in scope of this drag so onUp can
    // commit the final value without racing the React state batch.
    let last = {
      w: primitive.w,
      h: measuredH,
      x: primitive.x,
      y: primitive.y,
    };

    const onMove = (ev: PointerEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      last = applyResize(r, ev.clientX, ev.clientY);
      setLiveResize(last);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    const onUp = () => {
      const r = resizeRef.current;
      cleanup();
      resizeRef.current = null;
      setLiveResize(null);
      if (!r) return;
      updatePrimitive(
        sectionId,
        primitive.id,
        (p) =>
          ({
            ...p,
            w: last.w,
            h: last.h,
            x: last.x,
            y: last.y,
          }) as Primitive,
      );
    };
    const onCancel = () => {
      cleanup();
      resizeRef.current = null;
      setLiveResize(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
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
        <>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removePrimitive(sectionId, primitive.id);
            }}
            aria-label="حذف"
            className="absolute -top-3 -end-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
          >
            <Trash2 size={12} />
          </button>

          {RESIZE_HANDLES.map(({ anchor, className, cursor }) => (
            <span
              key={anchor}
              role="presentation"
              onPointerDown={(e) => startResize(anchor, e)}
              className={cn(
                "absolute z-10 h-2.5 w-2.5 rounded-sm border border-brand bg-white shadow-sm",
                className,
              )}
              style={{ cursor, touchAction: "none" }}
            />
          ))}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Resize math — eight anchor points around the primitive's bounding box.
// =============================================================================

type ResizeAnchor = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const MIN_RESIZE = 20;

const RESIZE_HANDLES: ReadonlyArray<{
  anchor: ResizeAnchor;
  className: string;
  cursor: string;
}> = [
  { anchor: "nw", className: "-top-1.5 -left-1.5", cursor: "nwse-resize" },
  { anchor: "n", className: "-top-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { anchor: "ne", className: "-top-1.5 -right-1.5", cursor: "nesw-resize" },
  { anchor: "e", className: "top-1/2 -right-1.5 -translate-y-1/2", cursor: "ew-resize" },
  { anchor: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
  { anchor: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { anchor: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { anchor: "w", className: "top-1/2 -left-1.5 -translate-y-1/2", cursor: "ew-resize" },
];

function applyResize(
  r: {
    anchor: ResizeAnchor;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origLeft: number;
    origTop: number;
  },
  clientX: number,
  clientY: number,
): { w: number; h: number; x: number; y: number } {
  const dx = clientX - r.startX;
  const dy = clientY - r.startY;

  let w = r.origW;
  let h = r.origH;
  let x = r.origLeft;
  let y = r.origTop;

  // Horizontal: anchors on the east edge grow width with +dx; west-edge
  // anchors shrink width AND move left.
  if (r.anchor === "ne" || r.anchor === "e" || r.anchor === "se") {
    w = Math.max(MIN_RESIZE, r.origW + dx);
  } else if (r.anchor === "nw" || r.anchor === "w" || r.anchor === "sw") {
    const nextW = Math.max(MIN_RESIZE, r.origW - dx);
    x = r.origLeft + (r.origW - nextW);
    w = nextW;
  }

  // Vertical: south-edge anchors grow height with +dy; north-edge anchors
  // shrink height AND move top down.
  if (r.anchor === "sw" || r.anchor === "s" || r.anchor === "se") {
    h = Math.max(MIN_RESIZE, r.origH + dy);
  } else if (r.anchor === "nw" || r.anchor === "n" || r.anchor === "ne") {
    const nextH = Math.max(MIN_RESIZE, r.origH - dy);
    y = r.origTop + (r.origH - nextH);
    h = nextH;
  }

  return { w: Math.round(w), h: Math.round(h), x: Math.round(x), y: Math.round(y) };
}
