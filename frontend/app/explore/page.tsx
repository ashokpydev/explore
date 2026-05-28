import { Filter } from "lucide-react";
import { InteractiveExplore } from "@/components/interactive-explore";
import { Section } from "@/components/ui/section";

const chips = ["Charminar", "Golconda", "Tank Bund", "Ramoji Film City", "Temples", "Mosques", "Lakes", "Hidden gems", "Weekend getaways"];

export default function ExplorePage() {
  return (
    <main>
      <Section>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Explore Hyderabad</p>
            <h1 className="mt-2 text-4xl font-bold">Places with history, timings, fees, reviews, and AI tips</h1>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-charcoal px-4 py-3 text-white dark:bg-turmeric dark:text-charcoal">
            <Filter size={18} /> Filters
          </button>
        </div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {chips.map((chip) => (
            <button key={chip} className="shrink-0 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10">
              {chip}
            </button>
          ))}
        </div>
        <InteractiveExplore />
      </Section>
    </main>
  );
}
