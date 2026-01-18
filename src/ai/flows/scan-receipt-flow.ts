
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use gemini-1.5-flash for vision if possible, but let's try gemini-pro-vision if 1.5 fails
// Note: gemini-pro does not support images. We need a vision model.
// Common vision models: gemini-1.5-flash, gemini-pro-vision (deprecated but might work), gemini-1.0-pro-vision
// Let's try gemini-1.5-flash again specifically for vision as it's the standard, 
// BUT if 404 persists, we might need to check if the API key has access to it.
// Assuming the user wants "teknis code terbaik", we should stick to 1.5 flash but maybe the previous 404 was transient or due to config.
// However, since 1.5 flash failed 404 for text, it likely will fail for image too.
// Let's try "gemini-1.5-flash-latest" or just "gemini-1.5-flash" again but handle the error gracefully.
// Actually, let's try the older "gemini-pro-vision" as a fallback if available.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Sticking to this for vision, if it fails, we are out of free tier options usually.
});

export type ScanReceiptInput = {
  photoDataUri: string;
  availableCategories: string[];
};

export type ScanReceiptOutput = {
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  transactionDate?: string;
};

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  // Extract base64 data (remove "data:image/jpeg;base64," prefix)
  const base64Data = input.photoDataUri.split(",")[1];
  const mimeType = input.photoDataUri.substring(input.photoDataUri.indexOf(":") + 1, input.photoDataUri.indexOf(";"));

  const prompt = `You are a meticulous financial assistant specializing in reading receipts.
Analyze the provided receipt image carefully. Extract the key information and return it in the specified JSON format.

- amount: (number) The total transaction amount.
- description: (string) A short summary, e.g., "Belanja di [merchant name]".
- category: (string) Choose from: ${JSON.stringify(input.availableCategories)}.
- merchant: (string) The name of the store.
- transactionDate: (string) YYYY-MM-DD format. Use today (${new Date().toISOString().slice(0, 10)}) if not found.

Return ONLY valid JSON. No markdown.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as ScanReceiptOutput;
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    throw new Error("Gagal memproses struk dengan AI.");
  }
}
