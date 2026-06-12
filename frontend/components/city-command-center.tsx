"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, IndianRupee, MapPinned, Navigation, ShieldCheck, Sparkles, Train, type LucideIcon } from "lucide-react";
import { emergencyContacts, events, metroRoutes, places } from "@/lib/data";
import { googleMapsMultiStopUrl, openStreetMapRouteEmbedUrl } from "@/lib/maps";
import { findMetroJourney } from "@/lib/metro";

type Coordinate = {
  name: string;
  lat: number;
  lng: number;
};

const startLocations: Coordinate[] = [
  { name: "HITEC City", lat: 17.4483, lng: 78.3915 },
  { name: "Secunderabad Railway Station", lat: 17.4337, lng: 78.5016 },
  { name: "Hyderabad Deccan Nampally", lat: 17.3924, lng: 78.4675 },
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  { name: "Rajiv Gandhi International Airport", lat: 17.2403, lng: 78.4294 },
  { name: "Banjara Hills", lat: 17.4126, lng: 78.4482 }
];

const moodLabels: Record<string, string> = {
  family: "Family-friendly",
  couple: "Couple",
  solo: "Solo",
  budget: "Budget",
  luxury: "Luxury"
};

const moodTags: Record<string, string[]> = {
  family: ["family", "kids", "lake", "museum"],
  couple: ["sunset", "lake", "rooftop", "palace"],
  solo: ["history", "metro", "market", "culture"],
  budget: ["free", "metro", "street food", "market"],
  luxury: ["palace", "resort", "fine dining", "hotel"]
};

