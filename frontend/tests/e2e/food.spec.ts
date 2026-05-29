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
  await page.getByRole("button", { name: "Biryani" }).click();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toHaveCount(0);

  await page.getByRole("button", { name: "All" }).click();
  await page.getByLabel("Open late").check();
  await expect(page.getByRole("heading", { name: "Paradise Biryani" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jubilee Hills Cafe Trail" })).toHaveCount(0);
});
