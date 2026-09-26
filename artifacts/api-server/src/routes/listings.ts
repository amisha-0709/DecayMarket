import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateListingBody, GenerateListingResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM = `You are a marketplace listing assistant for Decay Market, a surplus-rescue marketplace.
Given the user's raw item description, category, and requested pickup window, return only valid JSON with:
title (short), description (1-2 sentences), category (one of Food, Flowers, Fabric, Paint, Building Materials, Other),
item_type (specific item), quantity (positive integer), unit (short unit such as piece, kg, litre, box, bundle, loaf, stem, set, other),
condition_score (0-100 estimate from text only), condition_label (excellent, good, usable, damaged),
estimated_market_value_inr (positive reasonable local-market estimate), starting_price_inr (positive surplus recommendation),
floor_price_inr (positive minimum price no greater than starting price),
curve_type (steep_4hr, linear_24hr, flat_2week) and curve_duration_hours (respectively 4, 24, or 336),
pickup_deadline_hours (use the requested window when supplied; otherwise choose a realistic deadline no longer than the selected curve),
curve_reason (one plain-English sentence explaining why this resource loses value at this rate),
confidence (0-100).
Choose the curve from the resource's actual decay in economic value, not category alone. Never claim to have analyzed a photo.`;

router.post("/listings/generate", async (req, res): Promise<void> => {
  const input = GenerateListingBody.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: "Describe the item and choose a category." });
    return;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Category: ${input.data.category}\nRequested pickup window in hours: ${input.data.pickup_deadline_hours ?? "choose a realistic window"}\nDescription: ${input.data.raw}`,
        },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    const listing = GenerateListingResponse.parse(JSON.parse(content));
    res.json(listing);
  } catch (error) {
    req.log.error({ err: error }, "Could not generate listing");
    res.status(502).json({ error: "Could not generate the listing. Please try again." });
  }
});

export default router;