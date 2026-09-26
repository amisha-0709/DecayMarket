import { z } from "zod";

const Result = z.object({
  title: z.string(),
  description: z.string(),
  quantity: z.string(),
  estimated_condition: z.number().min(0).max(100),
  curve_type: z.enum(["steep_4hr", "linear_24hr", "flat_2week"]),
  starting_price_inr: z.number().positive(),
  curve_reason: z.string(),
});

export type AiListing = z.infer<typeof Result>;

export async function generateListing(data: { raw: string; category: string }): Promise<AiListing> {
  const response = await fetch("/api/listings/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `AI request failed (${response.status}).`);
  return Result.parse(result);
}