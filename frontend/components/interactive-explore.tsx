"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Accessibility, Clock, IndianRupee, MapPinned, Navigation, Search, ShieldCheck, Star, type LucideIcon } from "lucide-react";
import { listPlaces } from "@/lib/api";
import { places } from "@/lib/data";

const filters = [
  "All",
  "Monuments",
  "Lakes",
  "Markets",
  "Museums",
  "Weekend",
  "Theme Parks",
  "Temples",
  "Mosques",
  "Malls",
  "Theaters",
  "Parks",
  "Resorts"
];

type InitialExploreState = {
  category?: string;
  place?: string;
  q?: string;
  safe?: boolean;
  focusSearch?: boolean;
};

function initialExploreState(params: InitialExploreState) {
  const category = params.category;
  const placeSlug = params.place;
  const freeQuery = params.q;
  const selected = places.find((item) => item.slug === placeSlug || item.name.toLowerCase() === placeSlug?.toLowerCase()) ?? places[0];
  return {
    query: placeSlug ? selected.name : freeQuery ?? "",
    filter: category && filters.includes(category) ? category : "All",
    selected,
    safeOnly: params.safe ?? false,
    focusSearch: params.focusSearch ?? false
  };
}

export function InteractiveExplore({ initialState = {} }: { initialState?: InitialExploreState }) {
  const initial = initialExploreState(initialState);
  const initialPlace = initialState.place;
  const initialQuery = initial.query;
  const [items, setItems] = useState(places);
  const [query, setQuery] = useState(initial.query);
  const [filter, setFilter] = useState(initial.filter);
  const [selected, setSelected] = useState(initial.selected);
  const [safeOnly, setSafeOnly] = useState(initial.safeOnly);
  const [source, setSource] = useState<"api" | "local">("local");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    listPlaces({ limit: 50 })
      .then((apiPlaces) => {
        if (!active || !apiPlaces.length) return;
        const apiMapped = apiPlaces.map((place) => ({
          slug: place.slug,
          name: place.name,
          type: place.kind.replaceAll("_", " "),
          category:
            place.kind === "lake"
              ? "Lakes"
              : place.kind === "market"
                ? "Markets"
                : place.kind === "weekend_getaway"
                  ? "Weekend"
                  : place.kind === "temple"
                    ? "Temples"
                    : place.kind === "mosque"
                      ? "Mosques"
                      : place.kind === "mall"
                        ? "Malls"
                        : place.kind === "resort"
                          ? "Resorts"
                          : "Monuments",
          image: places.find((item) => item.name === place.name)?.image ?? places[0].image,
          rating: place.rating.toFixed(1),
          meta: `${place.address} | ${place.city}`,
          tip: place.ai_tips[0] ?? place.short_description,
          lat: place.latitude,
          lng: place.longitude,
          distanceKm: 5,
          durationHours: 2,
          fee: Number(place.entry_fee.indian ?? place.entry_fee.general ?? 0),
          crowd: "Moderate" as const,
          safetyScore: Number(place.safety.score ?? 84),
          accessibility: String(place.accessibility.summary ?? "Accessibility details available at venue"),
          bestTime: place.best_time_to_visit,
          tags: [place.kind, place.city.toLowerCase(), ...place.ai_tips.map((tip) => tip.toLowerCase())]
        }));
        const merged = [...places];
        apiMapped.forEach((apiPlace) => {
          const index = merged.findIndex((place) => place.slug === apiPlace.slug);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...apiPlace, image: merged[index].image };
          } else {
            merged.push(apiPlace);
          }
        });
        setItems(merged);
        setSelected(
            merged.find((place) => place.slug === initialPlace || place.name.toLowerCase() === initialPlace?.toLowerCase()) ??
            merged.find((place) => `${place.name} ${place.tags.join(" ")}`.toLowerCase().includes(initialQuery.toLowerCase())) ??
            merged[0]
        );
        setSource("api");
      })
      .catch(() => setSource("local"));
    return () => {
      active = false;
    };
  }, [initialPlace, initialQuery]);

  useEffect(() => {
    if (initial.focusSearch) {
      searchRef.current?.focus();
    }
  }, [initial.focusSearch]);

  const filtered = useMemo(() => {
    return items.filter((place) => {
      const matchesFilter = filter === "All" || place.category === filter;
      const matchesSafe = !safeOnly || place.safetyScore >= 85;
      const haystack = `${place.name} ${place.type} ${place.meta} ${place.tags.join(" ")}`.toLowerCase();
      return matchesFilter && matchesSafe && haystack.includes(query.toLowerCase());
    });
  }, [filter, items, query, safeOnly]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div className="min-w-0">
        <div className="mb-5 grid gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Charminar, lakes, markets, trekking, biryani..."
              className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-md bg-pearl px-3 py-2 text-sm font-medium dark:bg-night">
            <input type="checkbox" checked={safeOnly} onChange={(event) => setSafeOnly(event.target.checked)} />
            Women-safe picks
          </label>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
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

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((place, index) => (
            <button
              key={place.name}
              onClick={() => setSelected(place)}
              className={`overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-premium dark:bg-white/5 ${
                selected.name === place.name ? "border-lac" : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized={place.image.endsWith(".svg")}
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{place.name}</h3>
                    <p className="text-sm text-black/60 dark:text-white/60">{place.type}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-turmeric px-2 py-1 text-sm font-semibold text-charcoal">
                    <Star size={14} fill="currentColor" /> {place.rating}
                  </span>
                </div>
                <p className="text-sm text-black/70 dark:text-white/70">{place.tip}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">{place.crowd}</span>
                  <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">{place.distanceKm} km</span>
                  <span className="rounded-md bg-pearl px-2 py-1 dark:bg-night">{place.safetyScore}% safe</span>
                </div>
              </div>
            </button>
          ))}
          {!filtered.length ? (
            <div className="rounded-lg border border-dashed border-black/20 bg-white p-6 text-sm text-black/65 dark:border-white/20 dark:bg-white/5 dark:text-white/70 md:col-span-2">
              No exact match found. Try Ramoji Film City, malls, theaters, temples, biryani, lakes, or weekend getaways.
            </div>
          ) : null}
        </div>
      </div>

      <aside className="sticky top-24 h-fit rounded-lg bg-charcoal p-5 text-white">
        <div className="mb-4 flex items-center gap-2">
          <MapPinned className="text-turmeric" />
          <h2 className="font-semibold">Interactive city map</h2>
        </div>
        <div className="relative h-72 overflow-hidden rounded-md border border-white/12 bg-[linear-gradient(135deg,#173b4a,#111827)]">
          {items.map((place) => (
            <button
              key={place.name}
              onClick={() => setSelected(place)}
              className={`absolute grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-lg ${
                selected.name === place.name ? "bg-turmeric text-charcoal" : "bg-white text-lac"
              }`}
              style={{
                left: `${Math.min(88, Math.max(8, 12 + ((place.lng - 77.85) / 0.9) * 76))}%`,
                top: `${Math.min(88, Math.max(8, 82 - ((place.lat - 17.2) / 0.32) * 66))}%`
              }}
              aria-label={`Select ${place.name}`}
            >
              {place.name.charAt(0)}
            </button>
          ))}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/35 px-3 py-2 text-xs text-white/80">
            {source === "api" ? "Live API content loaded. Add Google Maps key for map tiles." : "Local demo content loaded. Start the API for live data."}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-white/60">Selected place</p>
            <h3 className="mt-1 text-2xl font-bold">{selected.name}</h3>
            <p className="mt-2 text-sm text-white/72">{selected.meta}</p>
          </div>
          <div className="grid gap-2 text-sm">
            <Info icon={Clock} label="Best time" value={selected.bestTime} />
            <Info icon={IndianRupee} label="Entry fee" value={selected.fee === 0 ? "Free" : `INR ${selected.fee}`} />
            <Info icon={ShieldCheck} label="Safety" value={`${selected.safetyScore}% women safety score`} />
            <Info icon={Accessibility} label="Accessibility" value={selected.accessibility} />
            <Info icon={Navigation} label="Route" value={`${selected.distanceKm} km, cab estimate INR ${Math.round(75 + selected.distanceKm * 25)}`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-md bg-white/8 p-3">
      <Icon className="mt-0.5 shrink-0 text-turmeric" size={17} />
      <div>
        <p className="text-xs text-white/55">{label}</p>
        <p className="text-white/88">{value}</p>
      </div>
    </div>
  );
}
