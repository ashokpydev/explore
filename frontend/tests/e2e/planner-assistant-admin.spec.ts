import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("planner generates itinerary, toggles QR guide, and downloads offline plan", async ({ page }) => {
  await page.goto("/planner");

  await expect(page.getByRole("heading", { name: "Smart itinerary planner" })).toBeVisible();
  await page.getByPlaceholder("Secunderabad, HITEC City, Airport...").fill("HITEC City");
  await page.getByLabel("Destination").selectOption("charminar");
  await page.getByRole("button", { name: /Generate AI plan/ }).click();
  await expect(page.getByRole("heading", { name: "HITEC City to Charminar" })).toBeVisible();
  await expect(page.getByText("Laad Bazaar -> Mecca Masjid -> Charminar")).toBeVisible();
  await expect(page.getByText("Balanced for heritage, food, family safety, and travel time. Suggested order starts at HITEC City and ends at Charminar.")).toBeVisible();
  await expect(page.locator('iframe[title="Map for planned route"]')).toHaveAttribute("src", /openstreetmap\.org\/export\/embed\.html/);
  await expect(page.getByRole("link", { name: "Navigate full route" })).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await expect(page.getByRole("link", { name: "Day route" }).first()).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await expect(page.getByRole("link", { name: "Navigate full route" })).toHaveAttribute("href", /origin=HITEC\+City/);

  await page.getByRole("button", { name: "QR guide" }).click();
  await expect(page.getByText("Offline guide ready")).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Offline" }).click();
  await expect(await download).toBeTruthy();
});

test("assistant quick prompts and submit use the API response", async ({ page }) => {
  await page.goto("/assistant");

  await expect(page.getByRole("heading", { name: "Ask Hyderabad anything" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Plan my Hyderabad trip/ })).toHaveAttribute("href", "/planner");
  await expect(page.getByRole("link", { name: /Best biryani near me/ })).toHaveAttribute("href", "/food?query=biryani");
  await page.getByRole("button", { name: "Best biryani near me" }).click();
  await expect(page.getByText("Mock Hyderabad plan: start at Charminar")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open food guide/ })).toHaveAttribute("href", "/food?query=biryani");
  await expect(page.getByRole("button", { name: "Copy answer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read answer aloud" })).toBeVisible();

  await page.getByLabel("Assistant prompt").fill("Plan a museum trip");
  await page.getByLabel("Send").click();
  await expect(page.getByText("Recent prompts")).toBeVisible();
  await expect(page.getByRole("button", { name: "Plan a museum trip" })).toBeVisible();
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
