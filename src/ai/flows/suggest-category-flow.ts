'use server';

import OpenAI from "openai";
import { z } from "zod";

import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

const SuggestionSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
});

export async function suggestCategory(description: string, type: 'income' | 'expense' = 'expense'): Promise<{category: string, confidence: number} | null> {
  if (!description || description.length < 3) return null;

  const systemPrompt = `Anda adalah asisten keuangan yang ahli. 
Tugas Anda adalah menyarankan kategori transaksi berdasarkan deskripsi singkat.
Tipe transaksi: ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}

Kategori yang tersedia:
${type === 'expense' ? 'Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Sosial, Investasi, Lain-lain' : 'Gaji, Bonus, Investasi, Cashback, Lain-lain'}

Berikan output dalam format JSON:
{"category": "Nama Kategori", "confidence": 0.0-1.0}

Langsung berikan JSON tanpa penjelasan!`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Deskripsi: "${description}"` }
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(responseText);
    const result = SuggestionSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("AI Category Suggestion Error:", error);
    return null;
  }
}
