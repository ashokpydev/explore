import { expect, test } from "@playwright/test";
import { expectNoBrokenImages, mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("major pages have metadata, no console errors, no horizontal overflow, and no broken images", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const path of ["/", "/explore", "/food", "/planner", "/assistant", "/admin"]) {
    await page.goto(path);
    await expect(page).toHaveTitle(/Explore Hyderabad/);
    await expect(page.locator("main")).toBeVisible();
    await expectNoBrokenImages(page);

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasHorizontalOverflow, `${path} should not horizontally overflow`).toBe(false);
  }

  expect(consoleErrors.filter((error) => !error.includes("Failed to load resource"))).toEqual([]);
});
