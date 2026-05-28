"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Accessibility, Clock, IndianRupee, MapPinned, Navigation, Search, ShieldCheck, Star, type LucideIcon } from "lucide-react";
import { places } from "@/lib/data";

const filters = ["All", "Monuments", "Lakes", "Markets", "Museums", "Weekend"];

export function InteractiveExplore() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(places[0]);
  const [safeOnly, setSafeOnly] = useState(false);

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const matchesFilter = filter === "All" || place.category === filter;
      const matchesSafe = !safeOnly || place.safetyScore >= 85;
      const haystack = `${place.name} ${place.type} ${place.meta} ${place.tags.join(" ")}`.toLowerCase();
      return matchesFilter && matchesSafe && haystack.includes(query.toLowerCase());
    });
  }, [filter, query, safeOnly]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
      <div>
        <div className="mb-5 grid gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
            <input
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
          {filtered.map((place) => (
            <button
              key={place.name}
              onClick={() => setSelected(place)}
              className={`overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-premium dark:bg-white/5 ${
                selected.name === place.name ? "border-lac" : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image src={place.image} alt={place.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
        </div>
      </div>

      <aside className="sticky top-24 h-fit rounded-lg bg-charcoal p-5 text-white">
        <div className="mb-4 flex items-center gap-2">
          <MapPinned className="text-turmeric" />
          <h2 className="font-semibold">Interactive city map</h2>
        </div>
        <div className="relative h-72 overflow-hidden rounded-md border border-white/12 bg-[linear-gradient(135deg,#173b4a,#111827)]">
          {places.map((place) => (
            <button
              key={place.name}
              onClick={() => setSelected(place)}
              className={`absolute grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-lg ${
                selected.name === place.name ? "bg-turmeric text-charcoal" : "bg-white text-lac"
              }`}
              style={{
                left: `${12 + ((place.lng - 77.85) / 0.75) * 76}%`,
                top: `${82 - ((place.lat - 17.3) / 0.16) * 66}%`
              }}
              aria-label={`Select ${place.name}`}
            >
              {place.name.charAt(0)}
            </button>
          ))}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/35 px-3 py-2 text-xs text-white/80">
            Connect Google Maps API key for live tiles, traffic, and routes.
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
