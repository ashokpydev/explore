import { InteractiveFood } from "@/components/interactive-food";
import { Section } from "@/components/ui/section";

export default function FoodPage() {
  return (
    <main>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Food discovery</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold">Biryani, street food, cafes, rooftops, and midnight Hyderabad</h1>
        <InteractiveFood />
      </Section>
    </main>
  );
}
