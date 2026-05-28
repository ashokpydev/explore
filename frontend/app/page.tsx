import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Navigation, ShieldCheck, Sparkles } from "lucide-react";
import { AssistantPanel } from "@/components/assistant-panel";
import { CityCommandCenter } from "@/components/city-command-center";
import { PlaceCard } from "@/components/place-card";
import { Section } from "@/components/ui/section";
import { categories, food, highlights, places } from "@/lib/data";

export default function HomePage() {
  return (
    <main>
      <section className="bg-hyderabad-hero bg-cover bg-center">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl content-end px-4 pb-10 pt-28">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-turmeric">AI-powered Telangana city guide</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Explore Hyderabad</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/86 md:text-lg">
              Discover monuments, biryani, markets, metro routes, events, hidden gems, safety insights, and intelligent itineraries across Hyderabad and Telangana.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/planner" className="inline-flex items-center justify-center gap-2 rounded-md bg-turmeric px-5 py-3 font-semibold text-charcoal">
                Plan a trip <ArrowRight size={18} />
              </Link>
              <Link href="/explore" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/50 px-5 py-3 font-semibold">
                Explore places <MapPin size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section className="-mt-8 grid gap-4 md:grid-cols-6">
        {categories.map((item) => (
          <Link key={item.label} href={item.href} className="glass rounded-lg p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-lac focus:ring-offset-2 dark:focus:ring-turmeric">
            <span className={`${item.color} mb-4 grid h-10 w-10 place-items-center rounded-md text-white`}>
              <item.icon size={18} />
            </span>
            <p className="font-semibold">{item.label}</p>
          </Link>
        ))}
      </Section>

      <Section>
        <CityCommandCenter />
      </Section>

      <Section className="grid gap-8 lg:grid-cols-[1.45fr_.9fr]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Trending destinations</p>
              <h2 className="mt-2 text-3xl font-bold">Heritage, lakefronts, and local trails</h2>
            </div>
            <Link href="/explore" className="hidden items-center gap-2 text-sm font-semibold text-lac dark:text-turmeric md:flex">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.name} place={place} />
            ))}
          </div>
        </div>
        <AssistantPanel />
      </Section>

      <Section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-lg bg-charcoal p-6 text-white">
          <Sparkles className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Personalized AI recommendations</h3>
          <p className="mt-3 text-sm leading-6 text-white/72">Rank places by interests, time, weather, crowd levels, safety, and budget.</p>
        </div>
        <div className="rounded-lg bg-neem p-6 text-white">
          <Navigation className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Smart route optimization</h3>
          <p className="mt-3 text-sm leading-6 text-white/78">Blend metro, cab, walking, traffic buffers, and nearby stop suggestions.</p>
        </div>
        <div className="rounded-lg bg-lac p-6 text-white">
          <ShieldCheck className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Safety and accessibility</h3>
          <p className="mt-3 text-sm leading-6 text-white/78">SOS contacts, women safety ratings, accessibility notes, and emergency guidance.</p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 rounded-lg bg-white p-6 shadow-sm dark:bg-white/5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Food discovery</p>
            <h2 className="mt-2 text-3xl font-bold">Biryani, cafes, street food, and midnight cravings</h2>
          </div>
          <div className="grid gap-3">
            {food.map((item) => (
              <div key={item.name} className="grid gap-2 rounded-md border border-black/10 p-4 text-sm dark:border-white/10 md:grid-cols-3">
                <strong>{item.name}</strong>
                <span>{item.area}</span>
                <span>INR {item.costForTwo} for two | Crowd: {item.crowd}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mb-6 flex items-center gap-2">
          <CalendarDays className="text-lac dark:text-turmeric" />
          <h2 className="text-2xl font-bold">Production feature coverage</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item} className="rounded-md border border-black/10 bg-white p-4 font-medium dark:border-white/10 dark:bg-white/5">
              {item}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
