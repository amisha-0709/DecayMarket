import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import type { Listing } from "@/lib/listings";
import {
  CURVES,
  URGENCY_LABEL,
  floorPrice,
  inr,
  priceAt,
  progress,
  timeLeft,
  urgency,
} from "@/lib/decay";

const tone = {
  hot: "bg-hot/15 text-hot border-hot/40",
  warm: "bg-warm/15 text-warm border-warm/40",
  fresh: "bg-fresh/15 text-fresh border-fresh/40",
} as const;

export function ListingCard({
  listing,
  onClaim,
}: {
  listing: Listing;
  onClaim: (l: Listing, price: number) => void;
}) {
  // null until mounted so SSR and first client render agree (no hydration mismatch).
  const [mountedNow, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const now = mountedNow ?? listing.listed_at;

  const claimed = listing.status === "claimed";
  const t = progress(listing.listed_at, listing.curve_type, now);
  const price = priceAt(listing.starting_price, listing.listed_at, listing.curve_type, now);
  const u = urgency(t);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all ${
        claimed ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-ember"
      }`}
    >
      <div className="relative h-40 shrink-0 overflow-hidden">
        <img
          src={listing.photo_url}
          alt={listing.title}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
          {listing.category}
        </span>
        {!claimed && (
          <span
            className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${tone[u]} ${
              u === "hot" ? "pulse-ember" : ""
            }`}
          >
            {URGENCY_LABEL[u]}
          </span>
        )}
        {claimed && (
          <span className="absolute right-3 top-3 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur">
            Claimed
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base leading-snug font-semibold">{listing.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div
              className={`ticker text-4xl font-bold ${claimed ? "text-muted-foreground" : u === "hot" ? "text-hot" : "text-primary"}`}
            >
              {inr(claimed ? (listing.price_at_claim ?? price) : price)}
            </div>
            <div className="text-xs text-muted-foreground line-through">
              {inr(listing.starting_price)} start · floor{" "}
              {inr(floorPrice(listing.starting_price, listing.curve_type))}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{listing.quantity}</div>
            <div>{claimed ? "price locked" : timeLeft(listing.listed_at, listing.curve_type, now)}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress value={t * 100} className="h-1.5" />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{CURVES[listing.curve_type].label}</span>
            <span>{Math.round(t * 100)}% through curve</span>
          </div>
        </div>

        <p className="mt-auto flex gap-2 rounded-lg border border-border/70 bg-surface/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            <span className="font-semibold text-foreground">AI curve · </span>
            {listing.ai_reason} Condition graded {listing.condition}%.
          </span>
        </p>

        <Button
          className="w-full font-semibold"
          variant={claimed ? "secondary" : u === "hot" ? "destructive" : "default"}
          disabled={claimed}
          onClick={() => onClaim(listing, price)}
        >
          {claimed ? `Claimed at ${inr(listing.price_at_claim ?? price)}` : `Claim it · ${inr(price)}`}
        </Button>
      </div>
    </article>
  );
}
