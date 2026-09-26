import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateListingBody, GenerateListingResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM = `You are a marketplace listing assistant for a decaying-goods marketplace.
Given a raw item description and category, return JSON with:
title (short), description (1-2 sentences), quantity (short string like "12 loaves"),
estimated_condition (0-100, guess based on described state),
curve_type (one of: steep_4hr, linear_24hr, flat_2week) chosen by how fast this specific
resource actually degrades, starting_price_inr (a reasonable estimate in Indian rupees),
and curve_reason (one short sentence explaining why that decay curve fits this item).
Only return valid JSON, no other text.`;

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
        { role: "user", content: `Category: ${input.data.category}\nDescription: ${input.data.raw}` },
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