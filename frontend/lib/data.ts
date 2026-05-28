import { Landmark, Map, ShieldCheck, Sparkles, Train, Utensils } from "lucide-react";

export type Place = {
  slug: string;
  name: string;
  type: string;
  category: string;
  image: string;
  rating: string;
  meta: string;
  tip: string;
  lat: number;
  lng: number;
  distanceKm: number;
  durationHours: number;
  fee: number;
  crowd: "Low" | "Moderate" | "High" | "Very high";
  safetyScore: number;
  accessibility: string;
  bestTime: string;
  tags: string[];
};

export type FoodSpot = {
  name: string;
  category: "Biryani" | "Street food" | "Cafe" | "Rooftop" | "Midnight";
  area: string;
  costForTwo: number;
  rating: number;
  crowd: "Low" | "Moderate" | "High" | "Very high";
  openLate: boolean;
  distanceKm: number;
  specialties: string[];
  safetyNote: string;
};

export type EventItem = {
  title: string;
  date: string;
  type: string;
  venue: string;
  price: string;
};

export type MetroRoute = {
  from: string;
  to: string;
  line: string;
  interchange: string;
  duration: string;
  fare: string;
};

export const categories = [
  { label: "Monuments", icon: Landmark, color: "bg-lac", href: "/explore?category=Monuments" },
  { label: "Food", icon: Utensils, color: "bg-turmeric text-charcoal", href: "/food" },
  { label: "Metro", icon: Train, color: "bg-lake", href: "/planner?mode=metro" },
  { label: "AI Trips", icon: Sparkles, color: "bg-neem", href: "/planner" },
  { label: "Safety", icon: ShieldCheck, color: "bg-charcoal", href: "/explore?safe=true" },
  { label: "Nearby", icon: Map, color: "bg-lac", href: "/explore?nearby=true" }
];

export const places: Place[] = [
  {
    slug: "charminar",
    name: "Charminar",
    type: "Heritage Monument",
    category: "Monuments",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Charminar-Pride_of_Hyderabad.jpg",
    rating: "4.8",
    meta: "Old City | Laad Bazaar | Ramzan food lanes",
    tip: "Visit before 9 AM or after 5 PM; combine with Mecca Masjid and Irani chai.",
    lat: 17.3616,
    lng: 78.4747,
    distanceKm: 4.2,
    durationHours: 2,
    fee: 25,
    crowd: "Very high",
    safetyScore: 82,
    accessibility: "Partial wheelchair access around outer plaza",
    bestTime: "Early morning",
    tags: ["history", "shopping", "street food", "mosque", "qr guide"]
  },
  {
    slug: "golconda-fort",
    name: "Golconda Fort",
    type: "Fort and Sound Show",
    category: "Monuments",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/The_Golkonda_Fort.jpg/960px-The_Golkonda_Fort.jpg",
    rating: "4.7",
    meta: "Ibrahim Bagh | Sunset trail | Qutb Shahi Tombs",
    tip: "Carry water, start from the lower ramparts, and keep 2.5 hours for the climb.",
    lat: 17.3833,
    lng: 78.4011,
    distanceKm: 8.1,
    durationHours: 3,
    fee: 25,
    crowd: "High",
    safetyScore: 86,
    accessibility: "Steep climbs; limited accessibility beyond lower areas",
    bestTime: "Late afternoon",
    tags: ["history", "trekking", "sunset", "drone video", "ar preview"]
  },
  {
    slug: "hussain-sagar",
    name: "Hussain Sagar",
    type: "Lake and Promenade",
    category: "Lakes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hussain_Sagar_Hyderabad.jpg/960px-Hussain_Sagar_Hyderabad.jpg",
    rating: "4.5",
    meta: "Tank Bund | Necklace Road | Boat rides",
    tip: "Evening breeze is best; check traffic around Secretariat and Tank Bund.",
    lat: 17.4239,
    lng: 78.4738,
    distanceKm: 5.5,
    durationHours: 2,
    fee: 0,
    crowd: "Moderate",
    safetyScore: 88,
    accessibility: "Good promenade access and seating",
    bestTime: "Evening",
    tags: ["lake", "family", "nightlife", "metro", "weather"]
  },
  {
    slug: "salar-jung-museum",
    name: "Salar Jung Museum",
    type: "Museum",
    category: "Museums",
    image: "https://live.staticflickr.com/101/268247463_6a315c1083_o.jpg",
    rating: "4.6",
    meta: "Darulshifa | Art | Antiques | Families",
    tip: "Keep 2 hours and prioritize the clock gallery, sculptures, and textiles.",
    lat: 17.3713,
    lng: 78.4804,
    distanceKm: 3.7,
    durationHours: 2,
    fee: 50,
    crowd: "Moderate",
    safetyScore: 90,
    accessibility: "Elevators and indoor seating available",
    bestTime: "Late morning",
    tags: ["museum", "family", "indoor", "culture", "rain safe"]
  },
  {
    slug: "laad-bazaar",
    name: "Laad Bazaar",
    type: "Market",
    category: "Markets",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Laad_Bazaar.jpg",
    rating: "4.4",
    meta: "Bangles | Pearls | Wedding shopping",
    tip: "Start from Charminar side and bargain politely; carry cash for small vendors.",
    lat: 17.3619,
    lng: 78.4738,
    distanceKm: 4.3,
    durationHours: 2,
    fee: 0,
    crowd: "Very high",
    safetyScore: 78,
    accessibility: "Narrow lanes; best with light bags",
    bestTime: "Before sunset",
    tags: ["shopping", "market", "bargaining", "pearls", "local"]
  },
  {
    slug: "ananthagiri-hills",
    name: "Ananthagiri Hills",
    type: "Weekend Getaway",
    category: "Weekend",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Ananthagiri_Hills_Trekking_Area.jpg",
    rating: "4.3",
    meta: "Vikarabad | Forest trails | Coffee stops",
    tip: "Leave before 6 AM, avoid isolated trails after dark, and check rain forecasts.",
    lat: 17.3121,
    lng: 77.8633,
    distanceKm: 80,
    durationHours: 8,
    fee: 0,
    crowd: "Moderate",
    safetyScore: 80,
    accessibility: "Trail terrain; not wheelchair friendly",
    bestTime: "Monsoon mornings",
    tags: ["trekking", "weekend", "nature", "budget", "weather"]
  }
];

