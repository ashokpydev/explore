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
  category: "Biryani" | "Street food" | "Cafe" | "Rooftop" | "Midnight" | "Fine dining" | "South Indian" | "Bakery";
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

const imageFor = {
  heritage: "/images/heritage.svg",
  fort: "/images/fort.svg",
  lake: "/images/lake.svg",
  museum: "/images/museum.svg",
  market: "/images/market.svg",
  hills: "/images/hills.svg",
  themePark: "/images/theme-park.svg",
  temple: "/images/temple.svg",
  mosque: "/images/mosque.svg",
  mall: "/images/mall.svg",
  cinema: "/images/cinema.svg",
  park: "/images/park.svg",
  resort: "/images/resort.svg"
};

export const places: Place[] = [
  {
    slug: "charminar",
    name: "Charminar",
    type: "Heritage Monument",
    category: "Monuments",
    image: imageFor.heritage,
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
    image: imageFor.fort,
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
    image: imageFor.lake,
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
    image: imageFor.museum,
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
    image: imageFor.market,
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
    image: imageFor.hills,
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
  },
  {
    slug: "ramoji-film-city",
    name: "Ramoji Film City",
    type: "Film Studio Theme Park",
    category: "Theme Parks",
    image: imageFor.themePark,
    rating: "4.6",
    meta: "Abdullapurmet | Studio tours | Shows | Family day trip",
    tip: "Book tickets early, start before noon, and keep a full day for studio sets, shows, and shuttle transfers.",
    lat: 17.2543,
    lng: 78.6808,
    distanceKm: 34,
    durationHours: 8,
    fee: 1350,
    crowd: "High",
    safetyScore: 88,
    accessibility: "Managed shuttles and paved guest zones; check show seating access.",
    bestTime: "Full day",
    tags: ["ramoji", "film city", "theme park", "family", "shows", "studio", "kids"]
  },
  {
    slug: "birla-mandir",
    name: "Birla Mandir",
    type: "Temple",
    category: "Temples",
    image: imageFor.temple,
    rating: "4.7",
    meta: "Naubat Pahad | Marble temple | City view",
    tip: "Go around sunset for views; phones and bags may need to be deposited before entry.",
    lat: 17.4062,
    lng: 78.4691,
    distanceKm: 3.5,
    durationHours: 1.5,
    fee: 0,
    crowd: "High",
    safetyScore: 89,
    accessibility: "Steps and slopes; limited wheelchair access near upper sections.",
    bestTime: "Sunset",
    tags: ["temple", "viewpoint", "spiritual", "family", "free"]
  },
  {
    slug: "mecca-masjid",
    name: "Mecca Masjid",
    type: "Historic Mosque",
    category: "Mosques",
    image: imageFor.mosque,
    rating: "4.6",
    meta: "Old City | Charminar walk | Heritage precinct",
    tip: "Dress modestly, avoid prayer rush, and combine with Charminar and Laad Bazaar.",
    lat: 17.3604,
    lng: 78.4736,
    distanceKm: 4.1,
    durationHours: 1,
    fee: 0,
    crowd: "Very high",
    safetyScore: 82,
    accessibility: "Open courtyard access; busy lanes nearby.",
    bestTime: "Morning",
    tags: ["mosque", "heritage", "old city", "charminar", "culture"]
  },
  {
    slug: "qutb-shahi-tombs",
    name: "Qutb Shahi Tombs",
    type: "Heritage Tomb Complex",
    category: "Monuments",
    image: imageFor.heritage,
    rating: "4.5",
    meta: "Ibrahim Bagh | Near Golconda | Architecture",
    tip: "Pair with Golconda Fort and keep time for restored domes, gardens, and photography.",
    lat: 17.3951,
    lng: 78.3968,
    distanceKm: 8.6,
    durationHours: 2,
    fee: 20,
    crowd: "Moderate",
    safetyScore: 87,
    accessibility: "Garden paths are easier than inner tomb platforms.",
    bestTime: "Late afternoon",
    tags: ["tombs", "history", "architecture", "golconda", "photography"]
  },
  {
    slug: "chowmahalla-palace",
    name: "Chowmahalla Palace",
    type: "Palace Museum",
    category: "Museums",
    image: imageFor.museum,
    rating: "4.5",
    meta: "Khilwat | Nizam heritage | Courtyards",
    tip: "Visit before Old City shopping; the vintage cars and durbar hall are highlights.",
    lat: 17.3578,
    lng: 78.4717,
    distanceKm: 4.6,
    durationHours: 2,
    fee: 100,
    crowd: "Moderate",
    safetyScore: 86,
    accessibility: "Courtyards are walkable; some heritage rooms have steps.",
    bestTime: "Late morning",
    tags: ["palace", "museum", "nizam", "old city", "heritage"]
  },
  {
    slug: "nehru-zoological-park",
    name: "Nehru Zoological Park",
    type: "Zoo and Family Park",
    category: "Parks",
    image: imageFor.park,
    rating: "4.4",
    meta: "Bahadurpura | Zoo safari | Family outing",
    tip: "Go early, carry water, and use battery vehicles if visiting with children or elders.",
    lat: 17.3507,
    lng: 78.4516,
    distanceKm: 6.8,
    durationHours: 4,
    fee: 80,
    crowd: "High",
    safetyScore: 86,
    accessibility: "Battery vehicles and broad paths available in many zones.",
    bestTime: "Morning",
    tags: ["zoo", "family", "kids", "park", "safari"]
  },
  {
    slug: "shilparamam",
    name: "Shilparamam",
    type: "Arts, Crafts and Culture Village",
    category: "Markets",
    image: imageFor.market,
    rating: "4.4",
    meta: "Madhapur | Crafts | Food stalls | Performances",
    tip: "Best in the evening; check event schedules and keep cash for small craft stalls.",
    lat: 17.4526,
    lng: 78.3762,
    distanceKm: 13.5,
    durationHours: 2.5,
    fee: 60,
    crowd: "High",
    safetyScore: 88,
    accessibility: "Mostly open paths with some uneven craft-stall areas.",
    bestTime: "Evening",
    tags: ["crafts", "market", "culture", "madhapur", "shopping", "events"]
  },
  {
    slug: "inorbit-mall",
    name: "Inorbit Mall",
    type: "Shopping Mall",
    category: "Malls",
    image: imageFor.mall,
    rating: "4.5",
    meta: "Madhapur | Shopping | Food court | Cinema",
    tip: "Good for rain-safe shopping, restaurants, and movies; weekends get crowded after 5 PM.",
    lat: 17.4347,
    lng: 78.3866,
    distanceKm: 12.8,
    durationHours: 3,
    fee: 0,
    crowd: "High",
    safetyScore: 91,
    accessibility: "Elevators, escalators, parking, and wheelchair-friendly corridors.",
    bestTime: "Weekday afternoon",
    tags: ["mall", "shopping", "food court", "cinema", "madhapur", "rain safe"]
  },
  {
    slug: "forum-sujana-mall",
    name: "Forum Sujana Mall",
    type: "Shopping Mall",
    category: "Malls",
    image: imageFor.mall,
    rating: "4.4",
    meta: "Kukatpally | Shopping | Multiplex | Dining",
    tip: "Plan extra parking time on weekends and combine with nearby Kukatpally food spots.",
    lat: 17.4849,
    lng: 78.3898,
    distanceKm: 16.5,
    durationHours: 3,
    fee: 0,
    crowd: "High",
    safetyScore: 90,
    accessibility: "Mall access with elevators, ramps, and accessible washrooms.",
    bestTime: "Weekday evening",
    tags: ["mall", "shopping", "kukatpally", "multiplex", "restaurants"]
  },
  {
    slug: "sarath-city-capital-mall",
    name: "Sarath City Capital Mall",
    type: "Large Shopping Mall",
    category: "Malls",
    image: imageFor.mall,
    rating: "4.5",
    meta: "Kondapur | Shopping | Kids zones | Dining",
    tip: "Good for families and groups; set a pickup point because the mall exits get busy.",
    lat: 17.4576,
    lng: 78.3636,
    distanceKm: 15.2,
    durationHours: 3.5,
    fee: 0,
    crowd: "Very high",
    safetyScore: 90,
    accessibility: "Large accessible mall with elevators and broad corridors.",
    bestTime: "Weekday afternoon",
    tags: ["mall", "kondapur", "shopping", "kids", "food", "cinema"]
  },
  {
    slug: "prasads-multiplex",
    name: "Prasads Multiplex",
    type: "Popular Theater and Entertainment",
    category: "Theaters",
    image: imageFor.cinema,
    rating: "4.4",
    meta: "Necklace Road | Movies | Gaming | Food",
    tip: "Pair a movie with Hussain Sagar or Tank Bund; pre-book seats for weekends.",
    lat: 17.4138,
    lng: 78.4653,
    distanceKm: 4.7,
    durationHours: 3,
    fee: 250,
    crowd: "High",
    safetyScore: 89,
    accessibility: "Mall-style entry with elevators and accessible seating options.",
    bestTime: "Evening",
    tags: ["theater", "cinema", "multiplex", "imax", "necklace road", "movies"]
  },
  {
    slug: "aaa-cinemas",
    name: "AAA Cinemas",
    type: "Premium Theater",
    category: "Theaters",
    image: imageFor.cinema,
    rating: "4.5",
    meta: "Ameerpet | Movies | Premium screens",
    tip: "Book early for big Telugu releases and use metro to avoid Ameerpet traffic.",
    lat: 17.4375,
    lng: 78.4483,
    distanceKm: 7.1,
    durationHours: 3,
    fee: 300,
    crowd: "High",
    safetyScore: 88,
    accessibility: "Elevator access and organized lobby movement.",
    bestTime: "Matinee",
    tags: ["theater", "cinema", "ameerpet", "telugu movies", "premium"]
  },
  {
    slug: "wonderla-hyderabad",
    name: "Wonderla Hyderabad",
    type: "Amusement and Water Park",
    category: "Theme Parks",
    image: imageFor.themePark,
    rating: "4.5",
    meta: "Ravirala | Water rides | Family day trip",
    tip: "Carry swimwear, check ride maintenance updates, and arrive at opening time.",
    lat: 17.2176,
    lng: 78.5285,
    distanceKm: 28,
    durationHours: 7,
    fee: 1200,
    crowd: "High",
    safetyScore: 87,
    accessibility: "Managed park routes; ride access varies by attraction.",
    bestTime: "Morning",
    tags: ["wonderla", "theme park", "water park", "rides", "family", "kids"]
  },
  {
    slug: "gandipet-park",
    name: "Gandipet Lake Park",
    type: "Lake Park",
    category: "Lakes",
    image: imageFor.lake,
    rating: "4.3",
    meta: "Osman Sagar | Sunset | Picnic",
    tip: "Best for relaxed evenings; verify park timings before a long drive.",
    lat: 17.3919,
    lng: 78.3008,
    distanceKm: 20,
    durationHours: 2,
    fee: 50,
    crowd: "Moderate",
    safetyScore: 85,
    accessibility: "Open park paths; some areas may have uneven ground.",
    bestTime: "Sunset",
    tags: ["lake", "park", "gandipet", "sunset", "picnic", "family"]
  },
  {
    slug: "taj-falaknuma-palace",
    name: "Taj Falaknuma Palace",
    type: "Luxury Palace Hotel",
    category: "Resorts",
    image: imageFor.resort,
    rating: "4.7",
    meta: "Falaknuma | Luxury dining | Palace experience",
    tip: "Reserve in advance for high tea or dining; dress codes and entry rules may apply.",
    lat: 17.3301,
    lng: 78.4675,
    distanceKm: 7.4,
    durationHours: 3,
    fee: 3500,
    crowd: "Low",
    safetyScore: 92,
    accessibility: "Managed luxury property access; confirm requirements while booking.",
    bestTime: "Evening",
    tags: ["palace", "luxury", "resort", "dining", "falaknuma", "experience"]
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
  },
  {
    name: "Shah Ghouse",
    category: "Biryani",
    area: "Tolichowki",
    costForTwo: 800,
    rating: 4.3,
    crowd: "High",
    openLate: true,
    distanceKm: 8.7,
    specialties: ["biryani", "haleem", "kebabs", "late-night takeaway"],
    safetyNote: "Busy food stretch; prefer main-road pickup during late hours."
  },
  {
    name: "Cafe Niloufer",
    category: "Cafe",
    area: "Lakdikapul",
    costForTwo: 450,
    rating: 4.5,
    crowd: "Very high",
    openLate: true,
    distanceKm: 3.5,
    specialties: ["Irani chai", "Osmania biscuits", "bun maska"],
    safetyNote: "High-footfall central area; expect queues at peak tea time."
  },
  {
    name: "Chutneys",
    category: "South Indian",
    area: "Banjara Hills",
    costForTwo: 700,
    rating: 4.3,
    crowd: "High",
    openLate: false,
    distanceKm: 5.8,
    specialties: ["dosa", "idli", "chutney platters", "family dining"],
    safetyNote: "Good family-friendly dining zone with cab access."
  },
  {
    name: "Bawarchi",
    category: "Biryani",
    area: "RTC X Roads",
    costForTwo: 850,
    rating: 4.2,
    crowd: "Very high",
    openLate: true,
    distanceKm: 4.9,
    specialties: ["Hyderabadi biryani", "grill", "takeaway"],
    safetyNote: "Crowded main road; choose a clear pickup point."
  },
  {
    name: "Karachi Bakery",
    category: "Bakery",
    area: "Mozamjahi Market",
    costForTwo: 500,
    rating: 4.4,
    crowd: "High",
    openLate: false,
    distanceKm: 2.8,
    specialties: ["fruit biscuits", "plum cake", "souvenirs"],
    safetyNote: "Central market area; watch traffic while crossing."
  },
  {
    name: "Olive Bistro",
    category: "Fine dining",
    area: "Jubilee Hills",
    costForTwo: 3200,
    rating: 4.4,
    crowd: "Moderate",
    openLate: false,
    distanceKm: 10.2,
    specialties: ["Mediterranean", "lake view", "date night"],
    safetyNote: "Pre-book tables and confirm return cab availability."
  },
  {
    name: "Roastery Coffee House",
    category: "Cafe",
    area: "Banjara Hills",
    costForTwo: 1200,
    rating: 4.5,
    crowd: "Moderate",
    openLate: false,
    distanceKm: 6.2,
    specialties: ["specialty coffee", "desserts", "brunch"],
    safetyNote: "Quiet neighborhood access; use cab pickup after dark."
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
