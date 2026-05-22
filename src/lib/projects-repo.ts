import "server-only";
import { query } from "./db";
import { ensureMigrated } from "./migrations";
import { starterDesignFor } from "@/features/sections/starters";
import type {
  Page,
  Project,
  ProjectMeta,
  ProjectTemplateType,
} from "@/features/projects/types";
import type { PageDesign } from "@/features/builder/state/types";

// Row shapes returned by raw SQL.
type ProjectRow = {
  id: string;
  owner_id: string;
  name: string;
  template_type: string | null;
  created_at: Date;
  updated_at: Date;
};

type PageRow = {
  id: string;
  project_id: string;
  slug: string;
  name: string;
  order: number;
  is_home: boolean;
  design: PageDesign;
};

function projectFromRow(row: ProjectRow, pages: Page[]): Project {
  return {
    id: row.id,
    name: row.name,
    templateType:
      (row.template_type as ProjectTemplateType | null) ?? undefined,
    pages,
    createdAt: row.created_at.getTime(),
    updatedAt: row.updated_at.getTime(),
  };
}

function pageFromRow(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    order: row.order,
    isHome: row.is_home,
    design: row.design,
  };
}

const EMPTY_DESIGN: PageDesign = { version: 1, sections: [] };

export async function listForOwner(
  ownerId: string,
): Promise<ProjectMeta[]> {
  await ensureMigrated();
  const { rows } = await query<ProjectRow>(
    `SELECT id, owner_id, name, template_type, created_at, updated_at
     FROM projects
     WHERE owner_id = $1
     ORDER BY updated_at DESC`,
    [ownerId],
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    templateType:
      (r.template_type as ProjectTemplateType | null) ?? undefined,
    createdAt: r.created_at.getTime(),
    updatedAt: r.updated_at.getTime(),
  }));
}

export async function getForOwner(
  ownerId: string,
  projectId: string,
): Promise<Project | null> {
  await ensureMigrated();
  const { rows: projectRows } = await query<ProjectRow>(
    `SELECT id, owner_id, name, template_type, created_at, updated_at
     FROM projects WHERE id = $1 AND owner_id = $2 LIMIT 1`,
    [projectId, ownerId],
  );
  if (projectRows.length === 0) return null;

  const { rows: pageRows } = await query<PageRow>(
    `SELECT id, project_id, slug, name, "order", is_home, design
     FROM pages WHERE project_id = $1
     ORDER BY "order" ASC`,
    [projectId],
  );

  return projectFromRow(projectRows[0], pageRows.map(pageFromRow));
}

export async function createForOwner(
  ownerId: string,
  input: { name?: string; templateType?: ProjectTemplateType },
): Promise<Project> {
  await ensureMigrated();
  const name = input.name?.trim() || "مشروع جديد";

  const { rows: pRows } = await query<ProjectRow>(
    `INSERT INTO projects (owner_id, name, template_type)
     VALUES ($1, $2, $3)
     RETURNING id, owner_id, name, template_type, created_at, updated_at`,
    [ownerId, name, input.templateType ?? null],
  );
  const project = pRows[0];

  // Seed a home page — populated when a templateType was provided.
  const homeDesign =
    input.templateType !== undefined
      ? starterDesignFor(input.templateType)
      : EMPTY_DESIGN;
  const { rows: pageRows } = await query<PageRow>(
    `INSERT INTO pages (project_id, slug, name, "order", is_home, design)
     VALUES ($1, 'home', 'الصفحة الرئيسية', 0, TRUE, $2::jsonb)
     RETURNING id, project_id, slug, name, "order", is_home, design`,
    [project.id, JSON.stringify(homeDesign)],
  );

  return projectFromRow(project, pageRows.map(pageFromRow));
}

