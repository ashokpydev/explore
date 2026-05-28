import { expect, type Page } from "@playwright/test";

export const apiPlaces = [
  {
    id: "place-charminar",
    name: "Charminar",
    slug: "charminar",
    kind: "monument",
    short_description: "Iconic Old City monument.",
    history: "Built in 1591.",
    address: "Old City",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.3616,
    longitude: 78.4747,
    timings: { open: "09:30", close: "17:30" },
    entry_fee: { indian: 25 },
    best_time_to_visit: "Early morning",
    accessibility: { summary: "Outer plaza access" },
    safety: { score: 82 },
    ai_tips: ["Pair with Laad Bazaar"],
    rating: 4.8,
    review_count: 12000,
    is_featured: true
  },
  {
    id: "place-salar-jung",
    name: "Salar Jung Museum",
    slug: "salar-jung-museum",
    kind: "monument",
    short_description: "Museum near Darulshifa.",
    history: "Major art museum in Hyderabad.",
    address: "Darulshifa",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.3713,
    longitude: 78.4804,
    timings: { open: "10:00", close: "17:00" },
    entry_fee: { indian: 50 },
    best_time_to_visit: "Late morning",
    accessibility: { summary: "Elevators and indoor seating" },
    safety: { score: 90 },
    ai_tips: ["Prioritize clock gallery"],
    rating: 4.6,
    review_count: 8000,
    is_featured: true
  }
];

export const apiRestaurants = [
  {
    id: "restaurant-paradise",
    name: "Paradise Biryani",
    cuisine: ["Hyderabadi", "Biryani"],
    price_band: "mid",
    rating: 4.2,
    cost_for_two: 900,
    address: "Secunderabad",
    latitude: 17.4419,
    longitude: 78.4873,
    crowd_level: "high",
    open_late: true,
    highlights: ["Hyderabadi biryani", "kebabs"]
  },
  {
    id: "restaurant-cafe",
    name: "Jubilee Hills Cafe Trail",
    cuisine: ["Cafe", "Dessert"],
    price_band: "premium",
    rating: 4.4,
    cost_for_two: 1400,
    address: "Jubilee Hills",
    latitude: 17.43,
    longitude: 78.41,
    crowd_level: "moderate",
    open_late: false,
    highlights: ["specialty coffee", "work-friendly seating"]
  }
];

export async function mockApi(page: Page) {
  await page.route("**/api/v1/places**", async (route) => {
    await route.fulfill({ json: apiPlaces });
  });
  await page.route("**/api/v1/food/restaurants**", async (route) => {
    await route.fulfill({ json: apiRestaurants });
  });
  await page.route("**/api/v1/ai/chat", async (route) => {
    await route.fulfill({
      json: {
        answer: "Mock Hyderabad plan: start at Charminar, visit Salar Jung Museum, then finish near Hussain Sagar.",
        citations: ["Charminar is a 1591 monument."],
        suggestions: ["Budget version", "Food nearby"]
      }
    });
  });
  await page.route("**/api/v1/ai/itinerary", async (route) => {
    await route.fulfill({
      json: {
        title: "2-Day Family Hyderabad Plan",
        days: 2,
        budget_inr: 9000,
        route: [
          { day: 1, stops: ["Charminar", "Salar Jung Museum"], transport: "Metro and auto", budget_note: "Keep cash for markets." },
          { day: 2, stops: ["Golconda Fort", "Hussain Sagar"], transport: "Cab loop", budget_note: "Start before peak traffic." }
        ],
        ai_reasoning: "Balanced for heritage, food, family safety, and travel time."
      }
    });
  });
  await page.route("**/api/v1/admin/analytics", async (route) => {
    const authorized = route.request().headers().authorization?.startsWith("Bearer ");
    await route.fulfill({
      status: authorized ? 200 : 401,
      json: authorized
        ? { counts: { users: 3, places: 12, restaurants: 7, events: 4, reviews: 11 }, moderation_queue: 2, seo_pages_indexed: 12 }
        : { detail: "Missing bearer token" }
    });
  });
}

export async function expectNoBrokenImages(page: Page) {
  const broken = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => image instanceof HTMLImageElement)
      .map((image) => image as HTMLImageElement)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.alt || image.currentSrc)
  );
  expect(broken).toEqual([]);
}
