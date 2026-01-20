'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ReceiptSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  category: z.string(),
  merchant: z.string().optional(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ScanReceiptOutput = z.infer<typeof ReceiptSchema>;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0, // Accuracy over creativity
    responseMimeType: "application/json",
  }
});

export type ScanReceiptInput = {
  photoDataUri: string;
  availableCategories: string[];
};

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  const base64Data = input.photoDataUri.split(",")[1];
  const mimeType = input.photoDataUri.substring(input.photoDataUri.indexOf(":") + 1, input.photoDataUri.indexOf(";"));

  const systemPrompt = `You are a receipt analysis expert. 
Extract data from the image into valid JSON.
Today's date is ${new Date().toISOString().slice(0, 10)}.

Rules:
1. Amount must be the final total.
2. transactionDate must be YYYY-MM-DD.
3. category MUST be one of these: ${JSON.stringify(input.availableCategories)}.
4. description should be "Belanja di [Merchant]".`;

  try {
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);
    
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    // Validate with Zod
    return ReceiptSchema.parse(parsed);
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    if (error instanceof z.ZodError) {
        throw new Error("AI gagal membaca detail struk dengan benar.");
    }
    throw new Error("Gagal memproses struk dengan AI.");
  }
}
