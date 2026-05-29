import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("food page filters by search, budget, category, and late-night availability", async ({ page }) => {
  await page.goto("/food");

  await expect(page.getByRole("heading", { name: "Biryani, street food, cafes, rooftops, and midnight Hyderabad" })).toBeVisible();
  await expect(page.getByText(/Showing 1\d{2} of 1\d{2} restaurants across Hyderabad\./)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Adaa" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hotel Shadab" })).toBeVisible();

  await page.getByPlaceholder("Search biryani, chai, rooftops, shawarma...").fill("coffee");
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toHaveCount(0);

  await page.getByPlaceholder("Search biryani, chai, rooftops, shawarma...").fill("");
  await page.getByRole("button", { name: "Biryani", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toHaveCount(0);

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Open late").check();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toHaveCount(0);
});

test("restaurant cards open dish menus with images and source links", async ({ page }) => {
  await page.goto("/food");

  await page.getByLabel("View menu for Paradise Biryani").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Hyderabadi Dum Biryani" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Charcoal Kebab Platter" })).toBeVisible();
  await expect(dialog.locator("img")).toHaveCount(4);
  await expect(dialog.getByRole("link", { name: /Open dish reference/ })).toHaveCount(4);

  await page.getByLabel("Close restaurant menu").click();
  await expect(dialog).toHaveCount(0);
});
