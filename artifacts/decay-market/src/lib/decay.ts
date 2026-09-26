export type CurveType = "steep_4hr" | "linear_24hr" | "flat_2week";

export const CURVES: Record<
  CurveType,
  { label: string; durationHours: number; totalDrop: number; shape: "steep" | "linear" | "flat" }
> = {
  steep_4hr: { label: "Steep · 4 hr", durationHours: 4, totalDrop: 0.9, shape: "steep" },
  linear_24hr: { label: "Linear · 24 hr", durationHours: 24, totalDrop: 0.9, shape: "linear" },
  flat_2week: { label: "Flat · 14 days", durationHours: 24 * 14, totalDrop: 0.2, shape: "flat" },
};

/** Fraction of the curve elapsed, 0..1 */
export function progress(listedAt: number, curve: CurveType, now = Date.now()) {
  const total = CURVES[curve].durationHours * 3600_000;
  return Math.min(1, Math.max(0, (now - listedAt) / total));
}

/** Price at a moment in time, following the curve shape. */
export function priceAt(
  startingPrice: number,
  listedAt: number,
  curve: CurveType,
  now = Date.now(),
) {
  const { totalDrop, shape } = CURVES[curve];
  const t = progress(listedAt, curve, now);
  // steep drops fast up front, flat drops gently, linear is straight.
  const eased = shape === "steep" ? 1 - Math.pow(1 - t, 2.4) : t;
  const floor = startingPrice * (1 - totalDrop);
  return Math.max(floor, Math.round(startingPrice - (startingPrice - floor) * eased));
}

export function floorPrice(startingPrice: number, curve: CurveType) {
  return Math.round(startingPrice * (1 - CURVES[curve].totalDrop));
}

export type Urgency = "hot" | "warm" | "fresh";

export function urgency(t: number): Urgency {
  if (t > 0.7) return "hot";
  if (t < 0.3) return "fresh";
  return "warm";
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  hot: "🔥 Going fast",
  warm: "⚡ Dropping",
  fresh: "⏳ Still fresh",
};

export function timeLeft(listedAt: number, curve: CurveType, now = Date.now()) {
  const total = CURVES[curve].durationHours * 3600_000;
  const ms = Math.max(0, listedAt + total - now);
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m left`;
  return `${m}m ${String(sec).padStart(2, "0")}s left`;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
