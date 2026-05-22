import { create } from "zustand";
import { newId } from "@/shared/lib/id";
import type { Primitive } from "@/features/primitives/types";
import type {
  DeviceMode,
  Language,
  MobileTab,
  PageDesign,
  Section,
  Selection,
} from "./types";

// =============================================================================
// THE STORE — the brain of the builder.
//
// Holds two kinds of state:
//   1. DESIGN state (design + history)  — exported to JSON, tracked by undo/redo
//   2. UI state (selection, deviceMode, language) — not exported, not tracked
//
// Components subscribe to ONLY the slice they care about via selectors, so
// editing one section does not re-render the whole canvas.
// =============================================================================

const HISTORY_CAP = 50; // bound memory — older edits beyond this fall off
const EMPTY_DESIGN: PageDesign = { version: 1, sections: [] };

// -----------------------------------------------------------------------------
// History helper.
//
// Every design-mutating action wraps the new design through this function so
// the previous state is pushed onto `past` and `future` is cleared (because a
// new action invalidates the redo stack — standard undo/redo semantics).
// -----------------------------------------------------------------------------
function applyChange(
  state: { design: PageDesign; past: PageDesign[] },
  transform: (design: PageDesign) => PageDesign,
) {
  return {
    design: transform(state.design),
    past: [...state.past, state.design].slice(-HISTORY_CAP),
    future: [] as PageDesign[],
  };
}

// Deep clone via JSON round-trip — fine here because our design is plain JSON.
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// =============================================================================
// STORE SHAPE — every piece of state and every action.
// =============================================================================

export type BuilderState = {
  // --- which project + page this store is currently editing ---
  projectId: string | null;
  pageId: string | null;

  // --- design state (tracked by undo/redo, exported to JSON) ---
  design: PageDesign;
  past: PageDesign[];
  future: PageDesign[];

  // --- UI state (not tracked, not exported) ---
  selection: Selection;
  deviceMode: DeviceMode;
  language: Language;
  mobileTab: MobileTab;

  // --- project lifecycle ---
  /**
   * Load a project + page into the builder. Replaces design AND clears
   * undo/redo history (the loaded state is the new baseline). Selection
   * is reset to "none".
   */
  loadPage: (projectId: string, pageId: string, design: PageDesign) => void;

  // --- section actions ---
  addSection: (section: Section) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  /**
   * Updates a section by passing it through an `updater` function.
   * The updater can narrow on `section.type` to safely change `props`.
   */
  updateSection: (
    sectionId: string,
    updater: (section: Section) => Section,
  ) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // --- primitive actions (inside Canvas sections) ---
  addPrimitive: (canvasSectionId: string, primitive: Primitive) => void;
  updatePrimitive: (
    canvasSectionId: string,
    primitiveId: string,
    updater: (p: Primitive) => Primitive,
  ) => void;
  removePrimitive: (canvasSectionId: string, primitiveId: string) => void;
  movePrimitive: (
    canvasSectionId: string,
    primitiveId: string,
    delta: { dx: number; dy: number },
  ) => void;

  // --- history actions ---
  undo: () => void;
  redo: () => void;

  // --- UI actions ---
  setSelection: (selection: Selection) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setLanguage: (lang: Language) => void;
  setMobileTab: (tab: MobileTab) => void;

  // --- design I/O (replace the whole design at once) ---
  importDesign: (design: PageDesign) => void;
  clearDesign: () => void;
};

