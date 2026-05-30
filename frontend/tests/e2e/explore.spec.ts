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
  await expect(page.getByRole("link", { name: /Charminar Charminar monument/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Salar Jung Museum Salar Jung Museum monument/ })).toHaveCount(0);

  await page.goto("/explore?safe=true");
  await expect(page.getByLabel("Women-safe picks")).toBeChecked();
  await expect(page.getByRole("link", { name: /Salar Jung Museum Salar Jung/ })).toBeVisible();

  await page.goto("/explore?category=Monuments");
  await expect(page.getByRole("button", { name: "Monuments", exact: true })).toHaveClass(/bg-lac/);
  await expectNoBrokenImages(page);
});

test("explore filter links preserve useful query state", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByRole("link", { name: "Filters" })).toHaveAttribute("href", "/explore?focus=search");
  await expect(page.getByRole("link", { name: "Charminar", exact: true })).toHaveAttribute("href", "/explore?place=charminar");
  await expect(page.getByRole("link", { name: "Hotels and resorts", exact: true })).toHaveAttribute("href", "/explore?category=Stays");
  await expect(page.getByRole("link", { name: "Kids play zones", exact: true })).toHaveAttribute("href", "/explore?category=Kids");
  await expect(page.getByRole("link", { name: "Devotional places", exact: true })).toHaveAttribute("href", "/explore?category=Devotional");
  await expect(page.getByRole("link", { name: "Hidden gems", exact: true })).toHaveAttribute("href", "/explore?category=Hidden Gems");
  await expect(page.getByRole("link", { name: "Weekend getaways", exact: true })).toHaveAttribute("href", "/explore?category=Weekend");
});

test("top quick chips navigate and update the interactive results", async ({ page }) => {
  await page.goto("/explore");

  await page.getByRole("link", { name: "Ramoji Film City", exact: true }).click();
  await expect(page).toHaveURL(/place=ramoji-film-city/);
  await expect(page.getByPlaceholder("Search Charminar, lakes, markets, trekking, biryani...")).toHaveValue("Ramoji Film City");
  await expect(page.locator("aside").getByRole("heading", { name: "Ramoji Film City" })).toBeVisible();

  await page.getByRole("link", { name: "Malls", exact: true }).click();
  await expect(page).toHaveURL(/category=Malls/);
  await expect(page.getByRole("button", { name: "Malls", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-inorbit-mall")).toBeVisible();

  await page.getByRole("link", { name: "Hidden gems", exact: true }).click();
  await expect(page).toHaveURL(/category=Hidden%20Gems/);
  await expect(page.getByRole("button", { name: "Hidden Gems", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-shilparamam")).toBeVisible();

  await page.getByRole("link", { name: "Hotels and resorts", exact: true }).click();
  await expect(page).toHaveURL(/category=Stays/);
  await expect(page.getByRole("button", { name: "Stays", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-trident-hyderabad")).toBeVisible();
  await expect(page.getByTestId("place-card-leonia-resort")).toBeVisible();

  await page.getByRole("link", { name: "Kids play zones", exact: true }).click();
  await expect(page).toHaveURL(/category=Kids/);
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-thrill-city")).toBeVisible();

  await page.getByRole("link", { name: "Devotional places", exact: true }).click();
  await expect(page).toHaveURL(/category=Devotional/);
  await expect(page.getByRole("button", { name: "Devotional", exact: true })).toHaveClass(/bg-lac/);
  await expect(page.getByTestId("place-card-chilkur-balaji-temple")).toBeVisible();

  await page.getByRole("link", { name: "Restaurants", exact: true }).click();
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

test("place cards navigate to planner with destination selected", async ({ page }) => {
  await page.goto("/explore?place=hussain-sagar");

  const placeCard = page.getByTestId("place-card-hussain-sagar");
  await expect(placeCard).toHaveAttribute("href", "/planner?destination=hussain-sagar");

  await placeCard.click();
  await expect(page).toHaveURL(/\/planner\?destination=hussain-sagar/);
  await expect(page.getByLabel("Destination")).toHaveValue("hussain-sagar");
  await expect(page.getByText("Add a starting location to unlock route recommendations.")).toBeVisible();
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
