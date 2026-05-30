import { Filter } from "lucide-react";
import { InteractiveExplore } from "@/components/interactive-explore";
import { Section } from "@/components/ui/section";

const chips = [
  "Charminar",
  "Golconda",
  "Tank Bund",
  "Ramoji Film City",
  "Malls",
  "Restaurants",
  "Hotels and resorts",
  "Kids play zones",
  "Devotional places",
  "Popular theaters",
  "Temples",
  "Mosques",
  "Lakes",
  "Theme parks",
  "Hidden gems",
  "Weekend getaways"
];
const chipHref: Record<string, string> = {
  Charminar: "/explore?place=charminar",
  Golconda: "/explore?place=golconda-fort",
  "Tank Bund": "/explore?place=hussain-sagar",
  "Ramoji Film City": "/explore?place=ramoji-film-city",
  Malls: "/explore?category=Malls",
  Restaurants: "/food",
  "Hotels and resorts": "/explore?category=Stays",
  "Kids play zones": "/explore?category=Kids",
  "Devotional places": "/explore?category=Devotional",
  "Popular theaters": "/explore?category=Theaters",
  Temples: "/explore?category=Temples",
  Mosques: "/explore?category=Mosques",
  Lakes: "/explore?category=Lakes",
  "Theme parks": "/explore?category=Theme Parks",
  "Hidden gems": "/explore?category=Hidden Gems",
  "Weekend getaways": "/explore?category=Weekend"
};

type ExplorePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = (await searchParams) ?? {};
  const initialState = {
    category: firstParam(params.category),
    place: firstParam(params.place),
    q: firstParam(params.q),
    safe: firstParam(params.safe) === "true",
    focusSearch: firstParam(params.focus) === "search"
  };
  const exploreStateKey = JSON.stringify(initialState);

  return (
    <main>
      <Section>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Explore Hyderabad</p>
            <h1 className="mt-2 text-4xl font-bold">Places with history, timings, fees, reviews, and AI tips</h1>
          </div>
          <a href="/explore?focus=search" className="inline-flex items-center justify-center gap-2 rounded-md bg-charcoal px-4 py-3 text-white dark:bg-turmeric dark:text-charcoal">
            <Filter size={18} /> Filters
          </a>
        </div>
        <div className="mb-8 flex max-w-full gap-2 overflow-x-auto pb-2">
          {chips.map((chip) => (
            <a key={chip} href={chipHref[chip] ?? `/explore?focus=search&q=${encodeURIComponent(chip)}`} className="shrink-0 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10">
              {chip}
            </a>
          ))}
        </div>
        <InteractiveExplore key={exploreStateKey} initialState={initialState} />
      </Section>
    </main>
  );
}
