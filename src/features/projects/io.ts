import { z } from "zod";
import { useProjects } from "./store";
import type { PageDesign } from "@/features/builder/state/types";
import type { Project } from "./types";

// Soft schema — exhaustively validating every section variant would mean
// duplicating the entire types file in Zod. We just confirm the shape is
// "version 1 + array of sections with id/type/props".
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

// =============================================================================
// Export — trigger a browser download of a single project as JSON.
// =============================================================================

export function exportProjectFile(project: Project) {
  if (typeof window === "undefined") return;
  const safeName =
    project.name.trim().replace(/[\s/\\]+/g, "-").toLowerCase() || "project";
  const payload = {
    name: project.name,
    templateType: project.templateType,
    design: project.design,
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
// Import — read a JSON file, validate, create a new project, return it.
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

  // Support two shapes: a full project payload (our exportProjectFile output),
  // or a bare PageDesign (legacy export).
  const obj = raw as Record<string, unknown>;
  const designRaw = "design" in obj ? obj.design : obj;
  const parsed = DesignSchema.safeParse(designRaw);
  if (!parsed.success) {
    return { ok: false, error: "هيكل التصميم غير متوافق مع الإصدار الحالي." };
  }

  const design = parsed.data as PageDesign;
  const name =
    (typeof obj.name === "string" && obj.name) || file.name.replace(/\.json$/i, "");
  const templateType =
    obj.templateType === "barber" ||
    obj.templateType === "coffee" ||
    obj.templateType === "photography"
      ? obj.templateType
      : undefined;

  const project = useProjects.getState().create({
    name,
    templateType,
    design,
  });
  return { ok: true, project };
}
