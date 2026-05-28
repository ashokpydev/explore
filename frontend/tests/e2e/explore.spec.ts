import { expect, test } from "@playwright/test";
import { expectNoBrokenImages, mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("explore page supports chip navigation, search, safe filter, and selected place state", async ({ page }) => {
  await page.goto("/explore?place=salar-jung-museum");

  await expect(page.getByRole("heading", { name: "Places with history, timings, fees, reviews, and AI tips" })).toBeVisible();
  await expect(page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...")).toHaveValue("Salar Jung Museum");
  await expect(page.locator("aside").getByRole("heading", { name: "Salar Jung Museum" })).toBeVisible();

  await page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...").fill("Charminar");
  await expect(page.getByRole("button", { name: "Charminar Charminar monument" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salar Jung Museum Salar Jung Museum monument" })).toHaveCount(0);

  await page.goto("/explore?safe=true");
  await expect(page.getByLabel("Women-safe picks")).toBeChecked();
  await expect(page.getByRole("button", { name: "Salar Jung Museum Salar Jung" })).toBeVisible();

  await page.goto("/explore?category=Monuments");
  await expect(page.getByRole("button", { name: "Monuments", exact: true })).toHaveClass(/bg-lac/);
  await expectNoBrokenImages(page);
});

test("explore filter links preserve useful query state", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByRole("link", { name: "Filters" })).toHaveAttribute("href", "/explore?focus=search");
  await expect(page.getByRole("link", { name: "Charminar" })).toHaveAttribute("href", "/explore?place=charminar");
  await expect(page.getByRole("link", { name: "Weekend getaways" })).toHaveAttribute("href", "/explore?category=Weekend");
});
