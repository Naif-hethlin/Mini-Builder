"use client";

import { selectSelection, useBuilderStore } from "./state/store";

/**
 * Right-side panel for editing whatever is currently selected.
 * - Nothing selected → friendly placeholder telling user to click something.
 * - Section selected → schema-driven form (Phase 5).
 * - Component inside Layout selected → component form (Phase 13).
 */
export function EditPanel() {
  const selection = useBuilderStore(selectSelection);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">Settings</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          {selection.kind === "none"
            ? "Pick something to edit"
            : selection.kind === "section"
              ? "Section settings"
              : "Component settings"}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selection.kind === "none" ? (
          <div className="rounded-lg border-2 border-dashed border-stone-200 p-6 text-center">
            <p className="text-sm font-medium text-stone-700">
              Nothing selected
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Click a section in the canvas to edit its settings here. Things
              like titles, descriptions, button labels, and image links all
              live on this panel.
            </p>
          </div>
        ) : (
          <p className="text-sm text-stone-500">
            Editing form for the selected{" "}
            <span className="font-medium text-stone-700">
              {selection.kind}
            </span>{" "}
            arrives in Phase 5.
          </p>
        )}
      </div>
    </aside>
  );
}