export const food: FoodSpot[] = [
  {
    name: "Paradise Biryani",
    category: "Biryani",
    area: "Secunderabad",
    costForTwo: 900,
    rating: 4.2,
    crowd: "High",
    openLate: true,
    distanceKm: 6.4,
    specialties: ["Hyderabadi biryani", "kebabs", "family seating"],
    safetyNote: "High-footfall main road area with cab access."
  },
  {
    name: "Nimrah Cafe",
    category: "Street food",
    area: "Charminar",
    costForTwo: 250,
    rating: 4.5,
    crowd: "Very high",
    openLate: true,
    distanceKm: 4.2,
    specialties: ["Irani chai", "Osmania biscuits", "Ramzan walk"],
    safetyNote: "Best with group travel at night; use marked pickup points."
  },
  {
    name: "Jubilee Hills Cafe Trail",
    category: "Cafe",
    area: "Jubilee Hills",
    costForTwo: 1400,
    rating: 4.4,
    crowd: "Moderate",
    openLate: false,
    distanceKm: 9.1,
    specialties: ["specialty coffee", "desserts", "work-friendly seating"],
    safetyNote: "Good parking and cab access."
  },
  {
    name: "Rooftop Dinner Circuit",
    category: "Rooftop",
    area: "HITEC City",
    costForTwo: 2600,
    rating: 4.3,
    crowd: "High",
    openLate: true,
    distanceKm: 14.8,
    specialties: ["skyline view", "mocktails", "date night"],
    safetyNote: "Pre-book tables and check return cab fares."
  },
  {
    name: "DLF Midnight Lane",
    category: "Midnight",
    area: "Gachibowli",
    costForTwo: 700,
    rating: 4.1,
    crowd: "High",
    openLate: true,
    distanceKm: 18.3,
    specialties: ["shawarma", "dosas", "tea", "late-night snacks"],
    safetyNote: "Busy tech corridor; avoid isolated side lanes."
  }
];

export const events: EventItem[] = [
  { title: "Ramzan Food Streets", date: "Seasonal evenings", type: "Food festival", venue: "Charminar", price: "Pay per dish" },
  { title: "Bonalu Processions", date: "Ashada season", type: "Festival", venue: "Old City temples", price: "Free" },
  { title: "Bathukamma Celebrations", date: "Sep-Oct", type: "Culture", venue: "Tank Bund", price: "Free" },
  { title: "Shilparamam Craft Bazaar", date: "Weekly", type: "Exhibition", venue: "Madhapur", price: "INR 60" }
];

export const metroRoutes: MetroRoute[] = [
  { from: "HITEC City", to: "Charminar", line: "Blue + Green", interchange: "Ameerpet, MG Bus Station", duration: "55-70 min", fare: "INR 60" },
  { from: "Secunderabad", to: "Hussain Sagar", line: "Blue", interchange: "None", duration: "15-25 min", fare: "INR 20-35" },
  { from: "Jubilee Hills", to: "Golconda", line: "Blue + cab", interchange: "Peddamma Gudi", duration: "35-50 min", fare: "INR 120-240" }
];

export const emergencyContacts = [
  { label: "Police", value: "100" },
  { label: "Women safety", value: "1091" },
  { label: "Ambulance", value: "108" },
  { label: "Tourist helpline", value: "1363" }
];

export const highlights = [
  "AR heritage previews",
  "Women safety ratings",
  "QR tourism guide",
  "Telugu, Hindi, English",
  "Offline PWA mode",
  "AI crowd prediction",
  "Cab fare estimates",
  "Weather intelligence"
];
