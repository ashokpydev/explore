"use client";

import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ImagePlus, KeyRound, Search, Shield, Users } from "lucide-react";
import { getAdminAnalytics } from "@/lib/api";
import { events, food, places } from "@/lib/data";

export function AdminConsole() {
  const [query, setQuery] = useState("");
  const [moderated, setModerated] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [analyticsStatus, setAnalyticsStatus] = useState("Local content metrics");

  const content = useMemo(() => {
    return places
      .map((place) => ({ name: place.name, type: "Place", status: place.safetyScore > 84 ? "Ready" : "Needs safety review" }))
      .concat(food.map((spot) => ({ name: spot.name, type: "Food", status: spot.openLate ? "Night review" : "Ready" })))
      .concat(events.map((event) => ({ name: event.title, type: "Event", status: "Seasonal" })))
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const metrics = [
    ["Places", String(analytics?.places ?? places.length)],
    ["Food spots", String(analytics?.restaurants ?? food.length)],
    ["Events", String(analytics?.events ?? events.length)],
    ["Moderated", moderated.length.toString()]
  ];

  async function loadAnalytics() {
    if (!token.trim()) {
      setAnalyticsStatus("Paste an admin bearer token to load live analytics");
      return;
    }
    try {
      const data = await getAdminAnalytics(token.trim());
      setAnalytics(data.counts);
      setAnalyticsStatus("Live backend analytics loaded");
    } catch {
      setAnalyticsStatus("Could not load admin analytics with that token");
    }
  }

  return (
    <>
      <div className="mt-8 grid gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <KeyRound className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Admin bearer token"
            className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
          />
        </label>
        <button onClick={loadAnalytics} className="rounded-md bg-lac px-4 py-2 font-semibold text-white">
          Load live analytics
        </button>
        <p className="text-sm text-black/60 dark:text-white/60 md:col-span-2">{analyticsStatus}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-black/60 dark:text-white/60">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-lg bg-charcoal p-6 text-white"><BarChart3 className="mb-5 text-turmeric" /><h2 className="text-xl font-semibold">Analytics</h2><p className="mt-3 text-sm text-white/72">Live operational counts are now driven by the local content model.</p></div>
        <div className="rounded-lg bg-neem p-6 text-white"><Users className="mb-5 text-turmeric" /><h2 className="text-xl font-semibold">Users and guides</h2><p className="mt-3 text-sm text-white/72">RBAC endpoints are wired in FastAPI; guide verification can attach here.</p></div>
        <div className="rounded-lg bg-lac p-6 text-white"><Shield className="mb-5 text-turmeric" /><h2 className="text-xl font-semibold">Moderation</h2><p className="mt-3 text-sm text-white/72">Review sentiment, image tagging, and safety reports have action states.</p></div>
      </div>

      <div className="mt-8 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Content operations</h2>
          <label className="relative block md:w-80">
            <Search className="absolute left-3 top-3 text-black/45 dark:text-white/45" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search content"
              className="w-full rounded-md border border-black/10 bg-transparent py-2 pl-10 pr-3 outline-none focus:border-lac dark:border-white/10"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/10 text-black/55 dark:border-white/10 dark:text-white/55">
              <tr>
                <th className="py-3">Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={`${item.type}-${item.name}`} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td>{item.type}</td>
                  <td>{moderated.includes(item.name) ? "Approved" : item.status}</td>
                  <td>
                    <button
                      onClick={() => setModerated((current) => current.includes(item.name) ? current : [...current, item.name])}
                      className="inline-flex items-center gap-2 rounded-md bg-pearl px-3 py-2 font-semibold dark:bg-night"
                    >
                      {moderated.includes(item.name) ? <CheckCircle2 size={16} /> : <ImagePlus size={16} />}
                      {moderated.includes(item.name) ? "Approved" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
