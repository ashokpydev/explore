"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Download, IndianRupee, Map, Navigation, QrCode, Route, ShieldCheck, Sparkles, Train, type LucideIcon } from "lucide-react";
import { createItinerary } from "@/lib/api";
import { emergencyContacts, places, metroRoutes } from "@/lib/data";
import { googleMapsMultiStopUrl, openStreetMapRouteEmbedUrl } from "@/lib/maps";
import { findMetroJourney, getMetroStations, metroFareSlabs, metroFareSource, type MetroJourney } from "@/lib/metro";

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

type GeneratedPlan = PlannerResult & {
  routeKey: string;
};

const tripTypes = ["family", "solo", "couple", "budget", "luxury", "weekend"];
const interestOptions = ["monuments", "biryani", "lakes", "markets", "cafes", "trekking", "nightlife", "culture"];
const startLocations = [
  { name: "Secunderabad Railway Station", lat: 17.4337, lng: 78.5016 },
  { name: "Hyderabad Deccan Nampally", lat: 17.3924, lng: 78.4675 },
  { name: "HITEC City", lat: 17.4483, lng: 78.3915 },
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  { name: "Madhapur", lat: 17.4486, lng: 78.3908 },
  { name: "Jubilee Hills", lat: 17.4326, lng: 78.4071 },
  { name: "Banjara Hills", lat: 17.4126, lng: 78.4482 },
  { name: "Kukatpally", lat: 17.4948, lng: 78.3996 },
  { name: "LB Nagar", lat: 17.3457, lng: 78.5522 },
  { name: "Rajiv Gandhi International Airport", lat: 17.2403, lng: 78.4294 }
];

