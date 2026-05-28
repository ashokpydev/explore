"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

export function PlaceCard({ place }: { place: { slug?: string; name: string; type: string; image: string; rating: string; meta: string; tip: string } }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <Link href={`/explore?place=${place.slug ?? encodeURIComponent(place.name)}`} className="block focus:outline-none focus:ring-2 focus:ring-lac focus:ring-offset-2 dark:focus:ring-turmeric">
        <div className="relative aspect-[4/3]">
          <Image src={place.image} alt={place.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{place.name}</h3>
              <p className="text-sm text-black/60 dark:text-white/60">{place.type}</p>
            </div>
            <span className="flex items-center gap-1 rounded-md bg-turmeric px-2 py-1 text-sm font-semibold text-charcoal">
              <Star size={14} fill="currentColor" /> {place.rating}
            </span>
          </div>
          <p className="flex gap-2 text-sm text-black/65 dark:text-white/65">
            <MapPin size={16} className="mt-0.5 shrink-0" /> {place.meta}
          </p>
          <p className="rounded-md bg-pearl p-3 text-sm text-charcoal dark:bg-night dark:text-white/82">{place.tip}</p>
        </div>
      </Link>
    </motion.article>
  );
}
