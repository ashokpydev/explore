import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("planner generates itinerary, toggles QR guide, and downloads offline plan", async ({ page }) => {
  await page.goto("/planner");

  await expect(page.getByRole("heading", { name: "Smart itinerary planner" })).toBeVisible();
  await page.getByRole("button", { name: /Generate AI plan/ }).click();
  await expect(page.getByRole("heading", { name: "2-Day Family Hyderabad Plan" })).toBeVisible();
  await expect(page.getByText("Charminar -> Salar Jung Museum")).toBeVisible();
  await expect(page.getByText("Balanced for heritage, food, family safety, and travel time.")).toBeVisible();

  await page.getByRole("button", { name: "QR guide" }).click();
  await expect(page.getByText("Offline guide ready")).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Offline" }).click();
  await expect(await download).toBeTruthy();
});

test("assistant quick prompts and submit use the API response", async ({ page }) => {
  await page.goto("/assistant");

  await expect(page.getByRole("heading", { name: "Ask Hyderabad anything" })).toBeVisible();
  await page.getByRole("button", { name: "Best biryani near me" }).click();
  await expect(page.getByText("Mock Hyderabad plan: start at Charminar")).toBeVisible();

  await page.getByLabel("Assistant prompt").fill("Plan a museum trip");
  await page.getByLabel("Send").click();
  await expect(page.getByText("Recent: Plan a museum trip")).toBeVisible();
});

test("admin loads live analytics and approves moderation items", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Operations, content, moderation, and SEO" })).toBeVisible();
  await page.getByPlaceholder("Admin bearer token").fill("test-admin-token");
  await page.getByRole("button", { name: "Load live analytics" }).click();
  await expect(page.getByText("Live backend analytics loaded")).toBeVisible();
  await expect(page.getByText("12")).toBeVisible();

  const approveButton = page.getByRole("button", { name: "Approve" }).first();
  await approveButton.click();
  await expect(page.getByRole("button", { name: "Approved" })).toBeVisible();
});
