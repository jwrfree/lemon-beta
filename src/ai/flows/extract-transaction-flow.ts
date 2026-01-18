'use server';

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export type TransactionExtractionInput = {
  text: string;
};

export type TransactionExtractionOutput = {
  amount: number;
  description: string;
  category: string;
  subCategory?: string;
  wallet?: string;
  sourceWallet?: string;
  destinationWallet?: string;
  location?: string;
  date?: string;
};

export async function extractTransaction(input: TransactionExtractionInput): Promise<TransactionExtractionOutput> {
  const currentDate = new Date().toISOString().slice(0, 10);
  const prompt = `You are an expert financial assistant. Your task is to extract transaction details from the user's text input.
The current date is ${currentDate}.

Analyze the provided text and fill in the following fields in strict JSON format.
- amount: (number) The monetary value of the transaction.
- description: (string) A clear and concise summary of what the transaction was for.
- category: (string) Infer a general category (e.g., 'Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Transfer').
- subCategory: (string, optional) Based on the chosen category.
- wallet: (string, optional) Source wallet name. Default to "Tunai" if not mentioned.
- sourceWallet: (string, optional) For transfers only: source wallet name.
- destinationWallet: (string, optional) For transfers only: destination wallet name.
- location: (string, optional) Store or location name.
- date: (string) Transaction date in YYYY-MM-DD format. Default to today (${currentDate}) if not found.

User Input: "${input.text}"

Return ONLY valid JSON. No markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs JSON." },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as TransactionExtractionOutput;
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    throw new Error("Gagal memproses teks dengan AI.");
  }
}
