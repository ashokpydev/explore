import type { Place } from "@/lib/data";

const defaultZoom = 14;

export function openStreetMapEmbedUrl(place: Pick<Place, "lat" | "lng" | "name">, zoom = defaultZoom) {
  const delta = zoom >= 14 ? 0.012 : 0.05;
  const left = place.lng - delta;
  const right = place.lng + delta;
  const top = place.lat + delta;
  const bottom = place.lat - delta;
  const marker = `${place.lat},${place.lng}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${marker}`;
}

export function openStreetMapPlaceUrl(place: Pick<Place, "lat" | "lng" | "name">) {
  return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`;
}

export function googleMapsDirectionsUrl(destination: Pick<Place, "lat" | "lng" | "name">, origin?: string) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    destination_place_id: destination.name,
    travelmode: "driving"
  });
  if (origin?.trim()) {
    params.set("origin", origin.trim());
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function openStreetMapDirectionsUrl(destination: Pick<Place, "lat" | "lng">, origin?: Pick<Place, "lat" | "lng">) {
  if (origin) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat},${origin.lng};${destination.lat},${destination.lng}`;
  }
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${destination.lat},${destination.lng}`;
}

export function routeBounds(stops: Array<Pick<Place, "lat" | "lng">>) {
  if (!stops.length) {
    return { left: 78.25, bottom: 17.25, right: 78.65, top: 17.52 };
  }
  const lats = stops.map((stop) => stop.lat);
  const lngs = stops.map((stop) => stop.lng);
  const pad = 0.04;
  return {
    left: Math.min(...lngs) - pad,
    bottom: Math.min(...lats) - pad,
    right: Math.max(...lngs) + pad,
    top: Math.max(...lats) + pad
  };
}

export function openStreetMapRouteEmbedUrl(stops: Array<Pick<Place, "lat" | "lng" | "name">>) {
  const bounds = routeBounds(stops);
  const marker = stops[0] ? `&marker=${stops[0].lat},${stops[0].lng}` : "";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.left},${bounds.bottom},${bounds.right},${bounds.top}&layer=mapnik${marker}`;
}

export function googleMapsMultiStopUrl(stops: Array<Pick<Place, "lat" | "lng">>, origin?: string) {
  if (!stops.length) {
    return "https://www.google.com/maps";
  }
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1).map((stop) => `${stop.lat},${stop.lng}`).join("|");
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving"
  });
  if (origin?.trim()) {
    params.set("origin", origin.trim());
  }
  if (waypoints) {
    params.set("waypoints", waypoints);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
