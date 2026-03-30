'use server';

import OpenAI from "openai";
import { z } from "zod";
import { config } from "@/lib/config";

const openai = new OpenAI({
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
Anda adalah asisten keuangan pribadi yang cerdas, hangat, dan proaktif bernama Lemon Coach. 
Tugas Anda adalah memberikan briefing keuangan singkat (max 3 kalimat) saat user membuka aplikasi.

### ATURAN NARASI:
1. **PUNCHY & SHORT**: Maksimal 3 kalimat pendek. Jangan bertele-tele.
2. **PERSONAL**: Gunakan nama user.
3. **INSIGHTFUL**: Jangan hanya sebutkan angka, tapi apa artinya (misal: "Bulan ini kamu hemat 20% dibanding bulan lalu!").
4. **TONE**: 
   - 'calm': Transaksi normal, budget aman.
   - 'warning': Budget menipis (>80% dipakai) atau ada tagihan besar besok.
   - 'celebration': Ada pendapatan besar masuk atau berhasil saving goal.
5. **BAHASA**: Indonesia santai tapi profesional (Gue/Elo NO, Saya/Kamu/Anda OK).

### OUTPUT JSON FORMAT:
{
  "briefing": "Halo [Nama]! Saldo kamu terkumpul [Angka] dan budget makan masih sisa banyak. Terus pertahankan ya!",
  "suggestion": "Mau catat pengeluaran kopi hari ini?",
  "mood": "calm"
}`;

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
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Higher for more natural variation
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(responseText);
    const result = BriefingSchema.safeParse(parsed);

    if (!result.success) {
        throw new Error("Invalid AI Response format");
    }

    return result.data;
  } catch (error) {
    console.error("[generateDailyBriefing] Error:", error);
    return {
      briefing: `Halo ${input.userName}, selamat datang kembali di Lemon! Mari kita pantau kesehatan keuanganmu hari ini.`,
      suggestion: "Cek mutasi terbaru?",
      mood: "calm"
    };
  }
}
