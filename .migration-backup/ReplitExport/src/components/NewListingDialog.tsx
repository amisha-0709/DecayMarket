import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mic, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateListing } from "@/lib/ai.functions";
import { CATEGORIES, type Category, type Listing } from "@/lib/listings";
import bread from "@/assets/bread.jpg";

export function NewListingDialog({ onCreate }: { onCreate: (l: Listing) => void }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [seller, setSeller] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = useServerFn(generateListing);

  async function submit() {
    if (raw.trim().length < 3) {
      toast.error("Describe the item first — a sentence is enough.");
      return;
    }
    setBusy(true);
    try {
      const ai = await run({ data: { raw, category } });
      onCreate({
        id: crypto.randomUUID(),
        seller_name: seller.trim() || "You",
        title: ai.title,
        description: ai.description,
        category,
        photo_url: photo ?? bread,
        quantity: ai.quantity,
        condition: Math.round(ai.estimated_condition),
        curve_type: ai.curve_type,
        starting_price: Math.round(ai.starting_price_inr),
        listed_at: Date.now(),
        status: "active",
        ai_reason: ai.curve_reason,
      });
      toast.success("Listing live — the price is already decaying.");
      setOpen(false);
      setRaw("");
      setPhoto(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate the listing.");
    } finally {
      setBusy(false);
    }
  }

  function pickPhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="font-semibold">
          <Mic className="mr-1 size-4" /> List in 10 seconds
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">New listing</DialogTitle>
          <DialogDescription>
            Snap a photo, say what it is. AI writes the listing and picks the decay curve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Photo</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-surface/50 p-3 text-sm text-muted-foreground hover:border-primary/60">
              {photo ? (
                <img src={photo} alt="Preview" className="size-14 rounded-lg object-cover" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-lg bg-muted">
                  <Upload className="size-5" />
                </span>
              )}
              <span>{photo ? "Change photo" : "Upload or snap a photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickPhoto(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw">Describe what you're listing</Label>
            <Textarea
              id="raw"
              rows={3}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="e.g. about 20 croissants left from today, still good but going stale by tonight"
            />
            <p className="text-xs text-muted-foreground">
              <Mic className="mr-1 inline size-3" />
              Stands in for a voice note transcript in this prototype.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller">Seller name</Label>
              <Input
                id="seller"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                placeholder="Your shop"
              />
            </div>
          </div>

          <Button className="w-full font-semibold" onClick={submit} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" /> AI is grading & pricing…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 size-4" /> Generate listing & decay curve
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
