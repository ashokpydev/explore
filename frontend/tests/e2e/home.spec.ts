import { expect, test } from "@playwright/test";
import { expectNoBrokenImages, mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("home page renders hero, corrected destination images, and working primary navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Explore Hyderabad" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Plan a trip" })).toHaveAttribute("href", "/planner");
  await expect(page.getByRole("link", { name: "Explore places" })).toHaveAttribute("href", "/explore");

  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Monuments", exact: true })).toHaveAttribute("href", "/explore?category=Monuments");
  await expect(main.getByRole("link", { name: "Food", exact: true })).toHaveAttribute("href", "/food");
  await expect(main.getByRole("link", { name: "Safety", exact: true })).toHaveAttribute("href", "/explore?safe=true");

  const destinationLinks = page.locator('a[href^="/explore?place="]');
  expect(await destinationLinks.count()).toBeGreaterThanOrEqual(20);
  await expect(main.locator('a[href="/explore?place=charminar"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=golconda-fort"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=hussain-sagar"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=ramoji-film-city"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=salar-jung-museum"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=laad-bazaar"]')).toBeVisible();
  await expect(main.locator('a[href="/explore?place=ananthagiri-hills"]')).toBeVisible();

  await expectNoBrokenImages(page);
});

test("header search and theme controls are functional", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Search places").click();
  await expect(page).toHaveURL(/\/explore\?focus=search/);
  await expect(page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...")).toBeFocused();

  await page.goto("/");
  await page.getByLabel("Toggle theme").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
