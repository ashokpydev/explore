import { AssistantPanel } from "@/components/assistant-panel";
import { Section } from "@/components/ui/section";
import { emergencyContacts, metroRoutes } from "@/lib/data";

export default function AssistantPage() {
  return (
    <main>
      <Section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">AI assistant</p>
          <h1 className="mt-2 text-4xl font-bold">Ask Hyderabad anything</h1>
          <p className="mt-4 max-w-2xl text-black/68 dark:text-white/68">
            The assistant is wired for RAG, semantic search, multilingual travel help, voice narration, sentiment-aware reviews, OCR menu/signboard assistance, and personalized recommendations.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Plan my Hyderabad trip", "Best biryani near me", "Budget weekend plan", "Romantic places", "Family-friendly spots", "Metro route to Charminar"].map((prompt) => (
              <div key={prompt} className="rounded-md border border-black/10 bg-white p-4 text-sm font-medium dark:border-white/10 dark:bg-white/5">{prompt}</div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-charcoal p-5 text-white">
              <h2 className="font-semibold">Metro intelligence</h2>
              <p className="mt-3 text-sm text-white/72">{metroRoutes[0].from} to {metroRoutes[0].to}: {metroRoutes[0].duration}, {metroRoutes[0].interchange}.</p>
            </div>
            <div className="rounded-lg bg-lac p-5 text-white">
              <h2 className="font-semibold">SOS shortcuts</h2>
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
