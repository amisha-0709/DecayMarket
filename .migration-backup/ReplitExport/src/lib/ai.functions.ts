import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  raw: z.string().min(3),
  category: z.string().min(1),
});

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

const SYSTEM = `You are a marketplace listing assistant for a decaying-goods marketplace.
Given a raw item description and category, return JSON with:
title (short), description (1-2 sentences), quantity (short string like "12 loaves"),
estimated_condition (0-100, guess based on described state),
curve_type (one of: steep_4hr, linear_24hr, flat_2week) chosen by how fast this specific
resource actually degrades, starting_price_inr (a reasonable estimate in Indian rupees),
and curve_reason (one short sentence explaining why that decay curve fits this item).
Only return valid JSON, no other text.`;

export const generateListing = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiListing> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Category: ${data.category}\nDescription: ${data.raw}` },
        ],
      }),
    });

    if (res.status === 429) throw new Error("AI is rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    if (!res.ok) throw new Error(`AI request failed (${res.status}): ${await res.text()}`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return Result.parse(JSON.parse(cleaned));
  });
