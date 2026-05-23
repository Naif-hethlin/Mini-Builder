import { expect, test } from "@playwright/test";
import { createHmac } from "node:crypto";

// Mint a session cookie matching src/lib/session.ts (HMAC-SHA256 over
// `${userId}.${expires}`, base64url, joined with the payload).
function mintSession(userId: string, secret: string): string {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const sig = createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${payload}.${sig}`;
}

const USER_ID = "6bf41e72-3928-48a9-9b75-d0d761103715"; // 'Naif PC'
const PROJECT_ID = "2ed9cf46-6d0b-4cd2-b79a-8c0ce5998448"; // 'مشروعي الأول'
const SECRET = "rekaz-dev-only-32-byte-secret-replace";

// iPhone 13 viewport via Chromium emulation — webkit isn't installable in
// this sandbox without sudo, but viewport + isMobile + computed-style
// checks are sufficient evidence for the changes under test.
test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "rekaz_session",
      value: mintSession(USER_ID, SECRET),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  // OnboardingTour mounts a z-[120] modal on first load that blocks taps
  // — set the "seen" flag so the tour stays dismissed during tests.
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("rekaz-builder/onboarding/v1", "1");
    } catch {
      /* localStorage unavailable */
    }
  });
});

test("tab tap target is the <button>, not the inner SVG", async ({ page }) => {
  await page.goto(`/builder/${PROJECT_ID}`);
  const tab = page.getByRole("tab", { name: "المكتبة" });
  await expect(tab).toBeVisible({ timeout: 15_000 });
  const box = await tab.boundingBox();
  if (!box) throw new Error("tab not found");
  const el = await page.evaluate(
    ({ x, y }) => {
      const node = document.elementFromPoint(x, y);
      // Walk up to the nearest <button>: this should be one hop if the
      // SVG/span are pointer-events:none.
      return {
        tag: node?.tagName,
        isButton: node?.tagName === "BUTTON",
        role: node?.getAttribute("role"),
      };
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(el.isButton).toBe(true);
  expect(el.role).toBe("tab");
});

test("builder loads and shows Arabic mobile tabs", async ({ page }) => {
  await page.goto(`/builder/${PROJECT_ID}`);

  // Wait for the tab strip — it's the bottom MobileTabs nav.
  const tabStrip = page.locator('nav[role="tablist"][aria-label="أقسام البناء"]');
  await expect(tabStrip).toBeVisible({ timeout: 15_000 });

  // Tab labels must be Arabic.
  await expect(tabStrip.getByText("المكتبة")).toBeVisible();
  await expect(tabStrip.getByText("المعاينة")).toBeVisible();
  await expect(tabStrip.getByText("الخصائص")).toBeVisible();

  // Bottom edge of the tab strip should sit above the viewport bottom by
  // ≥ the safe-area-inset-bottom padding (≥0 always; with iPhone 13 inset
  // ~34px it should be > 0). Check that the strip isn't clipped beyond
  // viewport.
  const box = await tabStrip.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box && viewport) {
    // Tab strip must be fully inside viewport (not partially off-screen).
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }

  await page.screenshot({ path: "test-results/builder-mobile-tabs.png", fullPage: false });
});

test("inputs do NOT trigger iOS zoom (>=16px font-size)", async ({ page }) => {
  await page.goto(`/builder/${PROJECT_ID}`);
  await expect(
    page.locator('nav[role="tablist"][aria-label="أقسام البناء"]'),
  ).toBeVisible({ timeout: 15_000 });

  // The search input is in the Sidebar's panel. Even if the panel is
  // hidden via Tailwind's display:none (mobile tabs swap panels), the
  // computed font-size is still readable via getComputedStyle. iOS's
  // zoom decision is based on the input's own font-size, not whether
  // its ancestor is visible at evaluation time.
  const search = page.locator('input[type="search"]').first();
  await expect(search).toHaveCount(1, { timeout: 10_000 });

  const fontSize = await search.evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize),
  );
  expect(fontSize).toBeGreaterThanOrEqual(16);

  // Also sanity-check a couple of inputs in EditPanel (NumberField) by
  // selecting a primitive — but that's another test. Snapshot the
  // Library tab for evidence.
  await page.getByRole("tab", { name: "المكتبة" }).tap();
  await expect(page.getByRole("tab", { name: "المكتبة" })).toHaveAttribute(
    "aria-selected",
    "true",
    { timeout: 5_000 },
  );
  await page.screenshot({
    path: "test-results/builder-mobile-sidebar.png",
    fullPage: false,
  });
});

test("adding/tapping a primitive auto-switches to the Editor (الخصائص) tab", async ({
  page,
}) => {
  await page.goto(`/builder/${PROJECT_ID}`);
  await expect(
    page.locator('nav[role="tablist"][aria-label="أقسام البناء"]'),
  ).toBeVisible({ timeout: 15_000 });

  // Capture starting state — المعاينة (canvas) is the default.
  const canvasTab = page.getByRole("tab", { name: "المعاينة" });
  const editorTab = page.getByRole("tab", { name: "الخصائص" });
  await expect(canvasTab).toHaveAttribute("aria-selected", "true");

  // Go to Library and add a primitive — that triggers a selection in the
  // store via addPrimitiveToBuilder → addPrimitive (which selects the
  // newly added node). On mobile that should auto-flip us to the Editor
  // tab.
  const libraryTab = page.getByRole("tab", { name: "المكتبة" });
  await libraryTab.tap();
  await expect(libraryTab).toHaveAttribute("aria-selected", "true", {
    timeout: 5_000,
  });
  // Pick the first element tile in the Sidebar.
  const firstTile = page
    .locator('xpath=//button[starts-with(@title,"أضف")]')
    .first();
  await expect(firstTile).toBeVisible({ timeout: 10_000 });
  await firstTile.tap();

  await expect(editorTab).toHaveAttribute("aria-selected", "true", {
    timeout: 5_000,
  });

  // While we're in the editor, probe the NumberField inputs — they had
  // text-xs (12px); fix is text-base sm:text-xs. At 390px viewport
  // (< 640px sm breakpoint), text-base wins → 16px.
  const numberInputs = page.locator('input[type="number"]');
  const count = await numberInputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const size = await numberInputs
      .nth(i)
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size, `NumberField #${i} font-size`).toBeGreaterThanOrEqual(16);
  }

  await page.screenshot({
    path: "test-results/builder-mobile-after-add.png",
    fullPage: false,
  });
});
