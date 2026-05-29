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
  await expect(page.getByRole("link", { name: "Hidden gems" })).toHaveAttribute("href", "/explore?category=Hidden Gems");
  await expect(page.getByRole("link", { name: "Weekend getaways" })).toHaveAttribute("href", "/explore?category=Weekend");
});

test("top quick chips navigate and update the interactive results", async ({ page }) => {
  await page.goto("/explore");

  await page.getByRole("link", { name: "Ramoji Film City" }).click();
  await expect(page).toHaveURL(/place=ramoji-film-city/);
  await expect(page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...")).toHaveValue("Ramoji Film City");
  await expect(page.locator("aside").getByRole("heading", { name: "Ramoji Film City" })).toBeVisible();

  await page.getByRole("link", { name: "Malls" }).click();
  await expect(page).toHaveURL(/category=Malls/);
  await expect(page.getByRole("button", { name: "Malls", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByText("Inorbit Mall")).toBeVisible();

  await page.getByRole("link", { name: "Hidden gems" }).click();
  await expect(page).toHaveURL(/category=Hidden%20Gems/);
  await expect(page.getByRole("button", { name: "Hidden Gems", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByText("Shilparamam")).toBeVisible();

  await page.getByRole("link", { name: "Restaurants" }).click();
  await expect(page).toHaveURL(/\/food$/);
  await expect(page.getByRole("heading", { name: "Biryani, street food, cafes, rooftops, and midnight Hyderabad" })).toBeVisible();
});

test("selected places include maps and navigation links", async ({ page }) => {
  await page.goto("/explore?place=charminar");

  const map = page.locator('iframe[title="Map for Charminar"]');
  await expect(map).toBeVisible();
  await expect(map).toHaveAttribute("src", /openstreetmap\.org\/export\/embed\.html/);
  await expect(page.getByRole("link", { name: "Google directions" })).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await expect(page.getByRole("link", { name: "Open map" })).toHaveAttribute("href", /openstreetmap\.org/);

  await page.getByPlaceholder("Current location, Secunderabad, HITEC City...").fill("Secunderabad");
  await expect(page.getByRole("link", { name: "Google directions" })).toHaveAttribute("href", /origin=Secunderabad/);
});

test("free-text URLs for major places and category chips show matching content", async ({ page }) => {
  await page.goto("/explore?focus=search&q=Ramoji%20Film%20City");

  await expect(page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...")).toHaveValue("Ramoji Film City");
  await expect(page.getByText("Film Studio Theme Park")).toBeVisible();
  await expect(page.locator("aside").getByRole("heading", { name: "Ramoji Film City" })).toBeVisible();

  await page.goto("/explore?category=Malls");
  await expect(page.getByRole("button", { name: "Malls", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-inorbit-mall")).toBeVisible();
  await expect(page.getByTestId("place-card-sarath-city-capital-mall")).toBeVisible();

  await page.goto("/explore?category=Theaters");
  await expect(page.getByTestId("place-card-prasads-multiplex")).toBeVisible();
  await expect(page.getByTestId("place-card-aaa-cinemas")).toBeVisible();
});
