"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Search, Sun } from "lucide-react";

const nav = [
  ["Explore", "/explore"],
  ["Food", "/food"],
  ["Planner", "/planner"],
  ["Assistant", "/assistant"],
  ["Admin", "/admin"]
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const refreshNavigate = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.assign(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-pearl/88 backdrop-blur dark:border-white/10 dark:bg-night/88">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" onClick={refreshNavigate("/")} className="flex items-center gap-2 font-semibold tracking-wide">
          <span className="relative h-11 w-11 overflow-hidden rounded-md border border-white/70 bg-lake shadow-sm">
            <Image
              src="/images/explore-hyderabad-logo.png"
              alt="Explore Hyderabad logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span>Explore Hyderabad</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-black/70 dark:text-white/75 md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={refreshNavigate(href)} className="hover:text-lac dark:hover:text-turmeric">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/explore?focus=search" onClick={refreshNavigate("/explore?focus=search")} className="grid h-9 w-9 place-items-center rounded-md border border-black/10 dark:border-white/10" aria-label="Search places">
            <Search size={17} />
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-black/10 dark:border-white/10"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="hidden dark:block" size={17} />
            <Moon className="dark:hidden" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
