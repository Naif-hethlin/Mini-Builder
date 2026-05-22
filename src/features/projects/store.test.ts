import { describe, expect, it } from "vitest";
import { useProjects } from "./store";

describe("useProjects", () => {
  it("creates a project with defaults", () => {
    const project = useProjects.getState().create({ name: "متجري" });
    expect(project.id).toBeTruthy();
    expect(project.name).toBe("متجري");
    expect(project.design.sections).toEqual([]);
    expect(project.createdAt).toBe(project.updatedAt);
  });

  it("respects an explicit id when provided", () => {
    const project = useProjects.getState().create({ id: "fixed", name: "x" });
    expect(project.id).toBe("fixed");
    expect(useProjects.getState().get("fixed")).toBe(project);
  });

  it("list() sorts by updatedAt desc", () => {
    const { create } = useProjects.getState();
    const a = create({ name: "أول" });
    // bump time for the next create
    const wait = () => new Promise((r) => setTimeout(r, 2));
    return wait().then(() => {
      const b = create({ name: "ثاني" });
      const list = useProjects.getState().list();
      expect(list[0].id).toBe(b.id);
      expect(list[1].id).toBe(a.id);
    });
  });

  it("rename updates updatedAt", async () => {
    const { create, rename, get } = useProjects.getState();
    const project = create({ name: "before" });
    const initial = project.updatedAt;
    await new Promise((r) => setTimeout(r, 2));
    rename(project.id, "after");
    const fresh = get(project.id)!;
    expect(fresh.name).toBe("after");
    expect(fresh.updatedAt).toBeGreaterThan(initial);
  });

  it("updateDesign no-ops when reference is unchanged", () => {
    const project = useProjects.getState().create({ name: "x" });
    const before = useProjects.getState().get(project.id)!.updatedAt;
    useProjects.getState().updateDesign(project.id, project.design);
    const after = useProjects.getState().get(project.id)!.updatedAt;
    expect(after).toBe(before);
  });

  it("remove deletes the project", () => {
    const project = useProjects.getState().create({ name: "x" });
    useProjects.getState().remove(project.id);
    expect(useProjects.getState().get(project.id)).toBeUndefined();
  });

  it("hydrate reads from localStorage", () => {
    const fake = {
      "p-1": {
        id: "p-1",
        name: "from storage",
        design: { version: 1, sections: [] },
        createdAt: 1,
        updatedAt: 1,
      },
    };
    window.localStorage.setItem(
      "rekaz-builder/projects/v1",
      JSON.stringify(fake),
    );
    useProjects.getState().hydrate();
    expect(useProjects.getState().hydrated).toBe(true);
    expect(useProjects.getState().get("p-1")?.name).toBe("from storage");
  });

  it("hydrate is idempotent", () => {
    useProjects.getState().hydrate();
    useProjects.getState().create({ name: "x" });
    // second hydrate should NOT wipe local state
    useProjects.getState().hydrate();
    expect(useProjects.getState().list()).toHaveLength(1);
  });

  it("survives a corrupt localStorage payload", () => {
    window.localStorage.setItem(
      "rekaz-builder/projects/v1",
      "{not valid json",
    );
    expect(() => useProjects.getState().hydrate()).not.toThrow();
    expect(useProjects.getState().list()).toEqual([]);
  });
});
