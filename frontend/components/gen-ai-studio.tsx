"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BrainCircuit,
  Camera,
  Database,
  FlaskConical,
  FileCheck2,
  Gauge,
  Loader2,
  type LucideIcon,
  Route,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import {
  critiqueTrip,
  extractIntent,
  getAIUsageSummary,
  getGenAIShowcase,
  ingestKnowledge,
  moderateContent,
  runRAGEval,
  tagTravelImage,
  type AIUsageSummary,
  type GenAIShowcase,
  type ImageTaggingResult,
  type IngestionResult,
  type IntentExtraction,
  type ModerationResult,
  type RAGEvalResult,
  type TripCritiqueResult
} from "@/lib/api";

const demoItinerary = [
  {
    day: 1,
    stops: ["Charminar", "Laad Bazaar", "Salar Jung Museum", "Hussain Sagar"],
    transport: "Metro, auto, and cab",
    budget_note: "Keep shopping separate from food spend."
  },
  {
    day: 2,
    stops: ["Golconda Fort", "Qutb Shahi Tombs", "Jubilee Hills cafe trail"],
    transport: "Cab and walking",
    budget_note: "Reserve for fort tickets, water, and dinner."
  }
];

export function GenAIStudio() {
  const [prompt, setPrompt] = useState("Plan my 2-day Hyderabad trip under INR 8000 with biryani, metro, and safe evening places");
  const [review, setReview] = useState("Great heritage walk, but the queue was badly managed near the entrance.");
  const [caption, setCaption] = useState("Charminar night market with bangles, food stalls, and heritage lights");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [intent, setIntent] = useState<IntentExtraction | null>(null);
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [imageTags, setImageTags] = useState<ImageTaggingResult | null>(null);
  const [critique, setCritique] = useState<TripCritiqueResult | null>(null);
  const [ingestion, setIngestion] = useState<IngestionResult | null>(null);
  const [ragEval, setRagEval] = useState<RAGEvalResult | null>(null);
  const [usage, setUsage] = useState<AIUsageSummary | null>(null);
  const [showcase, setShowcase] = useState<GenAIShowcase | null>(null);

  useEffect(() => {
    getGenAIShowcase()
      .then(setShowcase)
      .catch(() => {
        setShowcase({
          capabilities: [],
          architecture: ["FastAPI", "Next.js", "PostgreSQL/PostGIS", "pgvector", "Redis", "Celery"],
          open_stack: ["FastAPI", "Next.js", "pgvector", "PostGIS", "Redis", "Celery"],
          cv_bullets: [
            "Built a GenAI travel platform with RAG, vector search, structured planning, moderation, and media tagging."
          ]
        });
      });
  }, []);

  const stack = useMemo(() => showcase?.open_stack.slice(0, 9) ?? [], [showcase]);

  async function runIntent() {
    setLoading("intent");
    try {
      setIntent(await extractIntent(prompt));
    } finally {
      setLoading(null);
    }
  }

  async function runModeration() {
    setLoading("moderation");
    try {
      setModeration(await moderateContent(review));
    } finally {
      setLoading(null);
    }
  }

  async function runImageTags() {
    setLoading("image");
    try {
      setImageTags(await tagTravelImage({ caption, place_hint: "Charminar" }));
    } finally {
      setLoading(null);
    }
  }

  async function runCritique() {
    setLoading("critique");
    try {
      setCritique(await critiqueTrip({ itinerary: demoItinerary, budget_inr: 8000, traveler_type: "family" }));
    } finally {
      setLoading(null);
    }
  }

  async function runIngestion() {
    if (!adminToken.trim()) return;
    setLoading("ingestion");
    try {
      setIngestion(await ingestKnowledge(adminToken.trim()));
    } finally {
      setLoading(null);
    }
  }

  async function runEval() {
    if (!adminToken.trim()) return;
    setLoading("eval");
    try {
      setRagEval(await runRAGEval(adminToken.trim()));
    } finally {
      setLoading(null);
    }
  }

  async function runUsage() {
    if (!adminToken.trim()) return;
    setLoading("usage");
    try {
      setUsage(await getAIUsageSummary(adminToken.trim()));
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-lac dark:text-turmeric">
            <BrainCircuit size={16} /> GenAI application layer
          </p>
          <h2 className="mt-2 text-2xl font-bold">RAG, agents, moderation, vision metadata, and critique APIs</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/65 dark:text-white/65">
            These controls call the backend AI service directly and still work in offline demo mode when no model key is configured.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <span key={item} className="rounded-md bg-pearl px-3 py-2 text-xs font-semibold dark:bg-night">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StudioPanel
          icon={Sparkles}
          title="Prompt intelligence"
          action="Extract intent"
          loading={loading === "intent"}
          onRun={runIntent}
        >
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="h-24 w-full resize-none rounded-md border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-lac dark:border-white/10"
          />
          {intent ? (
            <ResultBlock
              lines={[
                `Intent: ${intent.intent} (${Math.round(intent.confidence * 100)}%)`,
                `Tools: ${intent.recommended_tools.join(", ")}`,
                `Entities: ${JSON.stringify(intent.entities)}`
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={ShieldAlert}
          title="AI moderation"
          action="Moderate"
          loading={loading === "moderation"}
          onRun={runModeration}
        >
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            className="h-24 w-full resize-none rounded-md border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-lac dark:border-white/10"
          />
          {moderation ? (
            <ResultBlock
              lines={[
                `Decision: ${moderation.decision}`,
                `Severity: ${Math.round(moderation.severity * 100)}%`,
                `Flags: ${moderation.categories.join(", ") || "none"}`,
                moderation.rewritten_text ? `Rewrite: ${moderation.rewritten_text}` : moderation.rationale
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={Camera}
          title="Vision metadata"
          action="Tag media"
          loading={loading === "image"}
          onRun={runImageTags}
        >
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="h-24 w-full resize-none rounded-md border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-lac dark:border-white/10"
          />
          {imageTags ? (
            <ResultBlock
              lines={[
                imageTags.alt_text,
                `Tags: ${imageTags.tags.join(", ")}`,
                `Caption: ${imageTags.suggested_caption}`
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={Route}
          title="Trip critique"
          action="Critique demo route"
          loading={loading === "critique"}
          onRun={runCritique}
        >
          <div className="rounded-md bg-pearl p-3 text-xs leading-5 dark:bg-night">
            {demoItinerary.map((day) => (
              <p key={day.day}>
                Day {day.day}: {day.stops.join(" -> ")}
              </p>
            ))}
          </div>
          {critique ? (
            <ResultBlock
              lines={[
                `Score: ${Math.round(critique.score)}/100`,
                `Risks: ${critique.risks.join(" ")}`,
                `Optimizations: ${critique.optimizations.slice(0, 2).join(" ")}`
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={Database}
          title="Knowledge ingestion"
          action="Ingest demo note"
          loading={loading === "ingestion"}
          onRun={runIngestion}
          disabled={!adminToken.trim()}
        >
          <AdminTokenInput value={adminToken} onChange={setAdminToken} />
          <p className="mt-3 text-xs leading-5 text-black/60 dark:text-white/60">
            Adds a curated open travel note into the RAG index and records an ingestion run.
          </p>
          {ingestion ? (
            <ResultBlock
              lines={[
                `Status: ${ingestion.status}`,
                `Documents: ${ingestion.documents_seen}`,
                `Chunks indexed: ${ingestion.chunks_indexed}`,
                `Embedded: ${ingestion.embedded}`
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={FlaskConical}
          title="RAG evaluation"
          action="Run eval"
          loading={loading === "eval"}
          onRun={runEval}
          disabled={!adminToken.trim()}
        >
          <AdminTokenInput value={adminToken} onChange={setAdminToken} />
          <p className="mt-3 text-xs leading-5 text-black/60 dark:text-white/60">
            Executes retrieval smoke tests for required terms and citation coverage.
          </p>
          {ragEval ? (
            <ResultBlock
              lines={[
                `Run: ${ragEval.name}`,
                `Average score: ${ragEval.average_score}`,
                `Pass rate: ${Math.round(ragEval.pass_rate * 100)}%`
              ]}
            />
          ) : null}
        </StudioPanel>

        <StudioPanel
          icon={Gauge}
          title="AI observability"
          action="Load usage"
          loading={loading === "usage"}
          onRun={runUsage}
          disabled={!adminToken.trim()}
        >
          <AdminTokenInput value={adminToken} onChange={setAdminToken} />
          <p className="mt-3 text-xs leading-5 text-black/60 dark:text-white/60">
            Reads token estimates, latency, operation breakdown, and recent AI calls.
          </p>
          {usage ? (
            <ResultBlock
              lines={[
                `Requests: ${usage.total_requests}`,
                `Tokens: ${usage.total_tokens}`,
                `Average latency: ${usage.average_latency_ms} ms`,
                `Estimated cost: $${usage.estimated_cost_usd}`
              ]}
            />
          ) : null}
        </StudioPanel>
      </div>

      {showcase?.cv_bullets.length ? (
        <div className="mt-6 rounded-md bg-charcoal p-4 text-sm text-white">
          <p className="mb-3 flex items-center gap-2 font-semibold text-turmeric">
            <FileCheck2 size={17} /> CV-ready implementation bullets
          </p>
          <ul className="grid gap-2">
            {showcase.cv_bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function StudioPanel({
  icon: Icon,
  title,
  action,
  loading,
  onRun,
  disabled = false,
  children
}: {
  icon: LucideIcon;
  title: string;
  action: string;
  loading: boolean;
  onRun: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <Icon size={18} className="text-lac dark:text-turmeric" /> {title}
        </h3>
        <button
          type="button"
          onClick={onRun}
          disabled={loading || disabled}
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-lac px-3 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {action}
        </button>
      </div>
      {children}
    </div>
  );
}

function AdminTokenInput({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-lac dark:border-white/10"
      placeholder="Admin bearer token for protected AI ops"
      type="password"
    />
  );
}

function ResultBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mt-3 rounded-md bg-neem/10 p-3 text-xs leading-5 text-black/72 dark:bg-white/10 dark:text-white/75">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
