from __future__ import annotations

from dataclasses import dataclass
from uuid import NAMESPACE_URL, UUID, uuid5


MGBS_COORDINATES = (17.3790, 78.4834)


@dataclass(frozen=True)
class FoodCatalogRestaurant:
    name: str
    category: str
    cuisine: list[str]
    price_band: str
    rating: float
    cost_for_two: int
    address: str
    latitude: float
    longitude: float
    crowd_level: str
    open_late: bool
    highlights: list[str]
    distance_from_mgbs_km: float
    image_key: str

    @property
    def id(self) -> UUID:
        return uuid5(NAMESPACE_URL, f"explore-hyderabad:restaurant:{self.name.lower()}")


def restaurant_key(name: str) -> str:
    return "".join(character for character in name.lower().replace("&", "and") if character.isalnum())


FOOD_CATALOG: list[FoodCatalogRestaurant] = [
    FoodCatalogRestaurant("Hotel Shadab", "Biryani", ["Hyderabadi", "Biryani", "Haleem"], "mid", 4.4, 900, "Ghansi Bazaar", 17.3687, 78.4772, "very_high", True, ["mutton biryani", "haleem", "kebabs"], 3.1, "biryani"),
    FoodCatalogRestaurant("Hotel Nayaab", "Biryani", ["Hyderabadi", "Breakfast", "Biryani"], "budget", 4.3, 700, "Chatta Bazaar", 17.3692, 78.4748, "very_high", True, ["nihari", "paya", "biryani"], 2.8, "nihari"),
    FoodCatalogRestaurant("Pista House", "Biryani", ["Hyderabadi", "Haleem", "Bakery"], "mid", 4.3, 850, "Shah Ali Banda", 17.3578, 78.4733, "high", True, ["haleem", "biryani", "bakery sweets"], 4.2, "haleem"),
    FoodCatalogRestaurant("Cafe Bahar", "Biryani", ["Hyderabadi", "Biryani", "Irani Chai"], "mid", 4.4, 800, "Basheerbagh", 17.3999, 78.4806, "high", True, ["Hyderabadi biryani", "Irani chai", "haleem"], 3.4, "biryani"),
    FoodCatalogRestaurant("Grand Hotel", "Biryani", ["Hyderabadi", "Biryani", "Bakery"], "budget", 4.1, 750, "Abids", 17.3897, 78.4763, "high", True, ["biryani", "Irani cafe snacks", "bakery"], 2.4, "biryani"),
    FoodCatalogRestaurant("Mehfil", "Biryani", ["Hyderabadi", "Biryani", "Tandoori"], "budget", 4.2, 700, "Narayanaguda", 17.3992, 78.4891, "very_high", True, ["biryani", "tandoori", "late-night meals"], 3.8, "biryani"),
    FoodCatalogRestaurant("Bawarchi", "Biryani", ["Hyderabadi", "Biryani", "Grill"], "mid", 4.2, 850, "RTC X Roads", 17.4064, 78.4968, "very_high", True, ["Hyderabadi biryani", "grill", "takeaway"], 5.1, "biryani"),
    FoodCatalogRestaurant("Paradise Biryani", "Biryani", ["Hyderabadi", "Biryani"], "mid", 4.2, 900, "Paradise Circle, Secunderabad", 17.4419, 78.4873, "high", True, ["Hyderabadi biryani", "kebabs", "family seating"], 7.2, "biryani"),
    FoodCatalogRestaurant("Meridian Restaurant", "Biryani", ["Hyderabadi", "Biryani", "Grill"], "mid", 4.2, 800, "Panjagutta", 17.4267, 78.4527, "high", True, ["mutton biryani", "grill", "takeaway"], 6.4, "biryani"),
    FoodCatalogRestaurant("Sarvi Restaurant", "Biryani", ["Hyderabadi", "Haleem", "Biryani"], "mid", 4.2, 950, "Banjara Hills", 17.4125, 78.4483, "high", True, ["haleem", "biryani", "kebabs"], 6.5, "haleem"),
    FoodCatalogRestaurant("Shah Ghouse", "Biryani", ["Hyderabadi", "Biryani", "Haleem"], "mid", 4.3, 800, "Tolichowki", 17.3991, 78.4149, "high", True, ["biryani", "haleem", "kebabs"], 9.4, "biryani"),
    FoodCatalogRestaurant("Hotel Rumaan", "Biryani", ["Hyderabadi", "Biryani", "Grill"], "budget", 4.2, 750, "Tolichowki", 17.3993, 78.4162, "high", True, ["biryani", "grill chicken", "kebabs"], 9.2, "grill"),
    FoodCatalogRestaurant("4 Seasons", "Biryani", ["Arabian", "Mandi", "Biryani"], "mid", 4.2, 1200, "Tolichowki", 17.3990, 78.4160, "high", True, ["mandi", "khabsa", "biryani"], 9.2, "mandi"),
    FoodCatalogRestaurant("Shahi Dastarkhwan", "Biryani", ["Hyderabadi", "Biryani", "Mutton"], "mid", 4.1, 850, "Lakdikapul", 17.4042, 78.4625, "high", True, ["biryani", "mutton dishes", "takeaway"], 4.1, "biryani"),
    FoodCatalogRestaurant("Biryaniwalla & Co", "Biryani", ["Hyderabadi", "Biryani", "Kebabs"], "mid", 4.1, 1100, "Banjara Hills", 17.4154, 78.4389, "moderate", True, ["dum biryani", "kebabs", "family packs"], 7.1, "biryani"),
    FoodCatalogRestaurant("Kritunga", "Biryani", ["Rayalaseema", "Biryani", "Andhra"], "mid", 4.2, 1000, "Madhapur", 17.4483, 78.3915, "high", True, ["Rayalaseema biryani", "spicy curries", "ragimudda"], 14.6, "andhra"),
    FoodCatalogRestaurant("Chaitanya Food Court", "Biryani", ["Andhra", "Biryani"], "mid", 4.1, 900, "Kukatpally", 17.4933, 78.3997, "high", True, ["fry piece biryani", "Andhra meals", "pulao"], 17.5, "andhra"),
    FoodCatalogRestaurant("Sri Kanya Comfort", "Biryani", ["Andhra", "Biryani", "Seafood"], "mid", 4.2, 1000, "Kondapur", 17.4648, 78.3666, "high", True, ["Andhra biryani", "prawns fry", "meals"], 17.8, "andhra"),
    FoodCatalogRestaurant("The Nawaabs", "Biryani", ["Mughlai", "Biryani", "Kebabs"], "mid", 4.2, 1200, "Gachibowli", 17.4401, 78.3489, "high", True, ["biryani", "kebabs", "North Indian"], 19.0, "kebab"),
    FoodCatalogRestaurant("Nimrah Cafe", "Cafe", ["Irani Chai", "Bakery"], "budget", 4.5, 250, "Charminar", 17.3618, 78.4748, "very_high", True, ["Irani chai", "Osmania biscuits", "Ramzan walk"], 3.3, "chai"),
    FoodCatalogRestaurant("Cafe Niloufer", "Cafe", ["Irani Chai", "Cafe", "Bakery"], "budget", 4.5, 450, "Lakdikapul", 17.4046, 78.4623, "very_high", True, ["Irani chai", "Osmania biscuits", "bun maska"], 4.0, "chai"),
    FoodCatalogRestaurant("Roastery Coffee House", "Cafe", ["Cafe", "Coffee", "Desserts"], "mid", 4.5, 1200, "Banjara Hills", 17.4155, 78.4341, "moderate", False, ["specialty coffee", "desserts", "brunch"], 7.2, "coffee"),
    FoodCatalogRestaurant("Concu", "Cafe", ["Cafe", "Desserts", "Continental"], "mid", 4.4, 1400, "Jubilee Hills", 17.4318, 78.4084, "high", True, ["desserts", "coffee", "continental plates"], 10.2, "dessert"),
    FoodCatalogRestaurant("Autumn Leaf Cafe", "Cafe", ["Cafe", "Brunch", "Coffee"], "mid", 4.3, 1400, "Jubilee Hills", 17.4311, 78.4106, "moderate", False, ["garden cafe", "brunch", "coffee"], 10.0, "coffee"),
    FoodCatalogRestaurant("Aaromale", "Cafe", ["Cafe", "Coffee", "Brunch"], "mid", 4.4, 1200, "Film Nagar", 17.4242, 78.4075, "moderate", False, ["coffee", "cultural space", "brunch"], 11.0, "coffee"),
    FoodCatalogRestaurant("Karachi Bakery", "Bakery", ["Bakery", "Desserts"], "budget", 4.4, 500, "Mozamjahi Market", 17.3849, 78.4748, "high", False, ["fruit biscuits", "plum cake", "souvenirs"], 2.8, "bakery"),
    FoodCatalogRestaurant("Subhan Bakery", "Bakery", ["Bakery", "Biscuits"], "budget", 4.4, 350, "Nampally", 17.3880, 78.4677, "high", False, ["Osmania biscuits", "puffs", "plum cake"], 2.6, "bakery"),
    FoodCatalogRestaurant("Taj Mahal Hotel", "South Indian", ["South Indian", "Vegetarian"], "budget", 4.2, 600, "Abids", 17.3918, 78.4753, "high", False, ["tiffins", "meals", "filter coffee"], 2.3, "dosa"),
    FoodCatalogRestaurant("Pragati Tiffins", "South Indian", ["South Indian", "Tiffins"], "budget", 4.3, 250, "Koti", 17.3859, 78.4867, "very_high", False, ["idli", "upma", "dosa"], 1.7, "dosa"),
    FoodCatalogRestaurant("Ram Ki Bandi", "Street Food", ["Street Food", "Dosa"], "budget", 4.4, 250, "Nampally", 17.3875, 78.4702, "very_high", True, ["dosa", "cheese dosa", "late-night tiffins"], 2.6, "dosa"),
    FoodCatalogRestaurant("Govind Dosa", "Street Food", ["Street Food", "Dosa"], "budget", 4.3, 250, "Gulzar Houz", 17.3628, 78.4746, "very_high", True, ["butter dosa", "street tiffins", "idli"], 3.4, "dosa"),
    FoodCatalogRestaurant("Gokul Chaat", "Street Food", ["Street Food", "Chaat"], "budget", 4.2, 250, "Koti", 17.3860, 78.4815, "very_high", False, ["chaat", "pani puri", "dahi puri"], 1.8, "chaat"),
    FoodCatalogRestaurant("Mayur Pan House", "Street Food", ["Street Food", "Desserts"], "budget", 4.2, 200, "Abids", 17.3913, 78.4751, "high", True, ["paan", "falooda", "street snacks"], 2.5, "dessert"),
    FoodCatalogRestaurant("Al Akbar Fast Food", "Midnight", ["Street Food", "Shawarma", "Grill"], "budget", 4.1, 500, "Tolichowki", 17.3994, 78.4152, "high", True, ["shawarma", "grill chicken", "rolls"], 9.4, "shawarma"),
    FoodCatalogRestaurant("Al Rabea Al Arabi Cafeteria", "Midnight", ["Street Food", "Shawarma", "Juices"], "budget", 4.1, 550, "Tolichowki", 17.3986, 78.4167, "high", True, ["shawarma", "juices", "grill chicken"], 9.3, "shawarma"),
    FoodCatalogRestaurant("The Joint Al Mandi", "Midnight", ["Arabian", "Mandi", "Grill"], "mid", 4.1, 1000, "Madhapur", 17.4484, 78.3908, "high", True, ["mandi", "grills", "rice platters"], 14.8, "mandi"),
    FoodCatalogRestaurant("Chutneys", "South Indian", ["South Indian", "Vegetarian"], "mid", 4.3, 700, "Banjara Hills", 17.4141, 78.4487, "high", False, ["dosa", "idli", "chutney platters", "family dining"], 6.5, "dosa"),
    FoodCatalogRestaurant("Minerva Coffee Shop", "South Indian", ["South Indian", "Vegetarian", "Coffee"], "budget", 4.2, 700, "Himayatnagar", 17.4008, 78.4857, "high", False, ["idli", "dosa", "filter coffee"], 3.7, "dosa"),
    FoodCatalogRestaurant("Taaza Kitchen", "South Indian", ["South Indian", "Tiffins"], "budget", 4.3, 450, "Madhapur", 17.4482, 78.3919, "high", False, ["dosa", "idli", "filter coffee"], 15.0, "dosa"),
    FoodCatalogRestaurant("Panchakattu Dosa", "South Indian", ["South Indian", "Tiffins"], "budget", 4.2, 400, "KPHB", 17.4931, 78.3999, "high", False, ["ghee karam dosa", "idli", "filter coffee"], 17.2, "dosa"),
    FoodCatalogRestaurant("Ishtaa", "South Indian", ["South Indian", "Tiffins", "Coffee"], "mid", 4.3, 800, "HITEC City", 17.4494, 78.3776, "moderate", False, ["modern tiffins", "filter coffee", "brunch"], 15.8, "dosa"),
    FoodCatalogRestaurant("Rayalaseema Ruchulu", "South Indian", ["Rayalaseema", "Andhra", "Meals"], "mid", 4.3, 1400, "Lakdikapul", 17.4031, 78.4630, "high", False, ["Rayalaseema meals", "ragi sangati", "natukodi"], 4.4, "thali"),
    FoodCatalogRestaurant("Ulavacharu", "South Indian", ["Andhra", "Regional", "Pulao"], "mid", 4.3, 1600, "Jubilee Hills", 17.4310, 78.4093, "high", False, ["Andhra cuisine", "pulao", "regional curries"], 10.3, "thali"),
    FoodCatalogRestaurant("The Spicy Venue", "South Indian", ["Andhra", "Biryani", "Dessert"], "mid", 4.3, 1500, "Jubilee Hills", 17.4286, 78.4101, "high", False, ["apricot delight", "Andhra meals", "biryani"], 9.9, "thali"),
    FoodCatalogRestaurant("AnTeRa", "South Indian", ["Telugu", "Regional", "Cocktails"], "mid", 4.4, 1700, "Jubilee Hills", 17.4313, 78.4080, "high", True, ["Telugu specials", "regional thalis", "cocktails"], 10.0, "thali"),
    FoodCatalogRestaurant("Olive Bistro", "Fine Dining", ["Mediterranean", "European"], "premium", 4.4, 3200, "Jubilee Hills", 17.4302, 78.3985, "moderate", False, ["Mediterranean", "lake view", "date night"], 11.2, "pizza"),
    FoodCatalogRestaurant("Jewel of Nizam", "Fine Dining", ["Hyderabadi", "Kebabs", "Fine Dining"], "premium", 4.5, 3500, "Masab Tank", 17.3959, 78.4577, "moderate", False, ["Hyderabadi tasting menu", "kebabs", "fine dining"], 5.1, "kebab"),
    FoodCatalogRestaurant("Adaa", "Fine Dining", ["Hyderabadi", "Palace Dining"], "premium", 4.6, 6000, "Falaknuma", 17.3309, 78.4674, "moderate", False, ["royal Hyderabadi cuisine", "tasting menu", "palace dining"], 5.6, "thali"),
    FoodCatalogRestaurant("Bidri", "Fine Dining", ["Hyderabadi", "Kebabs", "Biryani"], "premium", 4.5, 3500, "Tank Bund", 17.4233, 78.4761, "moderate", False, ["Hyderabadi cuisine", "kebabs", "biryani"], 6.0, "thali"),
    FoodCatalogRestaurant("Okra", "Fine Dining", ["Buffet", "Indian", "Continental"], "premium", 4.3, 3000, "Tank Bund", 17.4241, 78.4760, "moderate", False, ["buffet", "Indian", "continental"], 6.0, "buffet"),
    FoodCatalogRestaurant("Tansen", "Fine Dining", ["Indian", "Live Music", "Kebabs"], "premium", 4.4, 3000, "Financial District", 17.4149, 78.3428, "high", True, ["Indian", "live music", "kebabs"], 21.0, "kebab"),
    FoodCatalogRestaurant("Tatva", "Fine Dining", ["Vegetarian", "North Indian", "Continental"], "premium", 4.3, 2200, "Jubilee Hills", 17.4312, 78.4097, "moderate", False, ["vegetarian", "North Indian", "continental"], 10.1, "thali"),
    FoodCatalogRestaurant("Burma Burma", "Fine Dining", ["Burmese", "Vegetarian", "Tea"], "premium", 4.4, 2000, "Knowledge City", 17.4352, 78.3833, "high", False, ["Burmese", "vegetarian", "tea leaf salad"], 15.8, "asian"),
    FoodCatalogRestaurant("Farzi Cafe", "Fine Dining", ["Modern Indian", "Small Plates"], "premium", 4.2, 2500, "Jubilee Hills", 17.4318, 78.4081, "high", True, ["modern Indian", "small plates", "mocktails"], 10.2, "thali"),
    FoodCatalogRestaurant("Little Italy", "Fine Dining", ["Italian", "Vegetarian", "Pizza"], "mid", 4.2, 1800, "Jubilee Hills", 17.4303, 78.4112, "moderate", False, ["Italian", "vegetarian", "pizza"], 9.8, "pizza"),
    FoodCatalogRestaurant("Exotica", "Rooftop", ["Rooftop", "North Indian", "Kebabs"], "premium", 4.3, 2200, "Banjara Hills", 17.4148, 78.4398, "high", True, ["rooftop dining", "North Indian", "kebabs"], 7.2, "rooftop"),
    FoodCatalogRestaurant("Altitude Lounge Bar", "Rooftop", ["Rooftop", "Lake View", "Small Plates"], "premium", 4.3, 3000, "Tank Bund", 17.4235, 78.4765, "high", True, ["lake view", "rooftop", "small plates"], 6.0, "rooftop"),
    FoodCatalogRestaurant("Over The Moon", "Rooftop", ["Rooftop", "Continental", "Nightlife"], "premium", 4.2, 2800, "Jubilee Hills", 17.4316, 78.4076, "high", True, ["rooftop", "continental", "nightlife"], 10.3, "rooftop"),
    FoodCatalogRestaurant("Prost Brewpub", "Rooftop", ["Brewpub", "Pizza", "Pub Food"], "premium", 4.2, 2300, "Jubilee Hills", 17.4287, 78.4102, "high", True, ["brewpub", "pizza", "pub food"], 10.0, "rooftop"),
    FoodCatalogRestaurant("Broadway The Brewery", "Rooftop", ["Brewery", "Global Plates"], "premium", 4.2, 2500, "Jubilee Hills", 17.4335, 78.4071, "high", True, ["brewery", "global plates", "live events"], 10.5, "rooftop"),
    FoodCatalogRestaurant("Hard Rock Cafe", "Rooftop", ["American", "Burgers", "Live Music"], "premium", 4.2, 2500, "Banjara Hills", 17.4146, 78.4485, "high", True, ["burgers", "live music", "American"], 6.7, "burger"),
]


FOOD_CATALOG_BY_KEY = {restaurant_key(item.name): item for item in FOOD_CATALOG}


def food_catalog_as_restaurant_rows() -> list[dict]:
    return [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "cuisine": item.cuisine,
            "price_band": item.price_band,
            "rating": item.rating,
            "cost_for_two": item.cost_for_two,
            "address": item.address,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "crowd_level": item.crowd_level,
            "open_late": item.open_late,
            "highlights": item.highlights,
            "distance_from_mgbs_km": item.distance_from_mgbs_km,
            "image_key": item.image_key,
        }
        for item in FOOD_CATALOG
    ]
