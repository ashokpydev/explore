import { metroRoutes } from "@/lib/data";

export type FareSlab = {
  zone: number;
  label: string;
  maxKm: number | null;
  fare: number;
};

export type MetroJourney = {
  from: string;
  to: string;
  lineSummary: string;
  stops: string[];
  stationCount: number;
  distanceKm: number;
  durationMins: number;
  fare: number;
  fareZone: number;
  fareLabel: string;
  transfers: string[];
  segments: Array<{
    line: string;
    color: string;
    from: string;
    to: string;
    stops: string[];
    distanceKm: number;
  }>;
};

type Edge = {
  to: string;
  line: string;
  color: string;
  distanceKm: number;
};

type PathState = {
  station: string;
  distanceKm: number;
  path: Array<{ station: string; line: string; color: string; distanceKm: number; legDistanceKm: number }>;
};

const INTERCHANGE_EDGES: Array<{ from: string; to: string; label: string }> = [
  { from: "Parade Ground", to: "JBS Parade Ground", label: "Parade Ground / JBS Parade Ground" }
];

const TRANSFER_BUFFER_MINS = 5;
const AVERAGE_SPEED_KMPH = 34;

export const metroFareSlabs: FareSlab[] = [
  { zone: 1, label: "Up to 2 km", maxKm: 2, fare: 11 },
  { zone: 2, label: "More than 2 km up to 4 km", maxKm: 4, fare: 17 },
  { zone: 3, label: "More than 4 km up to 6 km", maxKm: 6, fare: 28 },
  { zone: 4, label: "More than 6 km up to 9 km", maxKm: 9, fare: 37 },
  { zone: 5, label: "More than 9 km up to 12 km", maxKm: 12, fare: 47 },
  { zone: 6, label: "More than 12 km up to 15 km", maxKm: 15, fare: 51 },
  { zone: 7, label: "More than 15 km up to 18 km", maxKm: 18, fare: 56 },
  { zone: 8, label: "More than 18 km up to 21 km", maxKm: 21, fare: 61 },
  { zone: 9, label: "More than 21 km up to 24 km", maxKm: 24, fare: 65 },
  { zone: 10, label: "More than 24 km", maxKm: null, fare: 69 }
];

export const metroFareSource =
  "L&T Metro revised fare chart effective 24 May 2025: fares are zone-wise after 10% discount and apply across paper QR/token, digital tickets, and smart cards.";

export function getMetroStations() {
  const stations = new Set<string>();
  metroRoutes.forEach((route) => route.stops.forEach((station) => stations.add(station)));
  return Array.from(stations).sort();
}

export function normalizeMetroStation(value: string) {
  const query = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
  if (!query) return "";
  return getMetroStations().find((station) => {
    const normalizedStation = station.toLowerCase().replace(/[^a-z0-9]+/g, " ");
    return normalizedStation === query;
  }) ?? "";
}

export function calculateMetroFare(distanceKm: number) {
  const roundedDistance = Math.max(0, Number(distanceKm.toFixed(2)));
  const slab = metroFareSlabs.find((item) => item.maxKm === null || roundedDistance <= item.maxKm) ?? metroFareSlabs[metroFareSlabs.length - 1];
  return slab;
}

export function findMetroJourney(from: string, to: string): MetroJourney | null {
  const start = normalizeMetroStation(from);
  const end = normalizeMetroStation(to);
  if (!start || !end || start === end) return null;

  const graph = buildMetroGraph();
  const states = shortestPath(graph, start, end);
  if (!states.length) return null;

  const stops = states.map((state) => state.station);
  const distanceKm = Number(states[states.length - 1].distanceKm.toFixed(2));
  const segments = buildSegments(states);
  const transfers = getTransfers(segments);
  const fareSlab = calculateMetroFare(distanceKm);
  const movingMins = Math.ceil((distanceKm / AVERAGE_SPEED_KMPH) * 60);
  const durationMins = Math.max(2, movingMins + transfers.length * TRANSFER_BUFFER_MINS);

  return {
    from: start,
    to: end,
    lineSummary: Array.from(new Set(segments.map((segment) => segment.line))).join(" + "),
    stops,
    stationCount: stops.length,
    distanceKm,
    durationMins,
    fare: fareSlab.fare,
    fareZone: fareSlab.zone,
    fareLabel: fareSlab.label,
    transfers,
    segments
  };
}

function buildMetroGraph() {
  const graph = new Map<string, Edge[]>();

  metroRoutes.forEach((route) => {
    const segmentDistance = route.lengthKm / Math.max(1, route.stops.length - 1);
    route.stops.forEach((station, index) => {
      if (!graph.has(station)) graph.set(station, []);
      const next = route.stops[index + 1];
      if (!next) return;
      addEdge(graph, station, {
        to: next,
        line: route.line,
        color: route.color,
        distanceKm: segmentDistance
      });
      addEdge(graph, next, {
        to: station,
        line: route.line,
        color: route.color,
        distanceKm: segmentDistance
      });
    });
  });

  INTERCHANGE_EDGES.forEach((edge) => {
    addEdge(graph, edge.from, { to: edge.to, line: edge.label, color: "#f5b642", distanceKm: 0 });
    addEdge(graph, edge.to, { to: edge.from, line: edge.label, color: "#f5b642", distanceKm: 0 });
  });

  return graph;
}

function addEdge(graph: Map<string, Edge[]>, from: string, edge: Edge) {
  const existing = graph.get(from) ?? [];
  existing.push(edge);
  graph.set(from, existing);
}

function shortestPath(graph: Map<string, Edge[]>, start: string, end: string) {
  const queue: PathState[] = [{ station: start, distanceKm: 0, path: [{ station: start, line: "", color: "", distanceKm: 0, legDistanceKm: 0 }] }];
  const best = new Map<string, number>([[start, 0]]);

  while (queue.length) {
    queue.sort((left, right) => left.distanceKm - right.distanceKm);
    const current = queue.shift();
    if (!current) break;
    if (current.station === end) return current.path;

    (graph.get(current.station) ?? []).forEach((edge) => {
      const distanceKm = current.distanceKm + edge.distanceKm;
      if (distanceKm >= (best.get(edge.to) ?? Number.POSITIVE_INFINITY)) return;
      best.set(edge.to, distanceKm);
      queue.push({
        station: edge.to,
        distanceKm,
        path: [...current.path, { station: edge.to, line: edge.line, color: edge.color, distanceKm, legDistanceKm: edge.distanceKm }]
      });
    });
  }

  return [];
}

function buildSegments(states: Array<{ station: string; line: string; color: string; distanceKm: number; legDistanceKm: number }>) {
  const segments: MetroJourney["segments"] = [];

  states.slice(1).forEach((state, index) => {
    if (state.legDistanceKm === 0 && state.line.includes("/")) return;

    const previousStation = states[index].station;
    const last = segments[segments.length - 1];
    if (last && last.line === state.line) {
      last.to = state.station;
      last.stops.push(state.station);
      last.distanceKm = Number((last.distanceKm + state.legDistanceKm).toFixed(2));
      return;
    }

    segments.push({
      line: state.line,
      color: state.color,
      from: previousStation,
      to: state.station,
      stops: [previousStation, state.station],
      distanceKm: state.legDistanceKm
    });
  });

  return segments.map((segment) => ({ ...segment, distanceKm: Number(segment.distanceKm.toFixed(2)) }));
}

function getTransfers(segments: MetroJourney["segments"]) {
  return segments.slice(1).map((segment) => segment.from);
}
