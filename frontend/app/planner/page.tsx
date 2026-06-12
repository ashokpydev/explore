import { InteractivePlanner } from "@/components/interactive-planner";
import { Section } from "@/components/ui/section";

type PlannerPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const params = (await searchParams) ?? {};
  return (
    <main>
      <Section>
        <InteractivePlanner initialOrigin={firstParam(params.origin)} initialDestination={firstParam(params.destination)} mode={firstParam(params.mode)} />
      </Section>
    </main>
  );
}
