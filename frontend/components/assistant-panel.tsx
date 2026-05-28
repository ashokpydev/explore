"use client";

import { FormEvent, useState } from "react";
import { Bot, Send } from "lucide-react";
import { aiChat } from "@/lib/api";

const quickPrompts = [
  "Plan my Hyderabad trip",
  "Best biryani near me",
  "2-day budget itinerary",
  "Women-safe nightlife plan",
  "Metro route to Charminar",
  "Family evening around Hussain Sagar"
];

export function AssistantPanel({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("Plan my 2-day Hyderabad trip with biryani and monuments");
  const [answer, setAnswer] = useState("Ask for itineraries, biryani nearby, family plans, romantic spots, metro routes, safety, or budget travel.");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  async function ask(nextMessage = message) {
    if (!nextMessage.trim()) return;
    setLoading(true);
    try {
      const data = await aiChat(nextMessage);
      setAnswer(data.answer);
      setHistory((current) => [nextMessage, ...current].slice(0, 4));
    } catch {
      setAnswer("The assistant API is offline. Start the FastAPI service or configure NEXT_PUBLIC_API_URL.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await ask(message);
  }

  async function handlePrompt(prompt: string) {
    setMessage(prompt);
    await ask(prompt);
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-premium dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neem text-white">
          <Bot size={20} />
        </span>
        <div>
          <h2 className="font-semibold">AI Travel Assistant</h2>
          <p className="text-sm text-black/60 dark:text-white/60">RAG-ready Hyderabad guide</p>
        </div>
      </div>
      <div className="min-h-40 rounded-md bg-pearl p-4 text-sm leading-6 dark:bg-night">{loading ? "Thinking through timings, traffic, weather, and taste..." : answer}</div>
      {!compact ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handlePrompt(prompt)}
              className="shrink-0 rounded-md border border-black/10 px-3 py-2 text-xs font-semibold dark:border-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-lac dark:border-white/10"
          aria-label="Assistant prompt"
        />
        <button className="grid h-10 w-10 place-items-center rounded-md bg-lac text-white" aria-label="Send">
          <Send size={17} />
        </button>
      </form>
      {history.length ? (
        <div className="mt-4 border-t border-black/10 pt-3 text-xs text-black/55 dark:border-white/10 dark:text-white/55">
          Recent: {history.join(" | ")}
        </div>
      ) : null}
    </div>
  );
}
