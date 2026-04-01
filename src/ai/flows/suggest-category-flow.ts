'use server';

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { config } from "@/lib/config";

import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
  INDONESIAN_FORMAT_RULES 
} from "@/ai/prompts";

const deepseek = createOpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

const SuggestionSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
});

export async function suggestCategory(description: string, type: 'income' | 'expense' = 'expense'): Promise<{category: string, confidence: number} | null> {
  if (!description || description.length < 3) return null;

  const systemPrompt = `## INSTRUKSI KLASIFIKASI TRANSAKSI ##
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

Tipe transaksi: ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}

${INDONESIAN_FORMAT_RULES}

### ATURAN KLASIFIKASI:
1. Pilih kategori paling akurat dari daftar tersedia.
2. Berikan output dalam JSON sesuai skema.

### KATEGORI TERSEDIA:
${type === 'expense' 
  ? 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain' 
  : 'Gaji & Tetap, Bisnis & Freelance, Investasi & Pasif, Pemberian & Hadiah, Refund & Cashback, Penjualan Aset, Terima Piutang, Pendapatan Lain'}`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: SuggestionSchema,
      system: systemPrompt,
      prompt: `Deskripsi: "${description}"`,
      temperature: 0,
    });

    return object;
  } catch (error) {
    console.error("AI Category Suggestion Error:", error);
    return null;
  }
}
