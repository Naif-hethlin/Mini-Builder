"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { newId } from "@/shared/lib/id";
import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
import type {
  ButtonPrimitiveProps,
  HeadingPrimitiveProps,
  ListPrimitiveProps,
  Primitive,
  TextPrimitiveProps,
} from "@/features/primitives/types";

// =============================================================================
// Inline editor — swap the primitive's read-only renderer for an editable
// surface (textarea / input / contenteditable list) while keeping the same
// visual styling, so the user can type directly on the canvas.
//
// onCommit fires on blur or Enter (where Enter doesn't conflict with newline
// behaviour); onCancel fires on Escape. Both exit the editor; the parent
// (DraggablePrimitive) decides what to do with the result.
//
// Images are not inline-editable — the URL picker lives in the EditPanel.
// =============================================================================

export function InlinePrimitiveEditor({
  primitive,
  onCommit,
  onCancel,
}: {
  primitive: Primitive;
  onCommit: (nextProps: Primitive["props"]) => void;
  onCancel: () => void;
}) {
  switch (primitive.type) {
    case "text":
      return (
        <TextEditor
          props={primitive.props}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    case "heading":
      return (
        <HeadingEditor
          props={primitive.props}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    case "button":
      return (
        <ButtonEditor
          props={primitive.props}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    case "list":
      return (
        <ListEditor
          props={primitive.props}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    case "image":
    case "shape":
    case "icon":
      return <PrimitiveRenderer primitive={primitive} positioned={false} />;
  }
}

/** Returns true if the primitive supports inline content editing. */
export function isInlineEditable(type: Primitive["type"]): boolean {
  return type !== "image" && type !== "shape" && type !== "icon";
}

// -----------------------------------------------------------------------------
// Shared
// -----------------------------------------------------------------------------

const WEIGHT_CLASS: Record<TextPrimitiveProps["weight"], string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const ALIGN_CLASS: Record<TextPrimitiveProps["align"], string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const HEADING_LEVEL_CLASS: Record<HeadingPrimitiveProps["level"], string> = {
  1: "text-4xl font-extrabold leading-tight",
  2: "text-3xl font-bold leading-tight",
  3: "text-2xl font-semibold leading-snug",
  4: "text-xl font-semibold leading-snug",
};

const BUTTON_VARIANT_CLASS: Record<ButtonPrimitiveProps["variant"], string> = {
  solid: "bg-brand text-white",
  outline: "border-2 border-brand text-brand bg-transparent",
  ghost: "text-brand bg-transparent",
};

const BUTTON_SIZE_CLASS: Record<ButtonPrimitiveProps["size"], string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

const FOCUS_RING = "outline-none ring-2 ring-brand ring-offset-1";

// Grow a textarea/input to fit content — keeps the inline editor visually
// flush with the primitive's normal height.
function useAutosize(ref: { current: HTMLTextAreaElement | null }) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });
}

// -----------------------------------------------------------------------------
// Text
// -----------------------------------------------------------------------------

function TextEditor({
  props,
  onCommit,
  onCancel,
}: {
  props: TextPrimitiveProps;
  onCommit: (next: TextPrimitiveProps) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(props.content);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutosize(ref);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit({ ...props, content: value })}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        // Allow newlines via Enter, commit via Cmd/Ctrl+Enter.
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onCommit({ ...props, content: value });
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      rows={1}
      className={`w-full resize-none bg-transparent leading-relaxed ${WEIGHT_CLASS[props.weight]} ${ALIGN_CLASS[props.align]} ${FOCUS_RING}`}
      style={{ color: props.color, fontSize: `${props.fontSize}px` }}
    />
  );
}

// -----------------------------------------------------------------------------
// Heading
// -----------------------------------------------------------------------------

function HeadingEditor({
  props,
  onCommit,
  onCancel,
}: {
  props: HeadingPrimitiveProps;
  onCommit: (next: HeadingPrimitiveProps) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(props.content);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit({ ...props, content: value })}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit({ ...props, content: value });
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`block w-full bg-transparent ${HEADING_LEVEL_CLASS[props.level]} ${ALIGN_CLASS[props.align]} ${FOCUS_RING}`}
      style={{ color: props.color }}
    />
  );
}

// -----------------------------------------------------------------------------
// Button (label only — variant/size/action stay in the EditPanel)
// -----------------------------------------------------------------------------

function ButtonEditor({
  props,
  onCommit,
  onCancel,
}: {
  props: ButtonPrimitiveProps;
  onCommit: (next: ButtonPrimitiveProps) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(props.label);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <div
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full font-medium shadow-sm ${BUTTON_VARIANT_CLASS[props.variant]} ${BUTTON_SIZE_CLASS[props.size]}`}
    >
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onCommit({ ...props, label: value })}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit({ ...props, label: value });
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`w-full bg-transparent text-center ${FOCUS_RING}`}
        style={{
          color: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
        }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// List — edit each item in place; Enter adds an item, Backspace on empty
// item removes it.
// -----------------------------------------------------------------------------

function ListEditor({
  props,
  onCommit,
  onCancel,
}: {
  props: ListPrimitiveProps;
  onCommit: (next: ListPrimitiveProps) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState(props.items);
  const [focusIdx, setFocusIdx] = useState<number>(0);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus the requested index on every render where it actually changed.
  useEffect(() => {
    refs.current[focusIdx]?.focus();
    refs.current[focusIdx]?.select();
  }, [focusIdx]);

  const style: CSSProperties = {
    color: props.color,
    fontSize: `${props.fontSize}px`,
  };

  const updateText = (idx: number, text: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, text } : it)));

  const commit = (nextItems = items) =>
    onCommit({ ...props, items: nextItems });

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const next = [
        ...items.slice(0, idx + 1),
        { id: newId(), text: "" },
        ...items.slice(idx + 1),
      ];
      setItems(next);
      setFocusIdx(idx + 1);
      return;
    }
    if (e.key === "Backspace" && items[idx].text === "" && items.length > 1) {
      e.preventDefault();
      const next = items.filter((_, i) => i !== idx);
      setItems(next);
      setFocusIdx(Math.max(0, idx - 1));
      return;
    }
  };

  // Bullet marker per style — matches the read-only renderer's look.
  const renderMarker = (idx: number) => {
    if (props.style === "number") return <span>{idx + 1}.</span>;
    if (props.style === "check") return <span className="text-emerald-500">✓</span>;
    return <span aria-hidden>•</span>;
  };

  return (
    <ul
      className="space-y-1.5 leading-relaxed"
      style={style}
      onBlur={(e) => {
        // Only commit when focus leaves the whole list, not when moving
        // between item inputs.
        const next = e.relatedTarget as HTMLElement | null;
        if (!next || !e.currentTarget.contains(next)) {
          commit();
        }
      }}
    >
      {items.map((item, idx) => (
        <li key={item.id} className="flex items-start gap-2">
          <span className="mt-1 shrink-0">{renderMarker(idx)}</span>
          <input
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            value={item.text}
            onChange={(e) => updateText(idx, e.target.value)}
            onKeyDown={(e) => handleKey(idx, e)}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex-1 bg-transparent ${FOCUS_RING}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          />
        </li>
      ))}
    </ul>
  );
}
