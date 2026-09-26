import { useCallback, useEffect, useState } from "react";
import type { CurveType } from "./decay";

import bread from "@/assets/bread.jpg";
import flowers from "@/assets/flowers.jpg";
import fabric from "@/assets/fabric.jpg";
import paint from "@/assets/paint.jpg";
import tiles from "@/assets/tiles.jpg";

export const CATEGORIES = [
  "Food",
  "Flowers",
  "Fabric",
  "Paint",
  "Building Materials",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Listing = {
  id: string;
  seller_name: string;
  title: string;
  description: string;
  category: Category;
  photo_url: string;
  quantity: string;
  condition: number;
  curve_type: CurveType;
  starting_price: number;
  listed_at: number;
  status: "active" | "claimed";
  claimed_at?: number;
  price_at_claim?: number;
  ai_reason: string;
};

const H = 3600_000;

function seed(): Listing[] {
  const now = Date.now();
  return [
    {
      id: "l1",
      seller_name: "Kolkata Crust Bakery",
      title: "12 sourdough loaves, baked this morning",
      description:
        "End-of-day surplus sourdough. Crust still crisp, best eaten or frozen tonight.",
      category: "Food",
      photo_url: bread,
      quantity: "12 loaves",
      condition: 82,
      curve_type: "steep_4hr",
      starting_price: 960,
      listed_at: now - 2.6 * H,
      status: "active",
      ai_reason: "Baked goods stale within hours — steep 4-hour curve, 90% drop to clear tonight.",
    },
    {
      id: "l2",
      seller_name: "Lake Market Florals",
      title: "Mixed roses & tulips, 40 stems",
      description: "Unsold stems from the morning stall. Heads open, 2–3 good days left in water.",
      category: "Flowers",
      photo_url: flowers,
      quantity: "40 stems",
      condition: 68,
      curve_type: "steep_4hr",
      starting_price: 1400,
      listed_at: now - 0.7 * H,
      status: "active",
      ai_reason: "Cut flowers lose value overnight — steep curve, aggressive early markdown.",
    },
    {
      id: "l3",
      seller_name: "Ananya Tailoring",
      title: "Cotton off-cuts bundle, ~6 kg",
      description: "Mixed-colour cotton remnants from a production run. Clean, unwashed, no stains.",
      category: "Fabric",
      photo_url: fabric,
      quantity: "6 kg",
      condition: 91,
      curve_type: "linear_24hr",
      starting_price: 2200,
      listed_at: now - 9 * H,
      status: "active",
      ai_reason: "Fabric doesn't spoil but storage costs bite — linear 24-hour clearance curve.",
    },
    {
      id: "l4",
      seller_name: "Salt Lake Hardware",
      title: "5 part-used interior paint cans",
      description: "Opened emulsion tins, 40–70% full. Skin on top of two, mixable.",
      category: "Paint",
      photo_url: paint,
      quantity: "5 cans",
      condition: 55,
      curve_type: "linear_24hr",
      starting_price: 1800,
      listed_at: now - 20 * H,
      status: "active",
      ai_reason: "Opened paint dries out over days — 24-hour linear curve down to a 10% floor.",
    },
    {
      id: "l5",
      seller_name: "Behala Tile Yard",
      title: "Pallet of hairline-cracked floor tiles",
      description: "Approx 40 sq ft of ceramic tiles with cosmetic cracks. Fine for cutting/mosaic.",
      category: "Building Materials",
      photo_url: tiles,
      quantity: "40 sq ft",
      condition: 61,
      curve_type: "flat_2week",
      starting_price: 3500,
      listed_at: now - 60 * H,
      status: "active",
      ai_reason: "Tiles degrade slowly — flat 14-day curve with only a 20% total markdown.",
    },
  ];
}

const KEY = "decay-market-listings-v1";

export function useListings() {
  const [listings, setListings] = useState<Listing[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setListings(JSON.parse(raw) as Listing[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: Listing[]) => {
    setListings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback(
    (l: Listing) => persist([l, ...listings]),
    [listings, persist],
  );

  const claim = useCallback(
    (id: string, price: number) =>
      persist(
        listings.map((l) =>
          l.id === id
            ? { ...l, status: "claimed" as const, claimed_at: Date.now(), price_at_claim: price }
            : l,
        ),
      ),
    [listings, persist],
  );

  const reset = useCallback(() => persist(seed()), [persist]);

  return { listings, add, claim, reset };
}