export async function renameForOwner(
  ownerId: string,
  projectId: string,
  name: string,
): Promise<boolean> {
  await ensureMigrated();
  const { rowCount } = await query(
    `UPDATE projects SET name = $1, updated_at = NOW()
     WHERE id = $2 AND owner_id = $3`,
    [name, projectId, ownerId],
  );
  return rowCount > 0;
}

export async function deleteForOwner(
  ownerId: string,
  projectId: string,
): Promise<boolean> {
  await ensureMigrated();
  const { rowCount } = await query(
    `DELETE FROM projects WHERE id = $1 AND owner_id = $2`,
    [projectId, ownerId],
  );
  return rowCount > 0;
}

// ----- pages -----

export async function addPageForOwner(
  ownerId: string,
  projectId: string,
  input: { name?: string },
): Promise<Page | null> {
  await ensureMigrated();
  // Ownership gate first.
  const owns = await query(
    `SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2`,
    [projectId, ownerId],
  );
  if (owns.rowCount === 0) return null;

  // Build a unique slug.
  const baseName = (input.name ?? "صفحة جديدة").trim();
  const baseSlug =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page";

  const { rows: existing } = await query<{ slug: string; order: number }>(
    `SELECT slug, "order" FROM pages WHERE project_id = $1`,
    [projectId],
  );
  const taken = new Set(existing.map((r) => r.slug));
  let candidate = baseSlug;
  let i = 2;
  while (taken.has(candidate)) candidate = `${baseSlug}-${i++}`;
  const nextOrder = existing.length;

  const { rows: inserted } = await query<PageRow>(
    `INSERT INTO pages (project_id, slug, name, "order", is_home, design)
     VALUES ($1, $2, $3, $4, FALSE, $5::jsonb)
     RETURNING id, project_id, slug, name, "order", is_home, design`,
    [
      projectId,
      candidate,
      baseName,
      nextOrder,
      JSON.stringify(EMPTY_DESIGN),
    ],
  );
  await query(`UPDATE projects SET updated_at = NOW() WHERE id = $1`, [
    projectId,
  ]);
  return pageFromRow(inserted[0]);
}

export async function updatePageDesignForOwner(
  ownerId: string,
  projectId: string,
  pageId: string,
  design: PageDesign,
): Promise<boolean> {
  await ensureMigrated();
  const { rowCount } = await query(
    `UPDATE pages SET design = $1::jsonb
     WHERE id = $2 AND project_id = $3
       AND EXISTS (SELECT 1 FROM projects WHERE id = $3 AND owner_id = $4)`,
    [JSON.stringify(design), pageId, projectId, ownerId],
  );
  if (rowCount > 0) {
    await query(`UPDATE projects SET updated_at = NOW() WHERE id = $1`, [
      projectId,
    ]);
  }
  return rowCount > 0;
}

export async function deletePageForOwner(
  ownerId: string,
  projectId: string,
  pageId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureMigrated();
  // Reject deleting the only page.
  const { rows: pages } = await query<{ id: string; is_home: boolean }>(
    `SELECT p.id, p.is_home FROM pages p
     INNER JOIN projects pr ON pr.id = p.project_id
     WHERE p.project_id = $1 AND pr.owner_id = $2`,
    [projectId, ownerId],
  );
  if (pages.length <= 1) return { ok: false, error: "لا يمكن حذف الصفحة الوحيدة" };
  if (!pages.find((p) => p.id === pageId)) {
    return { ok: false, error: "الصفحة غير موجودة" };
  }

  const target = pages.find((p) => p.id === pageId)!;
  await query(`DELETE FROM pages WHERE id = $1`, [pageId]);

  // Promote a new home if needed.
  if (target.is_home) {
    const remaining = pages.filter((p) => p.id !== pageId);
    if (remaining.length > 0) {
      await query(`UPDATE pages SET is_home = TRUE WHERE id = $1`, [
        remaining[0].id,
      ]);
    }
  }
  await query(`UPDATE projects SET updated_at = NOW() WHERE id = $1`, [
    projectId,
  ]);
  return { ok: true };
}
