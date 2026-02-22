'use server';

import OpenAI from "openai";
import { z } from "zod";
import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.openai.apiKey,
});

const ReceiptSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  category: z.string(),
  merchant: z.string().optional(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ScanReceiptOutput = z.infer<typeof ReceiptSchema>;

export type ScanReceiptInput = {
  photoDataUri: string;
  availableCategories: string[];
};

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  const systemPrompt = `You are a receipt analysis expert.
Extract data from the image into valid JSON matching this exact schema:
{"amount": number, "description": string, "category": string, "merchant": string, "transactionDate": "YYYY-MM-DD"}

Today's date is ${new Date().toISOString().slice(0, 10)}.

Rules:
1. Amount must be the final total as a positive number.
2. transactionDate must be YYYY-MM-DD format.
3. category MUST be one of these: ${JSON.stringify(input.availableCategories)}.
4. description should be "Belanja di [Merchant]".
5. Respond with only valid JSON, no markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: { url: input.photoDataUri, detail: "auto" },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0,
    });

    const responseText = response.choices[0]?.message?.content || "";
    if (!responseText) {
      throw new Error("OpenAI returned an empty response.");
    }
    const parsed = JSON.parse(responseText);

    // Validate with Zod
    return ReceiptSchema.parse(parsed);
  } catch (error) {
    console.error("OpenAI Vision API Error:", error);
    if (error instanceof z.ZodError) {
      throw new Error("AI gagal membaca detail struk dengan benar.");
    }
    throw new Error("Gagal memproses struk dengan AI.");
  }
}
