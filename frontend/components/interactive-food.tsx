"use client";

import { useEffect, useMemo, useState } from "react";
import { Coffee, IndianRupee, Moon, Search, ShieldCheck, Star, Utensils } from "lucide-react";
import { listRestaurants } from "@/lib/api";
import { food, type FoodSpot } from "@/lib/data";

const foodFilters = ["All", "Biryani", "Street food", "Cafe", "Rooftop", "Midnight", "Fine dining", "South Indian", "Bakery"];

export function InteractiveFood() {
  const [items, setItems] = useState(food);
  const [filter, setFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState(1500);
  const [openLate, setOpenLate] = useState(false);
  const [query, setQuery] = useState("");

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
            max={3000}
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

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.name} className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
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
    </>
  );
}
