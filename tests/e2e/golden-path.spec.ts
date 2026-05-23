import { expect, test } from "@playwright/test";

test("landing loads with hero + features", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The landing has multiple "ابدأ الآن" CTAs (hero + features section +
  // "مجاناً" variants). Strict-mode locators fail on >1 match — assert at
  // least one is on-screen rather than a single exact instance.
  await expect(
    page.getByRole("link", { name: /ابدأ الآن/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("ليه مع")).toBeVisible();
});

test("templates page shows the auth gate to anonymous visitors", async ({
  page,
}) => {
  await page.goto("/templates");
  // The skip-auth path was removed — anonymous visitors should be met by
  // the sign-up overlay with the phone field, not the workspace UI.
  await expect(page.getByText(/ابدأ مع ركاز|تسجيل الدخول/)).toBeVisible({
    timeout: 10_000,
  });
});

test("/demo renders the Rekaz-styled showcase for anonymous visitors", async ({
  page,
}) => {
  await page.goto("/demo");
  await expect(page.getByText("عرض تجريبي")).toBeVisible();
  // Hero headline from rekazDemoDesign().
  await expect(
    page.getByRole("heading", { name: /حجوزات أكثر/ }),
  ).toBeVisible();
});

test("preview route serves a non-existent project gracefully", async ({
  page,
}) => {
  await page.goto("/preview/nonexistent-id-for-test");
  await expect(page.getByText(/المشروع غير موجود|لا توجد أقسام/)).toBeVisible();
});
