"use client";

import {
  FolderOpen,
  Languages,
  Monitor,
  Redo2,
  Rocket,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/shared/ui/IconButton";
import type { DeviceMode } from "./state/types";
import {
  selectCanRedo,
  selectCanUndo,
  selectDeviceMode,
  selectLanguage,
  useBuilderStore,
} from "./state/store";

// All three device modes, in display order, with their lucide icons.
const DEVICES: Array<{ mode: DeviceMode; Icon: typeof Monitor; label: string }> =
  [
    { mode: "desktop", Icon: Monitor, label: "Desktop" },
    { mode: "tablet", Icon: Tablet, label: "Tablet" },
    { mode: "mobile", Icon: Smartphone, label: "Mobile" },
  ];

export function Toolbar() {
  // Read each slice with its OWN selector so re-renders are narrow:
  // editing the design doesn't trigger Toolbar re-renders, only undo/redo state changes do.
  const canUndo = useBuilderStore(selectCanUndo);
  const canRedo = useBuilderStore(selectCanRedo);
  const deviceMode = useBuilderStore(selectDeviceMode);
  const language = useBuilderStore(selectLanguage);

  // Actions are stable function references — no re-render concerns.
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const clearDesign = useBuilderStore((s) => s.clearDesign);
  const setDeviceMode = useBuilderStore((s) => s.setDeviceMode);
  const setLanguage = useBuilderStore((s) => s.setLanguage);

  // Clear with native confirm — Phase 9 swaps this for a real dialog component.
  const handleClear = () => {
    if (
      window.confirm("Clear the whole page? You can undo this with Ctrl+Z.")
    ) {
      clearDesign();
      toast.success("Page cleared");
    }
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2">
      {/* ── Left: brand ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand font-semibold text-white">
          B
        </div>
        <span className="hidden truncate text-sm font-medium text-stone-900 sm:inline">
          Mini Website Builder
        </span>
      </div>

      {/* ── Middle: device preview toggle ──────────────────────────────── */}
      <div className="flex items-center gap-0.5 rounded-md bg-stone-100 p-1">
        {DEVICES.map(({ mode, Icon, label }) => (
          <IconButton
            key={mode}
            icon={<Icon size={16} />}
            label={label}
            active={deviceMode === mode}
            onClick={() => setDeviceMode(mode)}
            className="h-7 w-7"
          />
        ))}
      </div>

      {/* ── Right: history + file ops + language + publish ─────────────── */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={<Undo2 size={16} />}
          label="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={undo}
        />
        <IconButton
          icon={<Redo2 size={16} />}
          label="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={redo}
        />

        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" />

        <IconButton
          icon={<Save size={16} />}
          label="Save my work"
          onClick={() => toast.info("Save is wired up in Phase 7")}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<FolderOpen size={16} />}
          label="Open a saved design"
          onClick={() => toast.info("Open is wired up in Phase 7")}
          className="hidden sm:inline-flex"
        />
        <IconButton
          icon={<Trash2 size={16} />}
          label="Clear page"
          onClick={handleClear}
        />

        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" />

        <button
          type="button"
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          aria-label="Toggle language"
          title="Toggle language"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        >
          <Languages size={14} />
          {language === "ar" ? "AR" : "EN"}
        </button>

        <button
          type="button"
          onClick={() => toast.info("Publishing is wired up in Phase 13")}
          className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <Rocket size={14} />
          <span className="hidden sm:inline">Publish</span>
        </button>
      </div>
    </header>
  );
}
