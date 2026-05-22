import { describe, expect, it } from "vitest";
import { createHero } from "@/features/sections/Hero/defaults";
import { useBuilderStore } from "./store";

describe("useBuilderStore", () => {
  it("addSection pushes into design.sections and into past", () => {
    const hero = createHero();
    useBuilderStore.getState().addSection(hero);
    expect(useBuilderStore.getState().design.sections).toHaveLength(1);
    expect(useBuilderStore.getState().past).toHaveLength(1);
    expect(useBuilderStore.getState().future).toEqual([]);
  });

  it("undo restores the previous design and shifts to future", () => {
    const hero = createHero();
    useBuilderStore.getState().addSection(hero);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().design.sections).toHaveLength(0);
    expect(useBuilderStore.getState().future).toHaveLength(1);
  });

  it("redo re-applies the undone change", () => {
    const hero = createHero();
    useBuilderStore.getState().addSection(hero);
    useBuilderStore.getState().undo();
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().design.sections).toHaveLength(1);
  });

  it("a fresh action clears the future stack", () => {
    useBuilderStore.getState().addSection(createHero());
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().future).toHaveLength(1);
    useBuilderStore.getState().addSection(createHero());
    expect(useBuilderStore.getState().future).toEqual([]);
  });

  it("removeSection clears selection if it was selected", () => {
    const hero = createHero();
    useBuilderStore.getState().addSection(hero);
    useBuilderStore
      .getState()
      .setSelection({ kind: "section", sectionId: hero.id });
    useBuilderStore.getState().removeSection(hero.id);
    expect(useBuilderStore.getState().selection.kind).toBe("none");
  });

  it("reorderSections moves an item by index", () => {
    const a = createHero();
    const b = createHero();
    useBuilderStore.getState().addSection(a);
    useBuilderStore.getState().addSection(b);
    useBuilderStore.getState().reorderSections(0, 1);
    expect(useBuilderStore.getState().design.sections[0].id).toBe(b.id);
    expect(useBuilderStore.getState().design.sections[1].id).toBe(a.id);
  });

  it("loadProject seeds the design and resets history", () => {
    useBuilderStore.getState().addSection(createHero());
    const design = {
      version: 1 as const,
      sections: [createHero()],
    };
    useBuilderStore.getState().loadProject("new-id", design);
    expect(useBuilderStore.getState().projectId).toBe("new-id");
    expect(useBuilderStore.getState().past).toEqual([]);
    expect(useBuilderStore.getState().future).toEqual([]);
    expect(useBuilderStore.getState().selection.kind).toBe("none");
  });

  it("history is capped at 50 entries", () => {
    for (let i = 0; i < 60; i++) {
      useBuilderStore.getState().addSection(createHero());
    }
    expect(useBuilderStore.getState().past.length).toBeLessThanOrEqual(50);
  });
});
