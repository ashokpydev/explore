import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Baby, CalendarDays, Camera, Heart, Hotel, MapPin, Navigation, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { AssistantPanel } from "@/components/assistant-panel";
import { CityCommandCenter } from "@/components/city-command-center";
import { PlaceCard } from "@/components/place-card";
import { Section } from "@/components/ui/section";
import { categories, food, getFoodSpotImage, highlights, places, type FoodSpot } from "@/lib/data";

export default function HomePage() {
  const topPlaces = ["charminar", "golconda-fort", "hussain-sagar", "ramoji-film-city", "salar-jung-museum", "laad-bazaar", "ananthagiri-hills", "shilparamam"]
    .map((slug) => places.find((place) => place.slug === slug))
    .filter((place): place is (typeof places)[number] => Boolean(place));
  const stayPlaces = places.filter((place) => place.category === "Hotels" || place.category === "Resorts").slice(0, 4);
  const devotionalPlaces = places.filter((place) => place.category === "Devotional").slice(0, 4);
  const familyPlaces = places.filter((place) => place.category === "Kids").slice(0, 4);
  const touristPlaces = places.filter((place) => ["Monuments", "Museums", "Lakes", "Theme Parks", "Markets"].includes(place.category)).slice(0, 6);
  const foodPreview = food.slice(0, 8);
  const restaurantPreview = foodPreview.slice(0, 6);
  const photoCollections = [
    {
      eyebrow: "Tourist places",
      title: "Landmarks, lakefronts, museums, and film-city days",
      href: "/explore",
      icon: <Camera className="text-lake" />,
      places: touristPlaces
    },
    {
      eyebrow: "Devotional places",
      title: "Temples, shrines, and peaceful day trips",
      href: "/explore?category=Devotional",
      icon: <Heart className="text-lake" />,
      places: devotionalPlaces
    },
    {
      eyebrow: "Kids zone",
      title: "Water parks, trampoline arenas, gardens, and indoor play",
      href: "/explore?category=Kids",
      icon: <Baby className="text-lake" />,
      places: familyPlaces
    },
    {
      eyebrow: "Hotels and resorts",
      title: "Business stays, resort breaks, and family weekend bases",
      href: "/explore?category=Stays",
      icon: <Hotel className="text-lake" />,
      places: stayPlaces
    }
  ];

  return (
    <main>
      <section className="bg-hyderabad-hero bg-cover bg-center">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl content-end px-4 pb-10 pt-28">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">AI-powered Telangana city guide</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Explore Hyderabad</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/86 md:text-lg">
              Discover monuments, stays, devotional places, kids activities, biryani, malls, maps, and intelligent itineraries across Hyderabad.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/planner" className="inline-flex items-center justify-center gap-2 rounded-md bg-lake px-5 py-3 font-semibold text-white">
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
          <Link key={item.label} href={item.href} className="glass rounded-lg p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-lake focus:ring-offset-2">
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
          <CategoryPreview
            eyebrow="Trending destinations"
            title="Heritage, lakes, film city, and culture"
            href="/explore"
            places={topPlaces}
          />
        </div>
        <AssistantPanel />
      </Section>

      <Section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lake dark:text-turmeric">Photo guides</p>
            <h2 className="mt-2 text-3xl font-bold">Browse Hyderabad by mood</h2>
          </div>
          <Link href="/explore" className="hidden items-center gap-2 text-sm font-semibold text-lake dark:text-turmeric md:flex">
            Open full guide <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {photoCollections.map((collection) => (
            <PhotoCollection key={collection.eyebrow} {...collection} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8">
          <CategoryPreview
            eyebrow="Hotels and resorts"
            title="Simple stay options for business, family, and weekend breaks"
            href="/explore?category=Stays"
            places={stayPlaces}
            icon={<Hotel className="text-lake" />}
          />
          <CategoryPreview
            eyebrow="Devotional places"
            title="Temples and spiritual day trips"
            href="/explore?category=Devotional"
            places={devotionalPlaces}
            icon={<Heart className="text-lake" />}
          />
          <CategoryPreview
            eyebrow="Kids and family"
            title="Play zones, water parks, parks, and indoor fun"
            href="/explore?category=Kids"
            places={familyPlaces}
            icon={<Sparkles className="text-lake" />}
          />
        </div>
      </Section>

      <Section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-lg bg-lake p-6 text-white">
          <Sparkles className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Personalized AI recommendations</h3>
          <p className="mt-3 text-sm leading-6 text-white/72">Rank places by interests, time, weather, crowd levels, safety, and budget.</p>
        </div>
        <div className="rounded-lg bg-neem p-6 text-white">
          <Navigation className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Smart route optimization</h3>
          <p className="mt-3 text-sm leading-6 text-white/78">Blend metro, cab, walking, traffic buffers, and nearby stop suggestions.</p>
        </div>
        <div className="rounded-lg bg-charcoal p-6 text-white">
          <ShieldCheck className="mb-5 text-turmeric" />
          <h3 className="text-xl font-semibold">Safety and accessibility</h3>
          <p className="mt-3 text-sm leading-6 text-white/78">SOS contacts, women safety ratings, accessibility notes, and emergency guidance.</p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 rounded-lg border border-lake/20 bg-white p-6 shadow-sm dark:bg-white/5 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="text-lake dark:text-turmeric" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lake dark:text-turmeric">Restaurants</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold">Biryani, cafes, street food, and midnight cravings</h2>
            <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/65">
              Photo-led restaurant picks with budget, crowd, late-night, and safety notes for quick decisions.
            </p>
            <Link href="/food" className="mt-5 inline-flex items-center gap-2 rounded-md bg-lake px-4 py-2 text-sm font-semibold text-white">
              View restaurant guide <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {restaurantPreview.map((item) => (
              <RestaurantPreviewCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mb-6 flex items-center gap-2">
          <CalendarDays className="text-lake dark:text-turmeric" />
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

function PhotoCollection({
  eyebrow,
  title,
  href,
  places: sectionPlaces,
  icon
}: {
  eyebrow: string;
  title: string;
  href: string;
  places: typeof places;
  icon: ReactNode;
}) {
  const hero = sectionPlaces[0];
  const supporting = sectionPlaces.slice(1, 4);

  if (!hero) return null;

  return (
    <Link href={href} className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium dark:border-white/10 dark:bg-white/5">
      <div className="grid min-h-[260px] grid-cols-[1.35fr_.65fr] gap-2 p-2">
        <div className="relative overflow-hidden rounded-md">
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            sizes="(max-width: 768px) 70vw, 35vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized={hero.image.endsWith(".svg")}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-4 text-white">
            <p className="text-sm font-semibold">{hero.name}</p>
            <p className="mt-1 text-xs text-white/78">{hero.type}</p>
          </div>
        </div>
        <div className="grid gap-2">
          {supporting.map((place) => (
            <div key={place.name} className="relative overflow-hidden rounded-md bg-pearl dark:bg-night">
              <Image
                src={place.image}
                alt={place.name}
                fill
                sizes="(max-width: 768px) 30vw, 14vw"
                className="object-cover"
                unoptimized={place.image.endsWith(".svg")}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lake dark:text-turmeric">{eyebrow}</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <ArrowRight className="mt-1 shrink-0 text-lake transition group-hover:translate-x-1 dark:text-turmeric" size={18} />
        </div>
      </div>
    </Link>
  );
}

function RestaurantPreviewCard({ item }: { item: FoodSpot }) {
  const image = getFoodSpotImage(item);

  return (
    <Link href={`/food?q=${encodeURIComponent(item.name)}`} className="group overflow-hidden rounded-lg border border-black/10 bg-pearl transition hover:-translate-y-0.5 hover:shadow-premium dark:border-white/10 dark:bg-night">
      <div className="relative aspect-[4/3]">
        <Image
          src={image}
          alt={`${item.name} food photo`}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized={image.endsWith(".svg")}
        />
      </div>
      <div className="space-y-2 p-4 text-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{item.name}</h3>
          <span className="shrink-0 rounded-md bg-turmeric px-2 py-1 text-xs font-bold text-charcoal">{item.rating}</span>
        </div>
        <p className="text-black/62 dark:text-white/62">{item.area}</p>
        <p className="font-medium">INR {item.costForTwo.toLocaleString("en-IN")} for two</p>
      </div>
    </Link>
  );
}

function CategoryPreview({
  eyebrow,
  title,
  href,
  places: sectionPlaces,
  icon
}: {
  eyebrow: string;
  title: string;
  href: string;
  places: typeof places;
  icon?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lake dark:text-turmeric">{eyebrow}</p>
          </div>
          <h2 className="mt-2 text-3xl font-bold">{title}</h2>
        </div>
        <Link href={href} className="hidden items-center gap-2 text-sm font-semibold text-lake dark:text-turmeric md:flex">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {sectionPlaces.map((place, index) => (
          <PlaceCard key={place.name} place={place} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}
