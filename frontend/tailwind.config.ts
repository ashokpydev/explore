import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pearl: "#fff8ed",
        charcoal: "#171717",
        lac: "#a5243d",
        turmeric: "#f4b942",
        neem: "#137c55",
        lake: "#147c91",
        night: "#111827"
      },
      boxShadow: {
        premium: "0 22px 70px rgba(17, 24, 39, 0.16)"
      },
      backgroundImage: {
        "hyderabad-hero":
          "linear-gradient(90deg, rgba(20,124,145,.82), rgba(17,24,39,.42)), url('/images/places/charminar.jpg')"
      }
    }
  },
  plugins: []
};

export default config;
