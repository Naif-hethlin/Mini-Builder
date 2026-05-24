import { describe, expect, it } from "vitest";
import { createHero } from "@/features/sections/Hero/defaults";
import { createCanvas } from "@/features/sections/Canvas/defaults";
import { createPrimitive } from "@/features/primitives/factory";
import { importProjectFile } from "./io";
import { useProjects } from "./store";
import type { Project } from "./types";

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

  // Roundtrip — what `exportProjectFile` produces, `importProjectFile`
  // should accept and rebuild into an equivalent project. Without this
  // the export/import buttons in the toolbar are a trap door: data goes
  // in, never comes back.
  it("roundtrips through the exact shape exportProjectFile produces", async () => {
    // 1. Build a real project: preset hero + a free-form canvas with
    //    multiple primitives. Covers both schema-driven sections and
    //    the freeform canvas branch.
    const hero = createHero();
    const canvas = createCanvas();
    // createCanvas returns Section (the union) — the canvas branch is
    // the one we care about, so narrow once.
    if (canvas.type !== "canvas") throw new Error("expected canvas section");
    canvas.props.primitives.push(createPrimitive("heading"));
    canvas.props.primitives.push(createPrimitive("button"));
    canvas.props.primitives.push(createPrimitive("shape"));

    const sourceProject: Project = {
      id: "src-project-id",
      name: "موقع الاختبار",
      templateType: "coffee",
      pages: [
        {
          id: "src-home-id",
          slug: "home",
          name: "الرئيسية",
          order: 0,
          isHome: true,
          design: { version: 1, sections: [hero, canvas] },
        },
        {
          id: "src-about-id",
          slug: "about",
          name: "من نحن",
          order: 1,
          isHome: false,
          design: { version: 1, sections: [] },
        },
      ],
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    };

    // 2. Mirror exportProjectFile's payload shape (it writes a Blob;
    //    we serialize the same payload directly).
    const exportPayload = {
      name: sourceProject.name,
      templateType: sourceProject.templateType,
      pages: sourceProject.pages.map(({ id: _id, ...rest }) => rest),
    };
    const file = makeFile(exportPayload, "roundtrip.json");

    // 3. Import.
    const result = await importProjectFile(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // 4. Assert: name, templateType, page count + each page's slug,
    //    isHome, sections survive byte-for-byte (props included).
    expect(result.project.name).toBe(sourceProject.name);
    expect(result.project.templateType).toBe(sourceProject.templateType);
    expect(result.project.pages).toHaveLength(sourceProject.pages.length);

    for (let i = 0; i < sourceProject.pages.length; i++) {
      const src = sourceProject.pages[i];
      const got = result.project.pages[i];
      expect(got.slug).toBe(src.slug);
      expect(got.name).toBe(src.name);
      expect(got.order).toBe(src.order);
      expect(got.isHome).toBe(src.isHome);
      // Sections must be deep-equal (including all the primitives in
      // the canvas section).
      expect(got.design).toEqual(src.design);
    }
  });
});