type Coordinate = {
  name: string;
  lat: number;
  lng: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function resolveLocation(value: string): Coordinate | undefined {
  const query = normalize(value);
  if (!query) return undefined;
  return [...startLocations, ...places].find((item) => {
    const name = normalize(item.name);
    return name === query || name.includes(query) || query.includes(name);
  });
}

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

function routeDistanceKm(origin: Coordinate, stops: Array<Coordinate>) {
  return stops.reduce(
    (total, stop, index) => total + distanceKm(index === 0 ? origin : stops[index - 1], stop),
    0
  );
}

function buildRouteStops(origin: Coordinate, destination: (typeof places)[number], selectedInterests: string[], dayCount: number) {
  const maxSuggestedStops = Math.max(0, Math.min(dayCount * 2, 5));
  const directDistance = Math.max(1, distanceKm(origin, destination));
  const candidates = places
    .filter((place) => place.slug !== destination.slug)
    .map((place) => {
      const interestMatch = selectedInterests.some((interest) => place.tags.includes(interest) || place.category.toLowerCase().includes(interest));
      const detour = distanceKm(origin, place) + distanceKm(place, destination) - directDistance;
      const destinationNearness = distanceKm(place, destination);
      return { place, score: detour + destinationNearness * 0.18 - (interestMatch ? 4 : 0) };
    })
    .sort((left, right) => left.score - right.score)
    .slice(0, maxSuggestedStops)
    .map(({ place }) => place)
    .sort((left, right) => distanceKm(origin, left) - distanceKm(origin, right));

  return [...candidates, destination];
}

function buildRouteDays(stops: Array<(typeof places)[number]>, dayCount: number, totalDistance: number): RouteDay[] {
  return Array.from({ length: dayCount }, (_, index) => {
    const start = Math.floor((index * stops.length) / dayCount);
    const end = Math.floor(((index + 1) * stops.length) / dayCount);
    const dayStops = stops.slice(start, Math.max(start + 1, end));
    return {
      day: index + 1,
      stops: dayStops.map((place) => place.name),
      transport: index === 0
        ? `Start with the closest stop first; full route is about ${Math.round(totalDistance)} km.`
        : "Continue in route order to reduce backtracking."
    };
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function tripHours(stops: Array<(typeof places)[number]>, totalDistance: number) {
  const activityHours = stops.reduce((sum, place) => sum + place.durationHours, 0);
  const travelHours = totalDistance / 22;
  return activityHours + travelHours;
}

type InteractivePlannerProps = {
  initialOrigin?: string;
  initialDestination?: string;
  mode?: string;
};

export function InteractivePlanner({ initialOrigin = "", initialDestination = "", mode = "" }: InteractivePlannerProps) {
  const [days, setDays] = useState(2);
  const [tripType, setTripType] = useState("family");
  const [budget, setBudget] = useState(12000);
  const [travelers, setTravelers] = useState(2);
  const [language, setLanguage] = useState("English");
  const [interests, setInterests] = useState(["monuments", "biryani", "lakes"]);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destinationSlug, setDestinationSlug] = useState(initialDestination);

  const isMetroMode = mode === "metro";
  const metroStations = useMemo(() => getMetroStations(), []);

  const destination = useMemo(() => places.find((place) => place.slug === destinationSlug), [destinationSlug]);
  const originPoint = useMemo(() => resolveLocation(origin), [origin]);
  const isMetroOriginValid = !isMetroMode || !origin || metroStations.includes(origin);
  const isMetroDestinationValid = !isMetroMode || !destinationSlug || metroStations.includes(destinationSlug);
  const routeReady = isMetroMode ? Boolean(origin && destinationSlug && isMetroOriginValid && isMetroDestinationValid && origin !== destinationSlug) : Boolean(originPoint && destination);
  const routeKey = isMetroMode 
    ? `${origin}|${destinationSlug}|metro`
    : `${originPoint?.name ?? ""}|${destination?.slug ?? ""}|${days}|${tripType}|${travelers}|${budget}|${interests.join(",")}`;
  const activePlan = plan?.routeKey === routeKey ? plan : null;

  const routeDetails = useMemo(() => {
    if (isMetroMode) return null;
    if (!originPoint || !destination) return null;
    const stops = buildRouteStops(originPoint, destination, interests, days);
    const distance = routeDistanceKm(originPoint, stops);
    const route = buildRouteDays(stops, days, distance);
    const hours = tripHours(stops, distance);
    const recommendedDays = clamp(Math.ceil(hours / 8), 1, 5);
    return { stops, distance, route, hours, recommendedDays };
  }, [days, destination, interests, isMetroMode, originPoint]);

  const expense = useMemo(() => {
    if (!routeDetails) return null;
    const perPersonFood = tripType === "luxury" ? 2200 : tripType === "budget" ? 550 : tripType === "solo" ? 700 : tripType === "couple" ? 1200 : 900;
    const perKm = tripType === "luxury" ? 52 : tripType === "budget" ? 18 : 30;
    const rooms = tripType === "family" ? Math.ceil(travelers / 3) : tripType === "couple" ? Math.ceil(travelers / 2) : travelers;
    const stayRate = tripType === "luxury" ? 12000 : tripType === "budget" ? 1800 : tripType === "solo" ? 2200 : tripType === "couple" ? 4200 : 4500;
    const food = days * travelers * perPersonFood;
    const transport = Math.round(routeDetails.distance * perKm + routeDetails.stops.length * 80);
    const entries = routeDetails.stops.reduce((sum, place) => sum + place.fee * travelers, 0);
    const stay = Math.max(0, days - 1) * rooms * stayRate;
    const buffer = Math.round((food + transport + entries + stay) * 0.08);
    return { food, transport, entries, stay, buffer, total: food + transport + entries + stay + buffer };
  }, [days, routeDetails, travelers, tripType]);

  const visibleRoute = useMemo(() => activePlan?.route ?? routeDetails?.route ?? [], [activePlan, routeDetails]);
  const routeStops = useMemo(() => {
    return visibleRoute
      .flatMap((day) => day.stops)
      .map((stop) => places.find((place) => place.name === stop))
      .filter((place): place is (typeof places)[number] => Boolean(place));
  }, [visibleRoute]);
  const routeOrigin = originPoint?.name ?? origin;
  const safetyAverage = routeDetails ? Math.round(routeDetails.stops.reduce((sum, place) => sum + place.safetyScore, 0) / routeDetails.stops.length) : 0;
  const budgetGap = expense ? budget - expense.total : 0;
  const budgetFit = expense ? (budgetGap >= 0 ? `${Math.round((expense.total / budget) * 100)}% used` : `INR ${Math.abs(budgetGap).toLocaleString("en-IN")} over`) : "";
  const routeStatus = !origin.trim()
    ? isMetroMode ? "Select a starting metro station." : "Add a starting location to unlock route recommendations."
    : !destinationSlug
      ? isMetroMode ? "Choose a destination metro station." : "Choose a destination to unlock route recommendations."
      : isMetroMode && !isMetroOriginValid
        ? "Choose a valid starting station from the current Hyderabad Metro network."
        : isMetroMode && !isMetroDestinationValid
          ? "Choose a valid destination station from the current Hyderabad Metro network."
          : isMetroMode && origin === destinationSlug
            ? "Choose two different metro stations for a journey fare."
      : "";

  const metroJourney = useMemo(() => {
    if (!isMetroMode || !origin || !destinationSlug) return null;
    return findMetroJourney(origin, destinationSlug);
  }, [isMetroMode, origin, destinationSlug]);

  function toggleInterest(item: string) {
    setInterests((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  async function generate() {
    if (!routeDetails || !destination || !originPoint) return;
    setLoading(true);
    try {
      const data = await createItinerary({
        days,
        trip_type: tripType,
        budget_inr: budget,
        interests,
        language: language.toLowerCase().slice(0, 2),
        origin: originPoint.name,
        destination: destination.name,
        travelers
      });
      setPlan({
        ...data,
        routeKey,
        title: `${originPoint.name} to ${destination.name}`,
        route: routeDetails.route,
        ai_reasoning: `${data.ai_reasoning ?? "Route optimized from your selected start and destination."} Suggested order starts at ${originPoint.name} and ends at ${destination.name}.`
      });
    } catch {
      setPlan({
        routeKey,
        title: `${originPoint.name} to ${destination.name}`,
        route: routeDetails.route.map((day) => ({
          ...day,
          budget_note: `Route uses ${originPoint.name} as the start and ${destination.name} as the final stop.`
        })),
        ai_reasoning: `The recommendation is ordered by actual coordinates from ${originPoint.name} to ${destination.name}, with nearby interest-matched stops inserted only when they reduce backtracking. Estimated route distance is ${Math.round(routeDetails.distance)} km.`
      });
    } finally {
      setLoading(false);
    }
  }

  function downloadPlan() {
    if (!routeDetails || !destination || !originPoint) return;
    const payload = activePlan ?? {
      title: `Preview route from ${originPoint.name} to ${destination.name}`,
      route: routeDetails.route,
      ai_reasoning: "Generated from selected start and destination."
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[430px_1fr]">
      <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <Sparkles className="mb-5 text-lac dark:text-turmeric" />
        <h1 className="text-3xl font-bold">Smart itinerary planner</h1>
        <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/65">
          Add a starting location and destination first. The planner only shows estimates after both points are selected.
        </p>

        <div className="mt-6 grid gap-4">
          {!isMetroMode && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Available days
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={days}
                    onChange={(event) => setDays(clamp(Number(event.target.value) || 1, 1, 5))}
                    className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-lac dark:border-white/10"
                  />
                </label>
                <label className="text-sm font-medium">
                  Travelers
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={travelers}
                    onChange={(event) => setTravelers(clamp(Number(event.target.value) || 1, 1, 8))}
                    className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-lac dark:border-white/10"
                  />
                </label>
              </div>
              <label className="text-sm font-medium">
                Max budget
                <div className="mt-2 flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 focus-within:border-lac dark:border-white/10">
                  <span className="text-black/55 dark:text-white/55">INR</span>
                  <input
                    type="number"
                    min={1000}
                    max={200000}
                    step={500}
                    value={budget}
                    onChange={(event) => setBudget(clamp(Number(event.target.value) || 1000, 1000, 200000))}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </label>
              <label className="text-sm font-medium">
                Trip type
                <select value={tripType} onChange={(event) => setTripType(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10">
                  {tripTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </>
          )}
          {isMetroMode && (
            <div className="rounded-md border border-turmeric/30 bg-turmeric/5 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-turmeric"><Train size={16} /> Metro route finder</p>
              <p className="mt-2 text-xs text-turmeric/75">Select a metro station to start and a destination station. The tool will show available metro routes and fares between your chosen stations.</p>
            </div>
          )}
          <label className="text-sm font-medium">
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10">
              {["English", "Telugu", "Hindi"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">
            Start location
            {isMetroMode && <span className="text-turmeric"> (Metro stations)</span>}
            <input
              list={isMetroMode ? "metro-start-stations" : "planner-start-locations"}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder={isMetroMode ? "Miyapur, Secunderabad, MGBS..." : "Secunderabad, HITEC City, Airport..."}
              className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-lac dark:border-white/10"
            />
            {isMetroMode ? (
              <datalist id="metro-start-stations">
                {metroStations.map((station) => (
                  <option key={station} value={station} />
                ))}
              </datalist>
            ) : (
              <datalist id="planner-start-locations">
                {[...startLocations, ...places].map((item) => (
                  <option key={item.name} value={item.name} />
                ))}
              </datalist>
            )}
          </label>
          <label className="text-sm font-medium">
            Destination
            {isMetroMode && <span className="text-turmeric"> (Metro stations)</span>}
            <select
              value={destinationSlug}
              onChange={(event) => setDestinationSlug(event.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
            >
              <option value="">Choose ending point</option>
              {isMetroMode ? (
                metroStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))
              ) : (
                places.map((place) => (
                  <option key={place.slug} value={place.slug}>
                    {place.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        {!isMetroMode && (
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
        )}

        <button
          onClick={generate}
          disabled={!routeReady || loading || isMetroMode}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lac px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/25 disabled:text-black/50 dark:disabled:bg-white/10 dark:disabled:text-white/45"
        >
          {isMetroMode ? (
            <>
              <Train size={18} /> {routeReady ? "Journey details ready" : "Select metro stations"}
            </>
          ) : (
            <>
              <Route size={18} /> {loading ? "Optimizing route..." : "Generate AI plan"}
            </>
          )}
        </button>
      </aside>

      <section className="space-y-5">
        {isMetroMode ? (
          <div className="rounded-lg bg-charcoal p-6 text-white">
            <div className="mb-5 flex items-center gap-2">
              <Train className="text-turmeric" />
              <h2 className="text-2xl font-semibold">{origin && destinationSlug ? `${origin} to ${destinationSlug}` : "Metro route finder"}</h2>
            </div>
            {!origin || !destinationSlug ? (
              <div className="rounded-md border border-white/12 bg-white/8 p-5">
                <p className="font-semibold text-white">{routeStatus}</p>
              </div>
            ) : metroJourney ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetroMetric label="Calculated fare" value={`INR ${metroJourney.fare}`} helper={`Zone ${metroJourney.fareZone}: ${metroJourney.fareLabel}`} />
                  <MetroMetric label="Distance" value={`${metroJourney.distanceKm} km`} helper="Calculated across selected metro lines" />
                  <MetroMetric label="Duration" value={`${metroJourney.durationMins} min`} helper={metroJourney.transfers.length ? `${metroJourney.transfers.length} transfer included` : "Direct line journey"} />
                  <MetroMetric label="Stops" value={`${metroJourney.stationCount}`} helper={metroJourney.lineSummary} />
                </div>

                <MetroNetworkMap journey={metroJourney} />

                <div className="grid gap-3">
                  {metroJourney.segments.map((segment) => (
                    <div key={`${segment.line}-${segment.from}-${segment.to}`} className="rounded-md border border-white/12 bg-white/8 p-4">
                      <p className="font-semibold" style={{ color: segment.color }}>{segment.line}: {segment.from} → {segment.to}</p>
                      <p className="mt-2 text-sm text-white/75">{segment.distanceKm.toFixed(2)} km · {segment.stops.length} stations</p>
                      <p className="mt-3 text-sm leading-6 text-white/80">{segment.stops.join(" -> ")}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-md border border-turmeric/25 bg-turmeric/5 p-4">
                  <p className="text-sm font-semibold text-turmeric">Travel charges</p>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    {metroFareSource} Journey distance is calculated from the current operational line lengths and selected station path.
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-white/72 sm:grid-cols-2 lg:grid-cols-5">
                    {metroFareSlabs.map((slab) => (
                      <span key={slab.zone} className={slab.zone === metroJourney.fareZone ? "rounded-md bg-turmeric px-2 py-1 font-semibold text-charcoal" : "rounded-md bg-white/8 px-2 py-1"}>
                        Z{slab.zone}: INR {slab.fare}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-white/12 bg-white/8 p-5">
                <p className="text-white">{routeStatus || `No metro route found between ${origin} and ${destinationSlug}.`}</p>
                <p className="mt-2 text-sm text-white/70">Choose stations from the current Red, Blue, or Green metro line stops.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {routeReady && expense && routeDetails ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Metric icon={IndianRupee} label="Estimated total" value={`INR ${expense.total.toLocaleString("en-IN")}`} tone={expense.total <= budget ? "good" : "warn"} />
                <Metric icon={Navigation} label="Route distance" value={`${Math.round(routeDetails.distance)} km`} />
                <Metric icon={CalendarPlus} label="Recommended days" value={`${routeDetails.recommendedDays} day${routeDetails.recommendedDays === 1 ? "" : "s"}`} tone={days >= routeDetails.recommendedDays ? "good" : "warn"} />
                <Metric icon={ShieldCheck} label="Budget fit" value={budgetFit} tone={budgetGap >= 0 ? "good" : "warn"} />
              </div>
            ) : null}

            <div className="rounded-lg bg-charcoal p-6 text-white">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Map className="text-turmeric" />
                  <h2 className="text-2xl font-semibold">{routeReady ? activePlan?.title ?? `${originPoint?.name} to ${destination?.name}` : "Add start and destination"}</h2>
                </div>
                <div className="flex gap-2">
                  <button disabled={!routeReady} onClick={() => setShowQr((current) => !current)} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"><QrCode size={16} /> QR guide</button>
              <button disabled={!routeReady} onClick={downloadPlan} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"><Download size={16} /> Offline</button>
            </div>
          </div>
          {!routeReady ? (
            <div className="rounded-md border border-white/12 bg-white/8 p-5">
              <p className="font-semibold text-white">Route details are waiting for your inputs.</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{routeStatus}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                No budget, travel time, distance, map, or route recommendation is shown until the start and destination are both selected.
              </p>
            </div>
          ) : showQr ? (
            <div className="mb-5 grid gap-3 rounded-md border border-white/12 bg-white/8 p-4 text-sm md:grid-cols-[120px_1fr]">
              <div className="grid aspect-square grid-cols-5 gap-1 rounded bg-white p-2">
                {Array.from({ length: 25 }, (_, index) => (
                  <span key={index} className={(index + days + interests.length) % 3 === 0 || index % 7 === 0 ? "bg-charcoal" : "bg-white"} />
                ))}
              </div>
              <div>
                <p className="font-semibold text-white">Offline guide ready</p>
                <p className="mt-2 text-white/70">Use the Offline button to download the current plan as JSON for sharing, printing, or importing into a mobile wrapper.</p>
              </div>
            </div>
          ) : null}
          {routeReady && routeDetails ? (
            <>
              <div className="mb-5 overflow-hidden rounded-md border border-white/12">
                <iframe
                  title="Map for planned route"
                  src={openStreetMapRouteEmbedUrl(routeStops)}
                  className="h-80 w-full"
                  loading="lazy"
                />
              </div>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                <a
                  href={googleMapsMultiStopUrl(routeStops, routeOrigin)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-turmeric px-3 py-2 text-sm font-semibold text-charcoal"
                >
                  <Navigation size={16} /> Navigate full route
                </a>
                <a
                  href={routeStops[0] ? `https://www.openstreetmap.org/?mlat=${routeStops[0].lat}&mlon=${routeStops[0].lng}#map=12/${routeStops[0].lat}/${routeStops[0].lng}` : "https://www.openstreetmap.org"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold"
                >
                  <Map size={16} /> Open route map
                </a>
              </div>
              <div className="grid gap-4">
                {visibleRoute.map((day) => {
              const dayStops = day.stops
                .map((stop) => places.find((place) => place.name === stop))
                .filter((place): place is (typeof places)[number] => Boolean(place));
              return (
              <div key={day.day} className="rounded-md border border-white/12 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Day {day.day}</h3>
                    <p className="mt-2 text-sm text-white/75">{day.stops.length ? day.stops.join(" -> ") : "Add more interests to populate route"}</p>
                  </div>
                  {dayStops.length ? (
                    <a
                      href={googleMapsMultiStopUrl(dayStops, routeOrigin)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold"
                    >
                      <Navigation size={15} /> Day route
                    </a>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-turmeric">{day.transport}</p>
                {day.budget_note ? <p className="mt-2 text-xs text-white/55">{day.budget_note}</p> : null}
              </div>
            )})}
              </div>
              <p className="mt-6 text-sm leading-6 text-white/72">
                {activePlan?.ai_reasoning ?? `Recommended from ${originPoint?.name} to ${destination?.name}. The route uses ${Math.round(routeDetails.hours)} total hours, ${travelers} traveler${travelers === 1 ? "" : "s"}, actual place fees, route distance, stay nights, and an 8% buffer.`}
              </p>
            </>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {routeReady && expense && routeDetails ? (
            <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold"><CalendarPlus className="text-lac dark:text-turmeric" /> Expense breakdown</h3>
              {Object.entries(expense).filter(([key]) => key !== "total").map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-black/5 py-2 text-sm last:border-b-0 dark:border-white/10">
                  <span className="capitalize">{key}</span>
                  <strong>INR {value.toLocaleString("en-IN")}</strong>
                </div>
              ))}
              <div className="mt-3 rounded-md bg-pearl p-3 text-sm dark:bg-night">
                {days < routeDetails.recommendedDays
                  ? `This route needs about ${routeDetails.recommendedDays} days for a comfortable pace. Add a day or remove interests to avoid rushing.`
                  : `Your ${days}-day plan has enough time for the selected route at a comfortable pace.`}
              </div>
            </div>
          ) : null}
          <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold"><ShieldCheck className="text-lac dark:text-turmeric" /> Trip support</h3>
            {routeReady ? (
              <div className="mb-4 grid gap-2 text-sm">
                <div className="flex justify-between"><span>Safety average</span><strong>{safetyAverage}%</strong></div>
                <div className="flex justify-between"><span>Narration</span><strong>{language}</strong></div>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((item) => (
                <a key={item.label} href={`tel:${item.value}`} className="rounded-md bg-pearl px-3 py-2 text-sm font-semibold dark:bg-night">
                  {item.label}: {item.value}
                </a>
              ))}
            </div>
          </div>
        </div>
          </>
        )}
      </section>
    </div>
  );
}

function MetroMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/8 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/62">{helper}</p>
    </div>
  );
}

function MetroNetworkMap({ journey }: { journey: MetroJourney }) {
  const activeStops = new Set(journey.stops);
  const highlightedSegments = journey.segments.map((segment) => {
    const route = metroRoutes.find((item) => item.line === segment.line);
    if (!route) return "";
    return segment.stops
      .map((stop) => metroPoint(route.line, stop))
      .filter((point): point is { x: number; y: number } => Boolean(point))
      .map((point) => `${point.x},${point.y}`)
      .join(" ");
  });

  return (
    <div className="overflow-hidden rounded-md border border-white/12 bg-white p-3 text-charcoal">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Hyderabad Metro map</p>
          <p className="text-xs text-black/58">Operational Red, Blue, and Green lines with selected journey highlighted.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {metroRoutes.map((route) => (
            <span key={route.line} className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} />
              {route.line}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 1000 380" role="img" aria-label={`Metro map for ${journey.from} to ${journey.to}`} className="min-w-[760px]">
          <rect x="0" y="0" width="1000" height="380" rx="14" fill="#f8faf8" />
          {metroRoutes.map((route) => {
            const points = route.stops
              .map((stop) => metroPoint(route.line, stop))
              .filter((point): point is { x: number; y: number } => Boolean(point))
              .map((point) => `${point.x},${point.y}`)
              .join(" ");
            return <polyline key={route.line} points={points} fill="none" stroke={route.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />;
          })}
          <line x1="416" y1="260" x2="576" y2="120" stroke="#334155" strokeDasharray="8 8" strokeWidth="2" opacity="0.4" />
          <line x1="385" y1="120" x2="520" y2="120" stroke="#334155" strokeDasharray="8 8" strokeWidth="2" opacity="0.4" />
          <line x1="692" y1="260" x2="520" y2="260" stroke="#334155" strokeDasharray="8 8" strokeWidth="2" opacity="0.4" />
          {highlightedSegments.map((points, index) => points ? (
            <polyline key={`${points}-${index}`} points={points} fill="none" stroke={journey.segments[index].color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
          ) : null)}
          {metroRoutes.flatMap((route) => route.stops.map((stop) => ({ route, stop }))).map(({ route, stop }) => {
            const point = metroPoint(route.line, stop);
            if (!point) return null;
            const isActive = activeStops.has(stop);
            const isKey = isActive || stop === route.from || stop === route.to || ["Ameerpet", "MG Bus Station", "Parade Ground", "JBS Parade Ground"].includes(stop);
            return (
              <g key={`${route.line}-${stop}`}>
                <circle cx={point.x} cy={point.y} r={isActive ? 7 : 4} fill={isActive ? "#111827" : "#ffffff"} stroke={route.color} strokeWidth={isActive ? 4 : 2} />
                {isKey ? (
                  <text x={point.x} y={point.y + (point.y < 160 ? -14 : 22)} textAnchor="middle" fontSize={isActive ? 13 : 11} fontWeight={isActive ? 700 : 600} fill="#111827">
                    {compactStationName(stop)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function metroPoint(line: string, station: string) {
  const route = metroRoutes.find((item) => item.line === line);
  if (!route) return null;
  const index = route.stops.indexOf(station);
  if (index === -1) return null;
  if (line === "Green Line") {
    return { x: 520, y: 120 + (index / Math.max(1, route.stops.length - 1)) * 140 };
  }
  const y = line === "Blue Line" ? 120 : 260;
  return { x: 80 + (index / Math.max(1, route.stops.length - 1)) * 840, y };
}

function compactStationName(station: string) {
  return station
    .replace("Dr. B. R. Ambedkar ", "")
    .replace("Jubilee Hills ", "JH ")
    .replace("MG Bus Station", "MGBS")
    .replace("JBS Parade Ground", "JBS PG");
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
