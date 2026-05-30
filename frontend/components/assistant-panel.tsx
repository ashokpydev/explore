"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Bot, Check, Clipboard, ExternalLink, Loader2, MapPinned, MessageSquare, Send, Sparkles, Volume2 } from "lucide-react";
import { aiChat } from "@/lib/api";
import { emergencyContacts, food, metroRoutes, places } from "@/lib/data";
import { googleMapsSearchUrl } from "@/lib/maps";

type AssistantResult = {
  answer: string;
  bullets: string[];
  actions: Array<{ label: string; href: string; external?: boolean }>;
  citations: string[];
};

const quickPrompts = [
  "Plan my Hyderabad trip",
  "Best biryani near me",
  "2-day budget itinerary",
  "Women-safe nightlife plan",
  "Metro route to Charminar",
  "Family evening around Hussain Sagar"
];

const starterResult: AssistantResult = {
  answer: "Tell me what you want to do in Hyderabad. I can turn it into a route, food shortlist, map search, or planner handoff.",
  bullets: [
    "Try a full trip plan with days, budget, travelers, and start point.",
    "Ask for biryani, cafes, kids play zones, devotional places, malls, resorts, or safe night options.",
    "Use the action buttons after each answer to jump into the right page."
  ],
  actions: [
    { label: "Open planner", href: "/planner" },
    { label: "Browse food", href: "/food" },
    { label: "Explore places", href: "/explore" }
  ],
  citations: ["Local Hyderabad place, food, metro, and emergency datasets."]
};

