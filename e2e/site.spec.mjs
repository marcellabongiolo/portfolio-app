import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test("mobile navigation opens, closes with Escape and closes after a link", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("navigation").getByRole("link", { name: "Work", exact: true }).click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("skip link moves keyboard focus to main content", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("ambience starts off and reduced motion disables animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Enable ambient space audio" })).toHaveAttribute("aria-pressed", "false");
  const state = await page.locator(".hero-art").evaluate(element => ({
    animation: getComputedStyle(element, "::after").animationName,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(state.animation).toBe("none");
  expect(state.scroll).toBe("auto");
});
