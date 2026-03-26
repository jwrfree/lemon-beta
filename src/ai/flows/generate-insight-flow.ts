'use server';

import OpenAI from "openai";

import { config } from "@/lib/config";
import type { UnifiedFinancialContext } from "@/lib/services/financial-context-service";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

export type InsightFocus = 'general' | 'expense' | 'income' | 'net' | 'debt' | 'goals' | 'wealth';

export async function generateFinancialInsight(
    data: UnifiedFinancialContext, 
    focus: InsightFocus = 'general'
): Promise<string> {
    const systemPrompt = `Anda adalah "Lemon Coach", pelatih keuangan Socratic yang cerdas dan suportif.
Tugas Anda adalah memberikan insight finansial menggunakan framework 50/30/20 (Needs/Wants/Savings) dan Logika Dana Darurat.

### PERSONA & TONE:
1. **Socratic**: Jangan langsung mendikte. Gunakan pertanyaan reflektif untuk mengajak user berpikir.
2. **Framework-based**: Gunakan logika 50% Needs, 30% Wants, 20% Savings internal untuk menganalisis data.
3. **Indonesian Context**: Gunakan bahasa yang relate (misal: "boncos", "ngopi", "dana darurat", "gajian").
4. **Empati**: Tetap suportif bahkan saat kondisi keuangan user kurang ideal.

### ATURAN LOGIKA:
- **Dana Darurat**: Jika wealth.cash < (3 * monthly.expense), prioritaskan penghematan pada 'Wants'.
- **Wealth Focus**: Jika assets > liabilities, apresiasi pertumbuhan kekayaan bersih.
- **Budget Alerts**: Jika ada budget yang > 90% (percent), tanyakan urgensi pengeluaran tersebut.`;

    let focusInstruction = "";
    switch (focus) {
        case 'expense':
            focusInstruction = "Fokus pada pola pengeluaran (Wants vs Needs) dan potensi kebocoran halus.";
            break;
        case 'income':
            focusInstruction = "Fokus pada cara mengalokasikan pemasukan baru ke 20% Savings/Investasi.";
            break;
        case 'net':
            focusInstruction = "Fokus pada rasio tabungan dan apakah user sedang 'tambah kaya' atau 'tambah miskin' bulan ini.";
            break;
        case 'wealth':
            focusInstruction = "Fokus pada kekayaan bersih dan perbandingan aset vs hutang.";
            break;
        case 'goals':
            focusInstruction = "Fokus pada progres impian dan konsistensi menabung.";
            break;
        default:
            focusInstruction = "Insight umum tentang rasio 50/30/20 dan kesehatan dana darurat.";
    }

    const userPrompt = `### DATA KEUANGAN TERPADU (UFC):
- Saldo Sekarang: ${data.wealth.cash}
- Kekayaan Bersih: ${data.wealth.net_worth} (Aset: ${data.wealth.assets}, Hutang: ${data.wealth.liabilities})
- Pemasukan (Bulan ini): ${data.monthly.income}
- Pengeluaran (Bulan ini): ${data.monthly.expense}
- Status Risiko: ${data.risk.level} (Score: ${data.risk.score})
- Top Pengeluaran: ${data.top_categories.map(c => `${c.category} (${c.amount})`).join(', ')}
- Budget Kritis: ${data.budgets.filter(b => b.percent > 80).map(b => `${b.name} (${b.percent}%)`).join(', ') || 'Semua aman'}
- Progres Impian: ${data.goals.map(g => `${g.name} (${g.percent.toFixed(1)}%)`).join(', ')}

### INSTRUKSI REFINEMENT:
- Konteks: ${focusInstruction}
- Berikan 1-2 kalimat insight yang cerdas, Socratic (ada unsur pertanyaan), dan memotivasi.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        return completion.choices[0].message.content || "Tetap semangat mengatur keuanganmu!";
    } catch (error) {
        console.error("Insight Generation Error:", error);
        return "Maaf, Lemon AI sedang istirahat. Teruslah mencatat transaksimu!";
    }
}
