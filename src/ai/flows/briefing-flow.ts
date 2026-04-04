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
    wallets: { name: string; balance: number }[];
    budgets: { name: string; limit: number; spent: number; remaining: number }[];
    reminders: { title: string; amount: number; dueDate: string }[];
    debts?: {
        totalOwed: number;
        totalOwing: number;
        nextDue?: {
            title: string;
            amount: number;
            dueDate: string;
            direction: 'owed' | 'owing';
        };
    };
}

const generateSystemPrompt = () => {
    return `Kamu adalah Lemon Coach, asisten keuangan yang cerdas dan suportif.
Tugasmu: Berikan ringkasan kondisi keuangan harian yang sangat singkat, padat, dan actionable (maksimal 180 token).

INSTRUKSI:
1. Sapa user secara personal.
2. Highlight hal paling krusial (misal: saldo tipis, budget jebol, atau hutang jatuh tempo).
3. Berikan 1 saran tindakan nyata untuk hari ini.
4. Gunakan bahasa Indonesia yang santai tapi profesional (Gue/Elo tidak diizinkan, gunakan Saya/Anda atau Kamu).
5. JANGAN menulis teks panjang lebar.`;
};

export async function generateDailyBriefing(input: BriefingInput): Promise<BriefingOutput> {
  const systemPrompt = generateSystemPrompt();

  let debtContext = '';
  if (input.debts) {
    debtContext = `
- Hutang Total: ${input.debts.totalOwed}
- Piutang Total: ${input.debts.totalOwing}`;
    if (input.debts.nextDue) {
      const type = input.debts.nextDue.direction === 'owed' ? 'Bayar Hutang' : 'Tagih Piutang';
      debtContext += `\n- Item Jatuh Tempo Terdekat: ${type} ${input.debts.nextDue.title} (${input.debts.nextDue.dueDate})`;
    }
  }

  const userPrompt = `### KONTEKS DATA USER:
- Nama: ${input.userName}
- Total Saldo: ${input.totalBalance}
- Inflow Bulan Ini: ${input.monthlyIncome}
- Outflow Bulan Ini: ${input.monthlyExpense}
- Dompet: ${input.wallets.map(w => `${w.name} (${w.balance})`).join(', ')}
- Budget Kritis: ${input.budgets.filter(b => b.remaining < b.limit * 0.2).map(b => `${b.name} (Sisa ${b.remaining})`).join(', ') || 'Semua aman'}${debtContext}
- Tagihan Mendatang: ${input.reminders.map(r => `${r.title} pada ${r.dueDate}`).join(', ') || 'Tidak ada'}

### INSTRUKSI KHUSUS:
Berikan briefing yang paling relevan dengan kondisi data di atas.`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: BriefingSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // Higher for more natural variation
      maxOutputTokens: 180,
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

