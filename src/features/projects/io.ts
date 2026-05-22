import { z } from "zod";
import { newId } from "@/shared/lib/id";
import type { PageDesign } from "@/features/builder/state/types";
import { useProjects } from "./store";
import type { Page, Project } from "./types";

// Soft schema — exhaustive section validation would duplicate the whole
// types file in Zod. We confirm "version 1 + array of sections with
// id/type/props".
const SectionShape = z
  .object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
  })
  .strict();

const DesignSchema = z.object({
  version: z.literal(1),
  sections: z.array(SectionShape),
});

const PageSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  name: z.string(),
  order: z.number(),
  isHome: z.boolean(),
  design: DesignSchema,
});

// =============================================================================
// Export — multi-page payload.
// =============================================================================

export function exportProjectFile(project: Project) {
  if (typeof window === "undefined") return;
  const safeName =
    project.name.trim().replace(/[\s/\\]+/g, "-").toLowerCase() || "project";
  const payload = {
    name: project.name,
    templateType: project.templateType,
    pages: project.pages.map(({ id: _id, ...rest }) => rest),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// =============================================================================
// Import — accepts three shapes: v2 (pages[]), v1 (design), bare PageDesign.
// =============================================================================

export type ImportResult =
  | { ok: true; project: Project }
  | { ok: false; error: string };

export async function importProjectFile(file: File): Promise<ImportResult> {
  let raw: unknown;
  try {
    const text = await file.text();
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "تعذر قراءة الملف. تأكد أنه ملف JSON صالح." };
  }

  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "محتوى الملف غير معروف." };
  }
  const obj = raw as Record<string, unknown>;

  const name =
    (typeof obj.name === "string" && obj.name) ||
    file.name.replace(/\.json$/i, "");
  const templateType =
    obj.templateType === "barber" ||
    obj.templateType === "coffee" ||
    obj.templateType === "photography"
      ? obj.templateType
      : undefined;

  // v2 shape — { name, templateType, pages: Page[] }
  if (Array.isArray(obj.pages)) {
    const pages: Page[] = [];
    for (const rawPage of obj.pages as unknown[]) {
      const parsed = PageSchema.safeParse(rawPage);
      if (!parsed.success) {
        return {
          ok: false,
          error: "هيكل إحدى الصفحات غير متوافق مع الإصدار الحالي.",
        };
      }
      pages.push({
        ...parsed.data,
        id: parsed.data.id ?? newId(),
        // Cast: Zod gives us section.type as plain string after the soft
        // validation; we trust the data and let the discriminated union take.
        design: parsed.data.design as unknown as Page["design"],
      });
    }
    if (pages.length === 0) {
      return { ok: false, error: "الملف لا يحتوي على صفحات." };
    }
    if (!pages.some((p) => p.isHome)) pages[0].isHome = true;

    // Create an empty project then patch it directly — `create` always
    // seeds a home page, but we want the imported pages instead.
    const store = useProjects.getState();
    const project = store.create({ name, templateType });
    const map = store.projects;
    const patched: Project = { ...project, pages };
    useProjects.setState({
      projects: { ...map, [project.id]: patched },
    });
    return { ok: true, project: patched };
  }

  // v1 or bare-design shape — single design becomes the home page.
  const designRaw = "design" in obj ? obj.design : obj;
  const parsed = DesignSchema.safeParse(designRaw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "هيكل التصميم غير متوافق مع الإصدار الحالي.",
    };
  }
  const design = parsed.data as PageDesign;

  const project = useProjects.getState().create({
    name,
    templateType,
    design,
  });
  return { ok: true, project };
}