// =============================================================================
// THE STORE INSTANCE
//
// `create<BuilderState>()` returns a React hook (`useBuilderStore`) AND a
// store object. Use the hook inside components; use `useBuilderStore.getState()`
// outside React (e.g. in tests or keyboard handlers).
// =============================================================================

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // initial state
  projectId: null,
  pageId: null,
  design: EMPTY_DESIGN,
  past: [],
  future: [],
  selection: { kind: "none" },
  deviceMode: "desktop",
  language: "ar",
  mobileTab: "canvas",

  loadPage: (projectId, pageId, design) =>
    set({
      projectId,
      pageId,
      design,
      past: [],
      future: [],
      selection: { kind: "none" },
    }),

  // --- SECTION ACTIONS ---

  addSection: (section) =>
    set((state) =>
      applyChange(state, (d) => ({
        ...d,
        sections: [...d.sections, section],
      })),
    ),

  removeSection: (sectionId) =>
    set((state) => {
      const wasSelected =
        state.selection.kind === "section" &&
        state.selection.sectionId === sectionId;
      return {
        ...applyChange(state, (d) => ({
          ...d,
          sections: d.sections.filter((s) => s.id !== sectionId),
        })),
        selection: wasSelected ? { kind: "none" } : state.selection,
      };
    }),

  duplicateSection: (sectionId) =>
    set((state) =>
      applyChange(state, (d) => {
        const idx = d.sections.findIndex((s) => s.id === sectionId);
        if (idx === -1) return d;
        const copy = deepClone(d.sections[idx]);
        copy.id = newId();
        const sections = [...d.sections];
        sections.splice(idx + 1, 0, copy);
        return { ...d, sections };
      }),
    ),

  updateSection: (sectionId, updater) =>
    set((state) =>
      applyChange(state, (d) => ({
        ...d,
        sections: d.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
      })),
    ),

  reorderSections: (fromIndex, toIndex) =>
    set((state) =>
      applyChange(state, (d) => {
        if (fromIndex === toIndex) return d;
        const sections = [...d.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { ...d, sections };
      }),
    ),

  // --- PRIMITIVES (inside Canvas sections) ---

  addPrimitive: (canvasSectionId, primitive) =>
    set((state) =>
      applyChange(state, (d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.id === canvasSectionId && s.type === "canvas"
            ? { ...s, props: { ...s.props, primitives: [...s.props.primitives, primitive] } }
            : s,
        ),
      })),
    ),

  updatePrimitive: (canvasSectionId, primitiveId, updater) =>
    set((state) =>
      applyChange(state, (d) => ({
        ...d,
        sections: d.sections.map((s) => {
          if (s.id !== canvasSectionId || s.type !== "canvas") return s;
          return {
            ...s,
            props: {
              ...s.props,
              primitives: s.props.primitives.map((p) =>
                p.id === primitiveId ? updater(p) : p,
              ),
            },
          };
        }),
      })),
    ),

  removePrimitive: (canvasSectionId, primitiveId) =>
    set((state) => {
      const wasSelected =
        state.selection.kind === "primitive" &&
        state.selection.primitiveId === primitiveId;
      return {
        ...applyChange(state, (d) => ({
          ...d,
          sections: d.sections.map((s) => {
            if (s.id !== canvasSectionId || s.type !== "canvas") return s;
            return {
              ...s,
              props: {
                ...s.props,
                primitives: s.props.primitives.filter(
                  (p) => p.id !== primitiveId,
                ),
              },
            };
          }),
        })),
        selection: wasSelected ? { kind: "none" } : state.selection,
      };
    }),

  // Move-by-delta is the hot path during pointer drag. We don't push every
  // delta into undo history (that would explode it); the drag-end caller is
  // expected to commit a single applyChange via updatePrimitive if it wants
  // the move undoable. For now: drags ARE undoable as a series of small
  // history entries — coarse but simple.
  movePrimitive: (canvasSectionId, primitiveId, delta) =>
    set((state) =>
      applyChange(state, (d) => ({
        ...d,
        sections: d.sections.map((s) => {
          if (s.id !== canvasSectionId || s.type !== "canvas") return s;
          return {
            ...s,
            props: {
              ...s.props,
              primitives: s.props.primitives.map((p) =>
                p.id === primitiveId
                  ? { ...p, x: p.x + delta.dx, y: p.y + delta.dy }
                  : p,
              ),
            },
          };
        }),
      })),
    ),

  // --- HISTORY ---

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        design: previous,
        past: state.past.slice(0, -1),
        future: [state.design, ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        design: next,
        past: [...state.past, state.design].slice(-HISTORY_CAP),
        future: rest,
      };
    }),

  // --- UI ---

  setSelection: (selection) => set({ selection }),
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setLanguage: (lang) => set({ language: lang }),
  setMobileTab: (tab) => set({ mobileTab: tab }),

  // --- DESIGN I/O ---

  importDesign: (design) =>
    set((state) => ({
      ...applyChange(state, () => design),
      selection: { kind: "none" },
    })),

  clearDesign: () =>
    set((state) => ({
      ...applyChange(state, () => EMPTY_DESIGN),
      selection: { kind: "none" },
    })),
}));

// =============================================================================
// Convenience selectors — small read-only views into the store.
// Components import these instead of grabbing the whole state, so re-renders
// stay narrow.
// =============================================================================

export const selectProjectId = (s: BuilderState) => s.projectId;
export const selectPageId = (s: BuilderState) => s.pageId;
export const selectSections = (s: BuilderState) => s.design.sections;
export const selectSelection = (s: BuilderState) => s.selection;
export const selectDeviceMode = (s: BuilderState) => s.deviceMode;
export const selectLanguage = (s: BuilderState) => s.language;
export const selectMobileTab = (s: BuilderState) => s.mobileTab;
export const selectCanUndo = (s: BuilderState) => s.past.length > 0;
export const selectCanRedo = (s: BuilderState) => s.future.length > 0;

/**
 * Builds a selector that returns ONE section by id. Used by SectionFrame so
 * that editing section X only re-renders the frame for section X (not all of
 * them). Memoize the returned function with `useMemo` at the call site.
 */
export const selectSectionById =
  (id: string) =>
  (s: BuilderState): Section | undefined =>
    s.design.sections.find((sec) => sec.id === id);
