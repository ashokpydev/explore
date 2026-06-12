"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Calculator, Coffee, ExternalLink, IndianRupee, Loader2, MapPinned, Moon, Navigation, Search, ShieldCheck, Sparkles, Star, Users, Utensils, X } from "lucide-react";
import { getFoodAIRecommendations, listRestaurants, type FoodAIResponse } from "@/lib/api";
import { food, getFoodSpotImage, getRestaurantMenu, type FoodSpot } from "@/lib/data";
import { googleMapsSearchUrl, googleMapsTextDirectionsUrl } from "@/lib/maps";

const foodFilters = ["All", "Biryani", "Street food", "Cafe", "Rooftop", "Midnight", "Fine dining", "South Indian", "Bakery"];

export function InteractiveFood({ initialQuery = "" }: { initialQuery?: string }) {
  const [items, setItems] = useState(food);
  const [filter, setFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState(10000);
  const [members, setMembers] = useState(2);
  const [openLate, setOpenLate] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [foodPrompt, setFoodPrompt] = useState(
    initialQuery || "Best biryani and chai plan under budget with safe pickup points"
  );
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [aiFood, setAiFood] = useState<FoodAIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodSpot | null>(null);
  const [visibleCount, setVisibleCount] = useState(36);

  useEffect(() => {
    let active = true;
    listRestaurants({ limit: 50 })
      .then((restaurants) => {
        if (!active || !restaurants.length) return;
        const apiItems: FoodSpot[] = restaurants.map((restaurant) => ({
            name: restaurant.name,
            category: restaurant.cuisine.some((item) => item.toLowerCase().includes("biryani"))
              ? "Biryani"
              : restaurant.cuisine.some((item) => item.toLowerCase().includes("bakery"))
                ? "Bakery"
                : restaurant.cuisine.some((item) => item.toLowerCase().includes("south"))
                  ? "South Indian"
              : restaurant.open_late
                ? "Midnight"
                : "Cafe",
            area: restaurant.address,
            costForTwo: restaurant.cost_for_two,
            rating: restaurant.rating,
            crowd: restaurant.crowd_level === "very_high" ? "Very high" : restaurant.crowd_level === "high" ? "High" : "Moderate",
            openLate: restaurant.open_late,
            distanceKm: 5,
            specialties: restaurant.highlights.length ? restaurant.highlights : restaurant.cuisine,
            safetyNote: "Use main pickup points and verify current opening hours before travel."
          }));
        const merged = [...food];
        apiItems.forEach((apiItem) => {
          const index = merged.findIndex((item) => item.name === apiItem.name);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...apiItem };
          } else {
            merged.push(apiItem);
          }
        });
        setItems(merged);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((spot) => {
      const matchesFilter = filter === "All" || spot.category === filter;
      const matchesBudget = estimateRestaurantBudget(spot.costForTwo, members).total <= maxBudget;
      const matchesLate = !openLate || spot.openLate;
      const matchesQuery = `${spot.name} ${spot.area} ${spot.specialties.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesBudget && matchesLate && matchesQuery;
    });
  }, [filter, items, maxBudget, members, openLate, query]);

  const visibleRestaurants = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const visibleImages = useMemo(() => {
    const usedImages = new Set<string>();
    return new Map(visibleRestaurants.map((spot) => [spot.name, getFoodSpotImage(spot, usedImages)]));
  }, [visibleRestaurants]);

  const selectedMenu = selectedRestaurant ? getRestaurantMenu(selectedRestaurant) : [];
  const selectedBudget = selectedRestaurant ? estimateRestaurantBudget(selectedRestaurant.costForTwo, members) : null;

  async function runFoodAI() {
    const prompt = foodPrompt.trim() || query.trim() || "Recommend Hyderabad food";
    setAiLoading(true);
    try {
      setAiFood(
        await getFoodAIRecommendations({
          query: prompt,
          members,
          budget_inr: maxBudget,
          dietary_preference: dietaryPreference || undefined,
          open_late: openLate || undefined,
          area_hint: startLocation || undefined,
          limit: 5
        })
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
      <div className="mt-8 rounded-lg border border-lac/20 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">
              <BrainCircuit size={16} /> GenAI food planner
            </p>
            <h2 className="mt-2 text-2xl font-bold">Ask for food, and RAG ranks real restaurants</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-black/65 dark:text-white/65">
              Uses restaurant records, RAG context, budget fit, dietary notes, late-night safety, citations, and usage tracking.
            </p>
          </div>
          {aiFood?.usage ? (
            <div className="flex flex-wrap gap-2 text-xs text-black/60 dark:text-white/60">
              <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">Tokens {aiFood.usage.total_tokens}</span>
              <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">{aiFood.usage.latency_ms} ms</span>
              <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">{aiFood.usage.model}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input
            value={foodPrompt}
            onChange={(event) => setFoodPrompt(event.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-lac dark:border-white/10"
            placeholder="Ask: vegetarian breakfast near Koti, biryani for 6, safe midnight food..."
          />
          <select
            value={dietaryPreference}
            onChange={(event) => setDietaryPreference(event.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-lac dark:border-white/10"
            aria-label="Dietary preference"
          >
            <option value="">Flexible diet</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="biryani">Biryani focus</option>
            <option value="cafe">Cafe</option>
            <option value="street food">Street food</option>
          </select>
          <button
            type="button"
            onClick={runFoodAI}
            disabled={aiLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-lac px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-75"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate food plan
          </button>
        </div>

        {aiFood ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-md bg-pearl p-4 text-sm leading-6 dark:bg-night">
              <p>{aiFood.answer}</p>
              <div className="mt-4 grid gap-3">
                {aiFood.recommendations.map((item) => (
                  <div key={item.name} className="rounded-md border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-xs text-black/60 dark:text-white/60">{item.area} | {item.cuisine.join(", ")}</p>
                      </div>
                      <span className="rounded-md bg-turmeric px-2 py-1 text-xs font-bold text-charcoal">
                        {Math.round(item.match_score)}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-black/68 dark:text-white/68">{item.reasoning}</p>
                    <p className="mt-2 text-xs font-semibold">Estimated total: INR {item.estimated_total.toLocaleString("en-IN")}</p>
                    <p className="mt-2 text-xs text-neem dark:text-turmeric">{item.safety_note}</p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-md border border-black/10 p-4 text-xs leading-5 dark:border-white/10">
              <p className="mb-2 font-semibold">Budget strategy</p>
              {aiFood.budget_strategy.map((item) => <p key={item}>- {item}</p>)}
              <p className="mb-2 mt-4 font-semibold">Dietary notes</p>
              {aiFood.dietary_notes.map((item) => <p key={item}>- {item}</p>)}
              <p className="mb-2 mt-4 font-semibold">RAG citations</p>
              {(aiFood.citations.length ? aiFood.citations : ["Restaurant knowledge index"]).slice(0, 4).map((item) => <p key={item}>- {item}</p>)}
            </aside>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:grid-cols-[1fr_180px_260px_180px]">
        <label className="relative block">
          <Search className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(36);
            }}
            placeholder="Search biryani, chai, rooftops, shawarma..."
            className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
          />
        </label>
        <label className="text-sm font-medium">
          Members: {members}
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={members}
            onChange={(event) => {
              setMembers(Number(event.target.value));
              setVisibleCount(36);
            }}
            className="mt-2 w-full accent-neem"
            aria-label="Number of members visiting"
          />
        </label>
        <label className="text-sm font-medium">
          Max meal budget: INR {maxBudget.toLocaleString("en-IN")}
          <input
            type="range"
            min={250}
            max={30000}
            step={250}
            value={maxBudget}
            onChange={(event) => {
              setMaxBudget(Number(event.target.value));
              setVisibleCount(36);
            }}
            className="mt-2 w-full accent-lac"
            aria-label="Maximum meal budget"
          />
        </label>
        <label className="inline-flex items-center gap-2 rounded-md bg-pearl px-3 py-2 text-sm font-medium dark:bg-night">
          <input
            type="checkbox"
            checked={openLate}
            onChange={(event) => {
              setOpenLate(event.target.checked);
              setVisibleCount(36);
            }}
          />
          Open late
        </label>
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <MapPinned className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
          <input
            value={startLocation}
            onChange={(event) => setStartLocation(event.target.value)}
            placeholder="Starting location for restaurant navigation"
            className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
          />
        </label>
        <div className="flex items-center gap-2 rounded-md bg-pearl px-3 py-2 text-sm font-semibold dark:bg-night">
          <Users size={17} className="text-lac dark:text-turmeric" />
          Budgets are calculated for {members} {members === 1 ? "member" : "members"}.
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {foodFilters.map((item) => (
          <button
            key={item}
            onClick={() => {
              setFilter(item);
              setVisibleCount(36);
            }}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${
              filter === item ? "border-lac bg-lac text-white" : "border-black/10 dark:border-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm font-medium text-black/60 dark:text-white/65">
        Showing {visibleRestaurants.length} of {filtered.length} matching restaurants across Hyderabad.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleRestaurants.map((item) => {
          const budget = estimateRestaurantBudget(item.costForTwo, members);
          const destination = restaurantMapQuery(item);
          const image = visibleImages.get(item.name) ?? getFoodSpotImage(item);
          return (
          <article key={item.name} className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setSelectedRestaurant(item)}
              className="block h-full w-full overflow-hidden rounded-lg text-left transition hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-lac focus:ring-offset-2 dark:focus:ring-turmeric"
              aria-label={`View menu for ${item.name}`}
            >
            <div className="relative aspect-[16/10] bg-pearl dark:bg-night">
              <Image
                src={image}
                alt={`${item.name} food photo`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                unoptimized={image.endsWith(".svg")}
              />
            </div>
            <div className="p-5">
            <Utensils className="mb-4 text-lac dark:text-turmeric" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="mt-2 text-sm text-black/65 dark:text-white/65">{item.area}</p>
              </div>
              <span className="flex items-center gap-1 rounded-md bg-turmeric px-2 py-1 text-sm font-bold text-charcoal">
                <Star size={14} fill="currentColor" /> {item.rating}
              </span>
            </div>
            <dl className="mt-5 grid gap-2 text-sm">
              <div className="flex justify-between"><dt>Cost for two</dt><dd>INR {item.costForTwo.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>{members}-member estimate</dt><dd>INR {budget.total.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Live crowd</dt><dd>{item.crowd}</dd></div>
              <div className="flex justify-between"><dt>Distance</dt><dd>{item.distanceKm} km</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.specialties.map((specialty) => (
                <span key={specialty} className="rounded-md bg-pearl px-2 py-1 text-xs dark:bg-night">
                  {specialty}
                </span>
              ))}
            </div>
            <p className="mt-4 flex gap-2 rounded-md bg-neem/10 p-3 text-sm text-neem dark:text-turmeric">
              <ShieldCheck size={17} className="mt-0.5 shrink-0" />
              {item.safetyNote}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lac dark:text-turmeric">
              View dishes and menu <ExternalLink size={15} />
            </span>
            </div>
            </button>
            <div className="grid grid-cols-2 gap-2 border-t border-black/10 p-3 dark:border-white/10">
              <a
                href={googleMapsTextDirectionsUrl(destination, startLocation)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-lac px-3 py-2 text-sm font-semibold text-white transition hover:bg-lac/90"
              >
                <Navigation size={15} /> Directions
              </a>
              <a
                href={googleMapsSearchUrl(destination)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-semibold transition hover:bg-pearl dark:border-white/10 dark:hover:bg-white/10"
              >
                <MapPinned size={15} /> Open map
              </a>
            </div>
          </article>
        );
        })}
        {!filtered.length ? (
          <div className="rounded-lg border border-dashed border-black/20 bg-white p-6 text-sm text-black/65 dark:border-white/20 dark:bg-white/5 dark:text-white/70 md:col-span-2 xl:col-span-3">
            No restaurants match these filters. Try biryani, cafe, bakery, South Indian, rooftop, or midnight food.
          </div>
        ) : null}
      </div>

      {visibleRestaurants.length < filtered.length ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 36)}
            className="rounded-md border border-lac/30 px-4 py-2 text-sm font-semibold text-lac transition hover:bg-lac hover:text-white dark:border-turmeric/40 dark:text-turmeric dark:hover:bg-turmeric dark:hover:text-charcoal"
          >
            Load more restaurants
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-neem p-6 text-white">
          <Coffee className="mb-5 text-turmeric" />
          <h2 className="text-2xl font-semibold">Cafe and rooftop finder</h2>
          <p className="mt-3 text-white/78">Filters now react to mood, budget, distance, open-late status, and safety context.</p>
        </div>
        <div className="rounded-lg bg-lac p-6 text-white">
          <Moon className="mb-5 text-turmeric" />
          <h2 className="text-2xl font-semibold">Expense calculator</h2>
          <p className="mt-3 flex items-center gap-2 text-white/78">
            <IndianRupee size={18} /> Visible matches average INR{" "}
            {filtered.length ? Math.round(filtered.reduce((sum, item) => sum + estimateRestaurantBudget(item.costForTwo, members).total, 0) / filtered.length).toLocaleString("en-IN") : 0} for {members}.
          </p>
        </div>
      </div>

      {selectedRestaurant ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 p-4" role="dialog" aria-modal="true" aria-labelledby="restaurant-menu-title">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-premium dark:bg-night">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/10 bg-white/95 p-5 backdrop-blur dark:border-white/10 dark:bg-night/95">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lac dark:text-turmeric">{selectedRestaurant.category}</p>
                <h2 id="restaurant-menu-title" className="mt-1 text-3xl font-bold">{selectedRestaurant.name}</h2>
                <p className="mt-2 text-sm text-black/65 dark:text-white/65">
                  {selectedRestaurant.area} | INR {selectedRestaurant.costForTwo.toLocaleString("en-IN")} for two | {selectedRestaurant.openLate ? "Open late" : "Day/evening dining"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-black/10 text-black/70 hover:bg-pearl focus:outline-none focus:ring-2 focus:ring-lac dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="Close restaurant menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedMenu.map((dish) => (
                    <article key={dish.name} className="overflow-hidden rounded-lg border border-black/10 bg-pearl dark:border-white/10 dark:bg-white/5">
                      <div className="aspect-[4/3] overflow-hidden bg-black/5">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          width={640}
                          height={480}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          unoptimized={dish.image.endsWith(".svg")}
                        />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold">{dish.name}</h3>
                          <span className="shrink-0 rounded-md bg-turmeric px-2 py-1 text-sm font-bold text-charcoal">INR {dish.price}</span>
                        </div>
                        <p className="text-sm leading-6 text-black/68 dark:text-white/70">{dish.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {dish.tags.map((tag) => (
                            <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs dark:bg-night">{tag}</span>
                          ))}
                        </div>
                        <a href={dish.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-lac dark:text-turmeric">
                          {dish.sourceName} <ExternalLink size={12} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="rounded-lg border border-black/10 bg-pearl p-4 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold">Restaurant info</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4"><dt>Rating</dt><dd className="font-semibold">{selectedRestaurant.rating}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Crowd</dt><dd className="font-semibold">{selectedRestaurant.crowd}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Distance</dt><dd className="font-semibold">{selectedRestaurant.distanceKm} km</dd></div>
                  <div className="flex justify-between gap-4"><dt>Members</dt><dd className="font-semibold">{members}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Food subtotal</dt><dd className="font-semibold">INR {selectedBudget?.subtotal.toLocaleString("en-IN")}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Taxes/service</dt><dd className="font-semibold">INR {selectedBudget?.service.toLocaleString("en-IN")}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Estimated total</dt><dd className="font-semibold">INR {selectedBudget?.total.toLocaleString("en-IN")}</dd></div>
                </dl>
                <div className="mt-5 grid gap-2">
                  <a
                    href={googleMapsTextDirectionsUrl(restaurantMapQuery(selectedRestaurant), startLocation)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-lac px-3 py-2 text-sm font-semibold text-white transition hover:bg-lac/90"
                  >
                    <Navigation size={15} /> Navigate to restaurant
                  </a>
                  <a
                    href={googleMapsSearchUrl(restaurantMapQuery(selectedRestaurant))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-pearl dark:border-white/10 dark:bg-night dark:hover:bg-white/10"
                  >
                    <MapPinned size={15} /> Open in maps
                  </a>
                </div>
                <div className="mt-5 rounded-md bg-white p-3 text-sm leading-6 dark:bg-night">
                  <p className="flex items-center gap-2 font-semibold"><Calculator size={16} /> Budget formula</p>
                  <p className="mt-1 text-black/60 dark:text-white/62">
                    Cost for two is converted to per-person pricing, multiplied by visitors, then 12% is added for taxes or service.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedRestaurant.specialties.map((specialty) => (
                    <span key={specialty} className="rounded-md bg-white px-2 py-1 text-xs dark:bg-night">{specialty}</span>
                  ))}
                </div>
                <p className="mt-5 rounded-md bg-neem/10 p-3 text-sm leading-6 text-neem dark:text-turmeric">
                  {selectedRestaurant.safetyNote}
                </p>
                <p className="mt-4 text-xs leading-5 text-black/55 dark:text-white/55">
                  Menu items are representative dishes inferred from the restaurant category and publicly documented dish styles. Verify live prices and availability with the restaurant before travel.
                </p>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function estimateRestaurantBudget(costForTwo: number, members: number) {
  const subtotal = Math.round((costForTwo / 2) * members);
  const service = Math.round(subtotal * 0.12);
  return {
    subtotal,
    service,
    total: subtotal + service
  };
}

function restaurantMapQuery(spot: FoodSpot) {
  return `${spot.name}, ${spot.area}, Hyderabad`;
}
