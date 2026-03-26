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

  const systemPrompt = `Anda adalah "Lemon Categorizer", asisten yang ahli dalam klasifikasi transaksi keuangan. 
Tugas Anda adalah memilih kategori paling akurat berdasarkan deskripsi.
Tipe transaksi: ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}

### ATURAN KLASIFIKASI:
1. Pilih kategori yang paling spesifik.
2. Gunakan konteks bahasa Indonesia (misal: "pecel" -> Konsumsi, "pertalite" -> Transportasi).
3. Berikan tingkat kepercayaan (confidence) 0.0 - 1.0.

### KATEGORI TERSEDIA:
${type === 'expense' 
  ? 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain' 
  : 'Gaji & Tetap, Bisnis & Freelance, Investasi & Pasif, Pemberian & Hadiah, Refund & Cashback, Penjualan Aset, Terima Piutang, Pendapatan Lain'}

Berikan output dalam JSON:
{"category": "Nama Kategori", "confidence": 0.0-1.0}`;

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
