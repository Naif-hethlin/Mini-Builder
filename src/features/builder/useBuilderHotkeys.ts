"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "./state/store";

/**
 * Global keyboard shortcuts for the builder.
 *
 *  - Cmd/Ctrl + Z              undo
 *  - Cmd/Ctrl + Shift + Z      redo
 *  - Cmd/Ctrl + S              explicit "saved" toast (auto-save already writes)
 *  - Cmd/Ctrl + D              duplicate the selected section
 *  - Delete / Backspace        delete the selected section / primitive
 *  - ↑ / ↓                     move the selected section up/down
 *  - Arrow keys (primitive)    nudge selected primitive by 1px (Shift = 10px)
 *  - Escape                    deselect
 *
 * Skipped if the user is typing in an input / textarea / contenteditable.
 */
export function useBuilderHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Bail in form fields so we don't hijack typing.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      const state = useBuilderStore.getState();
      const sel = state.selection;

      // ---- Undo / Redo --------------------------------------------------
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
        return;
      }

      // ---- Save -------------------------------------------------------
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toast.success("تم الحفظ");
        return;
      }

      // ---- Duplicate selected section ---------------------------------
      if (mod && e.key.toLowerCase() === "d") {
        if (sel.kind === "section") {
          e.preventDefault();
          state.duplicateSection(sel.sectionId);
        }
        return;
      }

      // ---- Escape: deselect -------------------------------------------
      if (e.key === "Escape") {
        if (sel.kind !== "none") {
          state.setSelection({ kind: "none" });
        }
        return;
      }

      // ---- Delete selected --------------------------------------------
      if (e.key === "Delete" || e.key === "Backspace") {
        if (sel.kind === "section") {
          e.preventDefault();
          state.removeSection(sel.sectionId);
          return;
        }
        if (sel.kind === "primitive") {
          e.preventDefault();
          state.removePrimitive(sel.sectionId, sel.primitiveId);
          return;
        }
      }

      // ---- Up/Down: reorder section, nudge primitive ------------------
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (sel.kind === "section") {
          const sections = state.design.sections;
          const idx = sections.findIndex((s) => s.id === sel.sectionId);
          if (idx === -1) return;
          const target = e.key === "ArrowUp" ? idx - 1 : idx + 1;
          if (target < 0 || target >= sections.length) return;
          e.preventDefault();
          state.reorderSections(idx, target);
          return;
        }
        if (sel.kind === "primitive") {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          state.movePrimitive(sel.sectionId, sel.primitiveId, {
            dx: 0,
            dy: e.key === "ArrowUp" ? -step : step,
          });
          return;
        }
      }

      // ---- Left/Right: nudge primitive (sections don't have horizontal order) ----
      if (
        sel.kind === "primitive" &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        state.movePrimitive(sel.sectionId, sel.primitiveId, {
          dx: e.key === "ArrowLeft" ? -step : step,
          dy: 0,
        });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
