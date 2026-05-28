"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Download, IndianRupee, Languages, Map, Navigation, QrCode, Route, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { createItinerary } from "@/lib/api";
import { emergencyContacts, metroRoutes, places } from "@/lib/data";

type RouteDay = {
  day: number;
  stops: string[];
  transport: string;
  budget_note?: string;
};

type PlannerResult = {
  title: string;
  route: RouteDay[];
  ai_reasoning: string;
};

const tripTypes = ["family", "solo", "couple", "budget", "luxury", "weekend"];
const interestOptions = ["monuments", "biryani", "lakes", "markets", "cafes", "trekking", "nightlife", "culture"];

export function InteractivePlanner() {
  const [days, setDays] = useState(2);
  const [tripType, setTripType] = useState("family");
  const [budget, setBudget] = useState(9000);
  const [language, setLanguage] = useState("English");
  const [interests, setInterests] = useState(["monuments", "biryani", "lakes"]);
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const pickedPlaces = useMemo(() => {
    return places
      .filter((place) => interests.some((interest) => place.tags.includes(interest) || place.category.toLowerCase().includes(interest)))
      .slice(0, Math.max(3, days + 1));
  }, [days, interests]);

  const expense = useMemo(() => {
    const food = days * (tripType === "luxury" ? 2600 : tripType === "budget" ? 700 : 1400);
    const transport = Math.round(pickedPlaces.reduce((sum, place) => sum + place.distanceKm, 0) * 28 + days * 250);
    const entries = pickedPlaces.reduce((sum, place) => sum + place.fee, 0);
    const stay = days > 1 ? (days - 1) * (tripType === "luxury" ? 9000 : tripType === "budget" ? 1500 : 3600) : 0;
    return { food, transport, entries, stay, total: food + transport + entries + stay };
  }, [days, pickedPlaces, tripType]);

  const previewRoute: RouteDay[] = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    stops: pickedPlaces.slice(index, index + 3).map((place) => place.name),
    transport: metroRoutes[index % metroRoutes.length]?.duration ?? "Cab loop"
  }));

  function toggleInterest(item: string) {
    setInterests((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  async function generate() {
    setLoading(true);
    try {
      const data = await createItinerary({
        days,
        trip_type: tripType,
        budget_inr: budget,
        interests
      });
      setPlan(data);
    } catch {
      setPlan({
        title: `${days}-Day ${tripType} Hyderabad Plan`,
        route: Array.from({ length: days }, (_, index) => ({
          day: index + 1,
          stops: pickedPlaces.slice(index, index + 3).map((place) => place.name),
          transport: index === 0 ? "Metro, cab, and short walks" : "Cab loop with traffic buffer",
          budget_note: "Offline plan generated from local tourism intelligence."
        })),
        ai_reasoning: "Start early for heritage zones, keep lakefronts for evenings, and reserve 20-30% of the budget for food, shopping, and cab surge."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[430px_1fr]">
      <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <Sparkles className="mb-5 text-lac dark:text-turmeric" />
        <h1 className="text-3xl font-bold">Smart itinerary planner</h1>
        <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/65">
          Tune trip type, budget, interests, language, and duration. The planner calculates spend, safety, metro hints, and AI routes.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium">
            Days: {days}
            <input type="range" min={1} max={5} value={days} onChange={(event) => setDays(Number(event.target.value))} className="mt-2 w-full accent-lac" />
          </label>
          <label className="text-sm font-medium">
            Budget: INR {budget.toLocaleString("en-IN")}
            <input type="range" min={1500} max={50000} step={500} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full accent-neem" />
          </label>
          <label className="text-sm font-medium">
            Trip type
            <select value={tripType} onChange={(event) => setTripType(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10">
              {tripTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10">
              {["English", "Telugu", "Hindi"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  interests.includes(item) ? "border-lac bg-lac text-white" : "border-black/10 dark:border-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lac px-4 py-3 font-semibold text-white">
          <Route size={18} /> {loading ? "Optimizing route..." : "Generate AI plan"}
        </button>
      </aside>

      <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric icon={IndianRupee} label="Estimated total" value={`INR ${expense.total.toLocaleString("en-IN")}`} tone={expense.total <= budget ? "good" : "warn"} />
          <Metric icon={Navigation} label="Cab/metro" value={`INR ${expense.transport}`} />
          <Metric icon={ShieldCheck} label="Safety avg" value={`${Math.round(pickedPlaces.reduce((sum, place) => sum + place.safetyScore, 0) / Math.max(1, pickedPlaces.length))}%`} />
          <Metric icon={Languages} label="Narration" value={language} />
        </div>

        <div className="rounded-lg bg-charcoal p-6 text-white">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Map className="text-turmeric" />
              <h2 className="text-2xl font-semibold">{plan?.title ?? "Your optimized route appears here"}</h2>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm"><QrCode size={16} /> QR guide</button>
              <button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm"><Download size={16} /> Offline</button>
            </div>
          </div>
          <div className="grid gap-4">
            {(plan?.route ?? previewRoute).map((day) => (
              <div key={day.day} className="rounded-md border border-white/12 p-4">
                <h3 className="font-semibold">Day {day.day}</h3>
                <p className="mt-2 text-sm text-white/75">{day.stops.length ? day.stops.join(" -> ") : "Add more interests to populate route"}</p>
                <p className="mt-2 text-sm text-turmeric">{day.transport}</p>
                {day.budget_note ? <p className="mt-2 text-xs text-white/55">{day.budget_note}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-white/72">
            {plan?.ai_reasoning ?? "The planner estimates food, cab fares, metro segments, entry fees, stay cost, crowd risk, weather-sensitive stops, emergency contacts, and offline QR guide readiness."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold"><CalendarPlus className="text-lac dark:text-turmeric" /> Expense breakdown</h3>
            {Object.entries(expense).filter(([key]) => key !== "total").map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-black/5 py-2 text-sm last:border-b-0 dark:border-white/10">
                <span className="capitalize">{key}</span>
                <strong>INR {value.toLocaleString("en-IN")}</strong>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold"><ShieldCheck className="text-lac dark:text-turmeric" /> Emergency pack</h3>
            <div className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((item) => (
                <a key={item.label} href={`tel:${item.value}`} className="rounded-md bg-pearl px-3 py-2 text-sm font-semibold dark:bg-night">
                  {item.label}: {item.value}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "good" | "warn";
}) {
  return (
    <div className={`rounded-lg p-4 ${tone === "warn" ? "bg-lac text-white" : tone === "good" ? "bg-neem text-white" : "bg-white dark:bg-white/5"}`}>
      <Icon className="mb-4 text-turmeric" />
      <p className="text-sm opacity-75">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
