import { expect, test } from "@playwright/test";

test("landing loads with hero + features", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /ابدأ الآن/ })).toBeVisible();
  await expect(page.getByText("ليه مع")).toBeVisible();
});

test("templates page exposes a scratch starter that opens the builder", async ({
  page,
}) => {
  await page.goto("/templates");
  // Either the toolbox tiles in fresh workspace or the toggle card —
  // both flows create a project + navigate.
  const start = page.getByRole("button", { name: "ترويسة" }).first();
  await start.click();
  await page.waitForURL(/\/builder\/.+/);
  await expect(
    page.getByRole("button", { name: "رأس الصفحة" }).first(),
  ).toBeVisible({ timeout: 10_000 });
});

test("preview route serves a non-existent project gracefully", async ({
  page,
}) => {
  await page.goto("/preview/nonexistent-id-for-test");
  await expect(page.getByText(/المشروع غير موجود|لا توجد أقسام/)).toBeVisible();
});