export function AssistantPanel({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("Plan my 2-day Hyderabad trip with biryani and monuments");
  const [result, setResult] = useState<AssistantResult>(starterResult);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const visibleHistory = useMemo(() => history.slice(0, compact ? 2 : 5), [compact, history]);

  async function ask(nextMessage = message) {
    const prompt = nextMessage.trim();
    if (!prompt) return;
    setLoading(true);
    setCopied(false);
    const local = buildLocalResult(prompt);
    try {
      const data = await aiChat(prompt);
      setResult({
        answer: data.answer || local.answer,
        bullets: data.suggestions?.length ? data.suggestions.slice(0, 4) : local.bullets,
        actions: local.actions,
        citations: data.citations?.length ? data.citations.slice(0, 3) : local.citations
      });
    } catch {
      setResult(local);
    } finally {
      setHistory((current) => [prompt, ...current.filter((item) => item !== prompt)].slice(0, 6));
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

  async function copyAnswer() {
    const text = [result.answer, ...result.bullets.map((item) => `- ${item}`)].join("\n");
    await navigator.clipboard?.writeText(text);
    setCopied(true);
  }

  function speakAnswer() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.answer));
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-premium dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-neem text-white">
            <Bot size={20} />
          </span>
          <div>
            <h2 className="font-semibold">AI Travel Assistant</h2>
            <p className="text-sm text-black/60 dark:text-white/60">Interactive Hyderabad guide</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyAnswer}
            className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-black/70 hover:bg-pearl dark:border-white/10 dark:text-white/75 dark:hover:bg-white/10"
            aria-label="Copy answer"
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
          </button>
          <button
            type="button"
            onClick={speakAnswer}
            className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-black/70 hover:bg-pearl dark:border-white/10 dark:text-white/75 dark:hover:bg-white/10"
            aria-label="Read answer aloud"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      <div className="rounded-md bg-pearl p-4 text-sm leading-6 dark:bg-night">
        {loading ? (
          <span className="inline-flex items-center gap-2 font-medium">
            <Loader2 size={16} className="animate-spin" /> Thinking through routes, food, safety, and budget...
          </span>
        ) : (
          <>
            <p>{result.answer}</p>
            <ul className="mt-3 grid gap-2">
              {result.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <Sparkles size={15} className="mt-1 shrink-0 text-lac dark:text-turmeric" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {result.actions.map((action) => (
          action.external ? (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-lac px-3 py-2 text-sm font-semibold text-white transition hover:bg-lac/90"
            >
              {action.label} <ExternalLink size={14} />
            </a>
          ) : (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-lac px-3 py-2 text-sm font-semibold text-white transition hover:bg-lac/90"
            >
              {action.label} <MapPinned size={14} />
            </Link>
          )
        ))}
      </div>

      {!compact ? (
        <div className="relative z-10 mt-4 flex flex-wrap gap-2 pb-1">
          {quickPrompts.map((prompt) => (
            <button
              type="button"
              key={prompt}
              onClick={() => handlePrompt(prompt)}
              className="rounded-md border border-black/10 px-3 py-2 text-xs font-semibold transition hover:border-lac hover:bg-pearl dark:border-white/10 dark:hover:bg-white/10"
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
          placeholder="Ask for food, routes, budget, safety, timings..."
        />
        <button className="grid h-10 w-10 place-items-center rounded-md bg-lac text-white" aria-label="Send">
          <Send size={17} />
        </button>
      </form>

      {visibleHistory.length ? (
        <div className="mt-4 border-t border-black/10 pt-3 text-xs text-black/55 dark:border-white/10 dark:text-white/55">
          <p className="mb-2 flex items-center gap-1 font-semibold"><MessageSquare size={13} /> Recent prompts</p>
          <div className="flex flex-wrap gap-2">
            {visibleHistory.map((item) => (
              <button key={item} type="button" onClick={() => handlePrompt(item)} className="rounded-md bg-pearl px-2 py-1 dark:bg-night">
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildLocalResult(prompt: string): AssistantResult {
  const text = prompt.toLowerCase();
  const topFood = food.slice(0, 3);
  const safePlaces = places.filter((place) => place.safetyScore >= 88).slice(0, 3);
  const familyPlaces = places.filter((place) => place.tags.some((tag) => ["family", "kids", "museum", "lake"].includes(tag))).slice(0, 4);

  if (text.includes("biryani") || text.includes("food") || text.includes("restaurant")) {
    return {
      answer: "For food, start with nearby filters and then choose based on members, budget, and open-late status.",
      bullets: topFood.map((spot) => `${spot.name} in ${spot.area}: ${spot.specialties.slice(0, 2).join(", ")}. Estimated INR ${spot.costForTwo.toLocaleString("en-IN")} for two.`),
      actions: [
        { label: "Open food guide", href: "/food?query=biryani" },
        { label: "Search in Google Maps", href: googleMapsSearchUrl("best biryani near me Hyderabad"), external: true }
      ],
      citations: ["Local restaurant directory and menu inference data."]
    };
  }

  if (text.includes("metro") || text.includes("charminar")) {
    const route = metroRoutes[0];
    return {
      answer: `${route.from} to ${route.to} is usually best as ${route.line}, with interchange at ${route.interchange}.`,
      bullets: [`Duration: ${route.duration}.`, `Fare: ${route.fare}.`, "Use the planner for last-mile cab or auto recommendations."],
      actions: [
        { label: "Open planner", href: "/planner?mode=metro&destination=charminar" },
        { label: "Open map search", href: googleMapsSearchUrl(`${route.from} to ${route.to}`), external: true }
      ],
      citations: ["Hyderabad metro route reference in local data."]
    };
  }

  if (text.includes("safe") || text.includes("women") || text.includes("night")) {
    return {
      answer: "For safer evening plans, prefer well-lit, high-footfall areas and pre-book return transport.",
      bullets: [
        ...safePlaces.map((place) => `${place.name}: safety score ${place.safetyScore}, best time ${place.bestTime}.`),
        `Emergency: Police ${emergencyContacts[0].value}, Women safety ${emergencyContacts[1].value}.`
      ],
      actions: [
        { label: "Women-safe picks", href: "/explore?safe=true" },
        { label: "Open planner", href: "/planner?trip=family" }
      ],
      citations: ["Local safety scores and emergency contact dataset."]
    };
  }

  if (text.includes("family") || text.includes("kids")) {
    return {
      answer: "For families, keep stops close together and mix one indoor activity with one outdoor or food stop.",
      bullets: familyPlaces.map((place) => `${place.name}: ${place.category}, ${place.durationHours} hr, fee INR ${place.fee}.`),
      actions: [
        { label: "Explore family places", href: "/explore?focus=search&q=family" },
        { label: "Create family plan", href: "/planner?trip=family" }
      ],
      citations: ["Local places dataset with duration, category, fee, and tags."]
    };
  }

  return {
    answer: "A good Hyderabad plan should choose start point, destination, available hours, group size, and food preference before estimating budget.",
    bullets: [
      "Start with Charminar plus Salar Jung Museum for heritage.",
      "Add Hussain Sagar or Tank Bund for evening views.",
      "Use the planner when you know the starting point and destination so distance and budget stay accurate."
    ],
    actions: [
      { label: "Open planner", href: "/planner" },
      { label: "Explore places", href: "/explore" },
      { label: "Browse restaurants", href: "/food" }
    ],
    citations: ["Local places, food, and planner datasets."]
  };
}
