"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Coffee, ExternalLink, IndianRupee, Moon, Search, ShieldCheck, Star, Utensils, X } from "lucide-react";
import { listRestaurants } from "@/lib/api";
import { food, getRestaurantMenu, type FoodSpot } from "@/lib/data";

const foodFilters = ["All", "Biryani", "Street food", "Cafe", "Rooftop", "Midnight", "Fine dining", "South Indian", "Bakery"];

export function InteractiveFood() {
  const [items, setItems] = useState(food);
  const [filter, setFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState(10000);
  const [openLate, setOpenLate] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodSpot | null>(null);

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
      const matchesBudget = spot.costForTwo <= maxBudget;
      const matchesLate = !openLate || spot.openLate;
      const matchesQuery = `${spot.name} ${spot.area} ${spot.specialties.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesBudget && matchesLate && matchesQuery;
    });
  }, [filter, items, maxBudget, openLate, query]);

  const selectedMenu = selectedRestaurant ? getRestaurantMenu(selectedRestaurant) : [];

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 lg:grid-cols-[1fr_260px_180px]">
        <label className="relative block">
          <Search className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search biryani, chai, rooftops, shawarma..."
            className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
          />
        </label>
        <label className="text-sm font-medium">
          Budget for two: INR {maxBudget}
          <input
            type="range"
            min={250}
            max={10000}
            step={250}
            value={maxBudget}
            onChange={(event) => setMaxBudget(Number(event.target.value))}
            className="mt-2 w-full accent-lac"
          />
        </label>
        <label className="inline-flex items-center gap-2 rounded-md bg-pearl px-3 py-2 text-sm font-medium dark:bg-night">
          <input type="checkbox" checked={openLate} onChange={(event) => setOpenLate(event.target.checked)} />
          Open late
        </label>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {foodFilters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${
              filter === item ? "border-lac bg-lac text-white" : "border-black/10 dark:border-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm font-medium text-black/60 dark:text-white/65">
        Showing {filtered.length} of {items.length} restaurants across Hyderabad.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.name} className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setSelectedRestaurant(item)}
              className="block h-full w-full rounded-lg p-5 text-left transition hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-lac focus:ring-offset-2 dark:focus:ring-turmeric"
              aria-label={`View menu for ${item.name}`}
            >
            <Utensils className="mb-5 text-lac dark:text-turmeric" />
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
              <div className="flex justify-between"><dt>Cost for two</dt><dd>INR {item.costForTwo}</dd></div>
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
            </button>
          </article>
        ))}
        {!filtered.length ? (
          <div className="rounded-lg border border-dashed border-black/20 bg-white p-6 text-sm text-black/65 dark:border-white/20 dark:bg-white/5 dark:text-white/70 md:col-span-2 xl:col-span-3">
            No restaurants match these filters. Try biryani, cafe, bakery, South Indian, rooftop, or midnight food.
          </div>
        ) : null}
      </div>

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
            {filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.costForTwo, 0) / filtered.length) : 0} for two.
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
                  {selectedRestaurant.area} | INR {selectedRestaurant.costForTwo} for two | {selectedRestaurant.openLate ? "Open late" : "Day/evening dining"}
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
                  <div className="flex justify-between gap-4"><dt>Budget</dt><dd className="font-semibold">INR {selectedRestaurant.costForTwo}</dd></div>
                </dl>
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
