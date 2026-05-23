import { describe, expect, it } from "vitest";
import { useProjects } from "./store";

describe("useProjects", () => {
  it("creates a project with a home page", () => {
    const project = useProjects.getState().create({ name: "متجري" });
    expect(project.id).toBeTruthy();
    expect(project.name).toBe("متجري");
    expect(project.pages).toHaveLength(1);
    expect(project.pages[0].isHome).toBe(true);
    expect(project.pages[0].slug).toBe("home");
    expect(project.pages[0].design.sections).toEqual([]);
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

  it("updatePageDesign no-ops when reference is unchanged", () => {
    const project = useProjects.getState().create({ name: "x" });
    const page = project.pages[0];
    const before = useProjects.getState().get(project.id)!.updatedAt;
    useProjects.getState().updatePageDesign(project.id, page.id, page.design);
    const after = useProjects.getState().get(project.id)!.updatedAt;
    expect(after).toBe(before);
  });

  it("addPage appends a new page with a unique slug", () => {
    const project = useProjects.getState().create({ name: "x" });
    useProjects.getState().addPage(project.id, { name: "من نحن" });
    const fresh = useProjects.getState().get(project.id)!;
    expect(fresh.pages).toHaveLength(2);
    expect(fresh.pages[1].name).toBe("من نحن");
    expect(fresh.pages[1].isHome).toBe(false);
  });

  it("removePage refuses to delete the only page", () => {
    const project = useProjects.getState().create({ name: "x" });
    useProjects.getState().removePage(project.id, project.pages[0].id);
    expect(useProjects.getState().get(project.id)?.pages).toHaveLength(1);
  });

  it("removing the home page promotes the next one", () => {
    const project = useProjects.getState().create({ name: "x" });
    const second = useProjects.getState().addPage(project.id);
    const home = project.pages[0];
    useProjects.getState().removePage(project.id, home.id);
    const fresh = useProjects.getState().get(project.id)!;
    expect(fresh.pages).toHaveLength(1);
    expect(fresh.pages[0].id).toBe(second!.id);
    expect(fresh.pages[0].isHome).toBe(true);
  });

  it("setPageSlug rejects collisions", () => {
    const project = useProjects.getState().create({ name: "x" });
    const second = useProjects.getState().addPage(project.id);
    const result = useProjects
      .getState()
      .setPageSlug(project.id, second!.id, "home");
    expect(result.ok).toBe(false);
  });

  it("ensureV2 migrates a legacy single-design project on hydrate", () => {
    const legacy = {
      "p-1": {
        id: "p-1",
        name: "legacy",
        design: { version: 1, sections: [] },
        createdAt: 1,
        updatedAt: 1,
      },
    };
    window.localStorage.setItem(
      "rekaz-builder/projects/v1",
      JSON.stringify(legacy),
    );
    useProjects.getState().hydrate();
    const project = useProjects.getState().get("p-1")!;
    expect(project.pages).toHaveLength(1);
    expect(project.pages[0].isHome).toBe(true);
    expect(project.pages[0].slug).toBe("home");
  });

  it("upsert normalizes server projects missing pages", () => {
    const project = useProjects.getState().upsert({
      id: "server-legacy",
      name: "server legacy",
      design: { version: 1, sections: [] },
      createdAt: 1,
      updatedAt: 2,
    });

    expect(project.pages).toHaveLength(1);
    expect(project.pages[0].slug).toBe("home");
    expect(project.pages[0].isHome).toBe(true);
    expect(useProjects.getState().get("server-legacy")?.pages).toHaveLength(1);
  });

  it("upsert repairs projects with an empty pages array", () => {
    const project = useProjects.getState().upsert({
      id: "empty-pages",
      name: "empty pages",
      pages: [],
      createdAt: 1,
      updatedAt: 2,
    });

    expect(project.pages).toHaveLength(1);
    expect(project.pages[0].isHome).toBe(true);
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
    window.localStorage.setItem("rekaz-builder/projects/v1", "{not valid json");
    expect(() => useProjects.getState().hydrate()).not.toThrow();
    expect(useProjects.getState().list()).toEqual([]);
  });
});
