import type { PageDesign } from "@/features/builder/state/types";

export type ProjectTemplateType = "barber" | "coffee" | "photography";

export type Project = {
  id: string;
  name: string;
  design: PageDesign;
  templateType?: ProjectTemplateType;
  createdAt: number;
  updatedAt: number;
};

export type ProjectMeta = Omit<Project, "design">;
