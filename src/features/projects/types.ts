import type { PageDesign } from "@/app/web-builder/_back/types";

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
