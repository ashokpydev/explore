"use client";

import { useMemo, useState } from "react";
import { CalendarDays, IndianRupee, Navigation, ShieldCheck, Sparkles, Train, type LucideIcon } from "lucide-react";
import { emergencyContacts, events, metroRoutes, places } from "@/lib/data";

export function CityCommandCenter() {
  const [interest, setInterest] = useState("family");
  const [budget, setBudget] = useState(6000);
  const [hours, setHours] = useState(6);

  const suggested = useMemo(() => {
    return places
      .filter((place) => place.durationHours <= Math.max(2, hours))
      .sort((a, b) => b.safetyScore + Number(b.rating) * 8 - (a.safetyScore + Number(a.rating) * 8))
      .slice(0, 3);
  }, [hours]);

  const expense = Math.round(budget * 0.42 + suggested.reduce((sum, place) => sum + place.fee, 0) + hours * 180);
  const routeDistance = suggested.reduce((sum, place) => sum + place.distanceKm, 0).toFixed(1);

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Live trip cockpit</p>
          <h2 className="mt-2 text-2xl font-bold">Tune your plan and watch recommendations change</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {emergencyContacts.map((item) => (
            <a key={item.label} href={`tel:${item.value}`} className="rounded-md bg-pearl px-3 py-2 font-semibold text-charcoal dark:bg-night dark:text-white">
              {item.label}: {item.value}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Trip mood
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
            >
              <option value="family">Family-friendly</option>
              <option value="couple">Couple</option>
              <option value="solo">Solo</option>
              <option value="budget">Budget</option>
              <option value="luxury">Luxury</option>
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
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={Sparkles} label="AI match" value={`${interest} route`} />
          <Metric icon={Navigation} label="Distance" value={`${routeDistance} km`} />
          <Metric icon={IndianRupee} label="Estimated spend" value={`INR ${expense.toLocaleString("en-IN")}`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {suggested.map((place, index) => (
            <div key={place.name} className="rounded-md border border-black/10 p-4 dark:border-white/10">
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
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-charcoal p-5 text-white">
          <div className="mb-4 flex items-center gap-2">
            <Train className="text-turmeric" />
            <h3 className="font-semibold">Metro and event intelligence</h3>
          </div>
          <div className="space-y-4 text-sm text-white/78">
            <div>
              <p className="mb-1 font-semibold text-white">{metroRoutes[0].from} to {metroRoutes[0].to}</p>
              <p>{metroRoutes[0].line} | {metroRoutes[0].duration} | {metroRoutes[0].fare}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-white"><CalendarDays size={16} /> Seasonal now</p>
              <p>{events[0].title} at {events[0].venue}; crowd planning and pickup points recommended.</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-white"><ShieldCheck size={16} /> SOS ready</p>
              <p>Emergency shortcuts are one tap away and can be connected to SMS/location sharing in native wrappers.</p>
            </div>
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
