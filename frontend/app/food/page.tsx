import { InteractiveFood } from "@/components/interactive-food";
import { Section } from "@/components/ui/section";

type FoodPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const params = (await searchParams) ?? {};
  const initialQuery = firstParam(params.q) ?? "";

  return (
    <main>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Food discovery</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold">Biryani, street food, cafes, rooftops, and midnight Hyderabad</h1>
        <InteractiveFood key={initialQuery} initialQuery={initialQuery} />
      </Section>
    </main>
  );
}
