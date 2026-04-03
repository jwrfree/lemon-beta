'use server';

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z } from "zod";
import { config } from "@/lib/config";
import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
} from "@/ai/prompts";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

const BriefingSchema = z.object({
  briefing: z.string(),
  suggestion: z.string().optional(),
  mood: z.enum(['calm', 'warning', 'celebration']).default('calm'),
});

export type BriefingOutput = z.infer<typeof BriefingSchema>;

export interface BriefingInput {
  userName: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  wallets: { name: string, balance: number }[];
  budgets: { name: string, limit: number, spent: number, remaining: number }[];
  reminders: { title: string, amount: number, dueDate: string }[];
}

export async function generateDailyBriefing(input: BriefingInput): Promise<BriefingOutput> {
  const systemPrompt = `## INSTRUKSI LEMON AI BRIEFING ##
${LEMON_COACH_IDENTITY}

### ATURAN NARASI:
1. **PUNCHY & SHORT**: Maksimal 3 kalimat pendek. Jangan bertele-tele.
2. **PERSONAL**: Gunakan nama user.
3. **TONE**: 
${TONE_AND_LANGUAGE}
   - 'calm': Transaksi normal, budget aman.
   - 'warning': Budget menipis (>80% dipakai) atau ada tagihan besar besok.
   - 'celebration': Ada pendapatan besar masuk atau berhasil saving goal.

### OUTPUT JSON FORMAT:
Wajib mengembalikan objek JSON sesuai skema briefing.`;

  const userPrompt = `### KONTEKS DATA USER:
- Nama: ${input.userName}
- Total Saldo: ${input.totalBalance}
- Inflow Bulan Ini: ${input.monthlyIncome}
- Outflow Bulan Ini: ${input.monthlyExpense}
- Dompet: ${input.wallets.map(w => `${w.name} (${w.balance})`).join(', ')}
- Budget Kritis: ${input.budgets.filter(b => b.remaining < b.limit * 0.2).map(b => `${b.name} (Sisa ${b.remaining})`).join(', ')}
- Tagihan Mendatang: ${input.reminders.map(r => `${r.title} pada ${r.dueDate}`).join(', ')}

### INSTRUKSI KHUSUS:
Berikan briefing yang paling relevan dengan kondisi data di atas.`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: BriefingSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // Higher for more natural variation
    });

    return object;
  } catch (error) {
    console.error("[generateDailyBriefing] Error:", error);
    return {
      briefing: `Halo ${input.userName}, selamat datang kembali di Lemon! Mari kita pantau kesehatan keuanganmu hari ini.`,
      suggestion: "Cek mutasi terbaru?",
      mood: "calm"
    };
  }
}