function distanceKm(from: Pick<Coordinate, "lat" | "lng">, to: Pick<Coordinate, "lat" | "lng">) {
  const radiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function routeDistance(origin: Coordinate, stops: Array<Coordinate>) {
  return stops.reduce((sum, stop, index) => sum + distanceKm(index === 0 ? origin : stops[index - 1], stop), 0);
}

export function CityCommandCenter() {
  const [interest, setInterest] = useState("family");
  const [originName, setOriginName] = useState("HITEC City");
  const [destinationSlug, setDestinationSlug] = useState("charminar");
  const [budget, setBudget] = useState(9000);
  const [hours, setHours] = useState(6);
  const [selectedStopSlug, setSelectedStopSlug] = useState<string | null>(null);

  const origin = startLocations.find((item) => item.name === originName) ?? startLocations[0];
  const destination = places.find((place) => place.slug === destinationSlug) ?? places[0];

  const suggested = useMemo(() => {
    const tags = moodTags[interest] ?? moodTags.family;
    const direct = Math.max(1, distanceKm(origin, destination));
    const maxStops = hours <= 4 ? 1 : hours <= 7 ? 2 : 3;
    const candidates = places
      .filter((place) => place.slug !== destination.slug && place.durationHours <= Math.max(1.5, hours - 1))
      .map((place) => {
        const tagMatch = tags.some((tag) => place.tags.includes(tag) || place.category.toLowerCase().includes(tag));
        const detour = distanceKm(origin, place) + distanceKm(place, destination) - direct;
        const quality = place.safetyScore / 20 + Number(place.rating);
        return { place, score: detour - (tagMatch ? 5 : 0) - quality * 0.35 };
      })
      .sort((left, right) => left.score - right.score)
      .slice(0, maxStops)
      .map(({ place }) => place)
      .sort((left, right) => distanceKm(origin, left) - distanceKm(origin, right));

    return [...candidates, destination];
  }, [destination, hours, interest, origin]);

  const selectedStop = suggested.find((place) => place.slug === selectedStopSlug) ?? suggested[0];
  const distance = routeDistance(origin, suggested);
  const entryFees = suggested.reduce((sum, place) => sum + place.fee, 0);
  const food = interest === "luxury" ? 2200 : interest === "budget" ? 650 : 1200;
  const transport = Math.round(distance * (interest === "luxury" ? 52 : interest === "budget" ? 20 : 32) + suggested.length * 70);
  const expense = Math.round(food + transport + entryFees + Math.max(500, budget * 0.06));
  const budgetStatus = expense <= budget ? "Inside budget" : `INR ${(expense - budget).toLocaleString("en-IN")} over`;
  const plannerHref = `/planner?origin=${encodeURIComponent(origin.name)}&destination=${encodeURIComponent(destination.slug)}`;
  const routeStops = suggested;
  const sampleMetroJourney = findMetroJourney(metroRoutes[0].from, metroRoutes[0].to);

  function selectMood(nextMood: string) {
    setInterest(nextMood);
    setSelectedStopSlug(null);
  }

  return (
    <section className="rounded-lg border border-lake/20 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Live trip cockpit</p>
          <h2 className="mt-2 text-2xl font-bold">Pick a route and watch Hyderabad recommendations change</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65 dark:text-white/65">
            Change mood, start point, destination, hours, or budget. The home page updates stops, spend, map preview, safety, and planner handoff instantly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {emergencyContacts.map((item) => (
            <a key={item.label} href={`tel:${item.value}`} className="rounded-md bg-pearl px-3 py-2 font-semibold text-charcoal dark:bg-night dark:text-white">
              {item.label}: {item.value}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Trip mood</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(moodLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectMood(value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm font-medium ${
                    interest === value ? "border-lac bg-lac text-white" : "border-black/10 dark:border-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium">
            Start point
            <select
              value={originName}
              onChange={(event) => {
                setOriginName(event.target.value);
                setSelectedStopSlug(null);
              }}
              className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
            >
              {startLocations.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Destination
            <select
              value={destinationSlug}
              onChange={(event) => {
                setDestinationSlug(event.target.value);
                setSelectedStopSlug(null);
              }}
              className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
            >
              {places.slice(0, 36).map((place) => (
                <option key={place.slug} value={place.slug}>{place.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Budget: INR {budget.toLocaleString("en-IN")}
            <input
              type="range"
              min={1500}
              max={25000}
              step={500}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              className="mt-3 w-full accent-lac"
            />
          </label>
          <label className="block text-sm font-medium">
            Available hours: {hours}
            <input
              type="range"
              min={2}
              max={12}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
              className="mt-3 w-full accent-neem"
            />
          </label>
          <Link href={plannerHref} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lake px-4 py-3 text-sm font-semibold text-white">
            Open in planner <Navigation size={16} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={Sparkles} label="Route type" value={`${moodLabels[interest]} route`} />
          <Metric icon={Navigation} label="Route distance" value={`${distance.toFixed(1)} km`} />
          <Metric icon={IndianRupee} label="Estimated spend" value={`INR ${expense.toLocaleString("en-IN")}`} />
          <Metric icon={ShieldCheck} label="Budget fit" value={budgetStatus} />
          <Metric icon={MapPinned} label="Final stop" value={destination.name} />
          <Metric icon={CalendarDays} label="Time needed" value={`${suggested.reduce((sum, place) => sum + place.durationHours, 0).toFixed(1)} hrs`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {suggested.map((place, index) => (
            <button
              key={place.name}
              type="button"
              onClick={() => setSelectedStopSlug(place.slug)}
              className={`rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-premium dark:border-white/10 ${
                selectedStop.slug === place.slug ? "border-lac bg-lac/5" : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Stop {index + 1} | {place.bestTime}</p>
                  <h3 className="mt-1 text-lg font-semibold">{place.name}</h3>
                  <p className="mt-2 text-sm text-black/70 dark:text-white/70">{place.tip}</p>
                </div>
                <span className="shrink-0 rounded-md bg-neem px-2 py-1 text-sm font-semibold text-white">
                  {place.safetyScore}% safe
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-charcoal p-5 text-white">
          <div className="mb-4 flex items-center gap-2">
            <Train className="text-turmeric" />
            <h3 className="font-semibold">Map, metro, and stop preview</h3>
          </div>
          <div className="mb-4 overflow-hidden rounded-md border border-white/12">
            <iframe
              title="Home route map"
              src={openStreetMapRouteEmbedUrl(routeStops)}
              className="h-44 w-full"
              loading="lazy"
            />
          </div>
          <div className="mb-4 overflow-hidden rounded-md border border-white/12 bg-white/5">
            <div className="relative aspect-[16/9]">
              <Image src={selectedStop.image} alt={selectedStop.name} fill sizes="360px" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="font-semibold text-white">{selectedStop.name}</p>
              <p className="mt-1 text-xs leading-5 text-white/65">{selectedStop.tip}</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-white/78">
            <div>
              <p className="mb-1 font-semibold text-white">{metroRoutes[0].from} to {metroRoutes[0].to}</p>
              <p>
                {sampleMetroJourney
                  ? `INR ${sampleMetroJourney.fare} | ${sampleMetroJourney.distanceKm} km | ${sampleMetroJourney.durationMins} min`
                  : "Open planner for current metro journey charges"}
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-white"><CalendarDays size={16} /> Seasonal now</p>
              <p>{events[0].title} at {events[0].venue}; crowd planning and pickup points recommended.</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-white"><ShieldCheck size={16} /> SOS ready</p>
              <p>Emergency shortcuts are one tap away and can be connected to SMS/location sharing in native wrappers.</p>
            </div>
            <a
              href={googleMapsMultiStopUrl(routeStops, origin.name)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-turmeric px-3 py-2 font-semibold text-charcoal"
            >
              Navigate route <Navigation size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md bg-pearl p-4 dark:bg-night">
      <Icon className="mb-4 text-lac dark:text-turmeric" />
      <p className="text-sm text-black/60 dark:text-white/60">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
