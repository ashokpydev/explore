import Link from "next/link";
import { ArrowRight, MapPinned, Utensils } from "lucide-react";
import { AssistantPanel } from "@/components/assistant-panel";
import { Section } from "@/components/ui/section";
import { emergencyContacts, metroRoutes } from "@/lib/data";

const assistantActions = [
  { label: "Plan my Hyderabad trip", href: "/planner", helper: "Build a timed route with budget." },
  { label: "Best biryani near me", href: "/food?query=biryani", helper: "Compare biryani spots and menus." },
  { label: "Budget weekend plan", href: "/planner?trip=budget", helper: "Keep spend low and route short." },
  { label: "Romantic places", href: "/explore?focus=search&q=romantic", helper: "Evening-safe lake and dining ideas." },
  { label: "Family-friendly spots", href: "/explore?focus=search&q=family", helper: "Kids, parks, museums, and resorts." },
  { label: "Metro route to Charminar", href: "/planner?mode=metro&destination=charminar", helper: "Use metro plus last-mile options." }
];

export default function AssistantPage() {
  return (
    <main>
      <Section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">AI assistant</p>
          <h1 className="mt-2 text-4xl font-bold">Ask Hyderabad anything</h1>
          <p className="mt-4 max-w-2xl text-black/68 dark:text-white/68">
            Ask for itineraries, food, metro routes, safe evening plans, devotional stops, kids activities, shopping, stay options, or budget guidance. The assistant now turns answers into quick actions.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {assistantActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-md border border-black/10 bg-white p-4 text-sm font-medium transition hover:-translate-y-0.5 hover:border-lac hover:shadow-premium dark:border-white/10 dark:bg-white/5"
              >
                <span className="flex items-center justify-between gap-3">
                  {action.label}
                  <ArrowRight size={16} className="text-lac opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-turmeric" />
                </span>
                <span className="mt-2 block text-xs font-normal text-black/58 dark:text-white/58">{action.helper}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-charcoal p-5 text-white">
              <h2 className="flex items-center gap-2 font-semibold"><MapPinned size={18} className="text-turmeric" /> Metro intelligence</h2>
              <p className="mt-3 text-sm text-white/72">{metroRoutes[0].from} to {metroRoutes[0].to}: {metroRoutes[0].duration}, {metroRoutes[0].interchange}.</p>
              <Link href="/planner?mode=metro" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-turmeric">
                Open route planner <ArrowRight size={15} />
              </Link>
            </div>
            <div className="rounded-lg bg-lac p-5 text-white">
              <h2 className="flex items-center gap-2 font-semibold"><Utensils size={18} className="text-turmeric" /> SOS shortcuts</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {emergencyContacts.map((item) => (
                  <a key={item.label} href={`tel:${item.value}`} className="rounded-md bg-white/12 px-3 py-2 text-sm">{item.label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <AssistantPanel />
      </Section>
    </main>
  );
}
