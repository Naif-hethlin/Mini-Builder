import { describe, expect, it } from "vitest";
import { createHero } from "@/features/sections/Hero/defaults";
import { importProjectFile } from "./io";
import { useProjects } from "./store";

const makeFile = (payload: unknown, name = "project.json") =>
  new File([JSON.stringify(payload)], name, { type: "application/json" });

describe("importProjectFile", () => {
  it("accepts a full project payload (our export shape)", async () => {
    const design = { version: 1 as const, sections: [createHero()] };
    const file = makeFile({
      name: "مشروع مستورد",
      templateType: "coffee",
      design,
    });
    const result = await importProjectFile(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.name).toBe("مشروع مستورد");
    expect(result.project.templateType).toBe("coffee");
    expect(useProjects.getState().get(result.project.id)).toBeTruthy();
  });

  it("accepts a bare PageDesign payload — wraps into the home page", async () => {
    const design = { version: 1 as const, sections: [createHero()] };
    const file = makeFile(design, "raw.json");
    const result = await importProjectFile(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.name).toBe("raw");
    expect(result.project.pages).toHaveLength(1);
    expect(result.project.pages[0].design.sections).toHaveLength(1);
  });

  it("accepts a v2 multi-page export payload", async () => {
    const file = makeFile({
      name: "متعدد الصفحات",
      pages: [
        {
          slug: "home",
          name: "الرئيسية",
          order: 0,
          isHome: true,
          design: { version: 1, sections: [createHero()] },
        },
        {
          slug: "about",
          name: "من نحن",
          order: 1,
          isHome: false,
          design: { version: 1, sections: [] },
        },
      ],
    });
    const result = await importProjectFile(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.pages).toHaveLength(2);
    expect(result.project.pages.find((p) => p.isHome)?.slug).toBe("home");
  });

  it("rejects an invalid payload with a friendly error", async () => {
    const file = makeFile({ totallyUnrelated: true });
    const result = await importProjectFile(file);
    expect(result.ok).toBe(false);
  });

  it("rejects unparseable JSON", async () => {
    const file = new File(["not json {"], "broken.json", {
      type: "application/json",
    });
    const result = await importProjectFile(file);
    expect(result.ok).toBe(false);
  });
});
