import type { PageDesign } from "@/features/builder/state/types";

export type ProjectTemplateType = "barber" | "coffee" | "photography";

/**
 * One page within a project. A "page" is a slug-addressable design tree —
 * its own ordered list of sections. Pages within a project share data
 * stores (bookings, customers) and templateType.
 */
export type Page = {
  id: string;
  slug: string; // url-safe, unique within the project (e.g. "home", "about")
  name: string; // user-facing label (Arabic)
  order: number; // 0-based render order in the page switcher
  isHome: boolean; // exactly one true per project
  design: PageDesign;
};

export type Project = {
  id: string;
  name: string;
  templateType?: ProjectTemplateType;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
};

export type ProjectMeta = Omit<Project, "pages">;
