import { AdminConsole } from "@/components/admin-console";
import { Section } from "@/components/ui/section";

export default function AdminPage() {
  return (
    <main>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">Admin panel</p>
        <h1 className="mt-2 text-4xl font-bold">Operations, content, moderation, and SEO</h1>
        <AdminConsole />
      </Section>
    </main>
  );
}
