import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("planner hides estimates until start and destination are selected", async ({ page }) => {
  await page.goto("/planner");

  await expect(page.getByText("No budget, travel time, distance, map, or route recommendation is shown")).toBeVisible();
  await expect(page.getByText("Estimated total")).toHaveCount(0);
  await expect(page.getByText("Route distance")).toHaveCount(0);
  await expect(page.locator('iframe[title="Map for planned route"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Generate AI plan" })).toBeDisabled();

  await page.getByLabel("Start location").fill("HITEC City");
  await expect(page.getByText("Choose a destination to unlock route recommendations.")).toBeVisible();
  await expect(page.getByText("Estimated total")).toHaveCount(0);

  await page.getByLabel("Destination").selectOption("charminar");
  await expect(page.getByText("Estimated total")).toBeVisible();
  await expect(page.getByText("Route distance", { exact: true })).toBeVisible();
  await expect(page.getByText("Recommended days", { exact: true })).toBeVisible();
  await expect(page.getByText("Budget fit", { exact: true })).toBeVisible();
  await expect(page.locator('iframe[title="Map for planned route"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate AI plan" })).toBeEnabled();
});

test("planner accepts destination from query string without showing estimates early", async ({ page }) => {
  await page.goto("/planner?destination=hussain-sagar");

  await expect(page.getByLabel("Destination")).toHaveValue("hussain-sagar");
  await expect(page.getByText("Add a starting location to unlock route recommendations.")).toBeVisible();
  await expect(page.getByText("Estimated total")).toHaveCount(0);

  await page.getByLabel("Start location").fill("HITEC City");
  await expect(page.getByRole("heading", { name: "HITEC City to Hussain Sagar" })).toBeVisible();
  await expect(page.getByText("Estimated total")).toBeVisible();
});

test("planner recommendations are based on selected start and destination", async ({ page }) => {
  await page.goto("/planner");

  await page.getByLabel("Start location").fill("Secunderabad Railway Station");
  await page.getByLabel("Destination").selectOption("ramoji-film-city");

  await expect(page.getByRole("heading", { name: "Secunderabad Railway Station to Ramoji Film City" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Navigate full route" })).toHaveAttribute("href", /origin=Secunderabad\+Railway\+Station/);
  await expect(page.locator("p", { hasText: /Ramoji Film City$/ })).toBeVisible();

  await page.getByRole("button", { name: "Generate AI plan" }).click();
  await expect(page.getByText("starts at Secunderabad Railway Station and ends at Ramoji Film City")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Secunderabad Railway Station to Ramoji Film City" })).toBeVisible();
  await expect(page.locator("p", { hasText: /Ramoji Film City$/ })).toBeVisible();
});
