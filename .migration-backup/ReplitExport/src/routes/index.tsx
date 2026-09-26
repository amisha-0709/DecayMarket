import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame, Leaf, TrendingDown } from "lucide-react";

import { ListingCard } from "@/components/ListingCard";
import { NewListingDialog } from "@/components/NewListingDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useListings, type Listing } from "@/lib/listings";
import { inr } from "@/lib/decay";

const TITLE = "Decay Market — surplus goods on a live decay curve";
const DESC =
  "List decaying or surplus goods in 10 seconds. AI grades condition and sets a decay curve that drops the price in real time until someone claims it.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { listings, add, claim, reset } = useListings();
  const [pending, setPending] = useState<{ listing: Listing; price: number } | null>(null);

  const active = useMemo(() => listings.filter((l) => l.status === "active"), [listings]);
  const claimed = useMemo(() => listings.filter((l) => l.status === "claimed"), [listings]);
  const rescued = claimed.reduce((s, l) => s + (l.price_at_claim ?? 0), 0);

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingDown className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Decay Market</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
              Reset demo
            </Button>
            <NewListingDialog onCreate={add} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Flame className="size-3.5" /> The anti-waste marketplace
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-bold sm:text-6xl">
          Good things
          <br />
          shouldn't expire.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          AI grades the condition and sets the right urgency curve for every surplus item — not a
          flat discount, a second chance.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Live listings", v: String(active.length), i: <TrendingDown className="size-4" /> },
            { k: "Claimed", v: String(claimed.length), i: <Flame className="size-4" /> },
            { k: "Value recovered", v: inr(rescued), i: <Leaf className="size-4" /> },
            { k: "Curve archetypes", v: "3", i: <Flame className="size-4" /> },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-border bg-card/70 p-4">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {s.i}
                {s.k}
              </dt>
              <dd className="ticker mt-1 text-2xl font-bold">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live ({active.length})</TabsTrigger>
            <TabsTrigger value="claimed">Claimed ({claimed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            {active.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    onClaim={(listing, price) => setPending({ listing, price })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claimed" className="mt-6">
            {claimed.length === 0 ? (
              <EmptyState text="Nothing claimed yet. Grab something before the curve bottoms out." />
            ) : (
              <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {claimed.map((l) => (
                  <ListingCard key={l.id} listing={l} onClaim={() => {}} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Lock this price?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.listing.title} — claiming now freezes the price at{" "}
              <span className="font-semibold text-primary">{inr(pending?.price ?? 0)}</span>. Pickup
              is arranged with {pending?.listing.seller_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep watching</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) claim(pending.listing.id, pending.price);
                setPending(null);
              }}
            >
              Claim at {inr(pending?.price ?? 0)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EmptyState({ text = "No live listings. Add one and watch the curve start." }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
