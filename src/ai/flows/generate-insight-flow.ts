'use server';

import OpenAI from "openai";

import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

export type FinancialData = {
    monthlyIncome: number;
    monthlyExpense: number;
    totalBalance: number;
    topExpenseCategories: { category: string; amount: number }[];
    recentTransactionsCount: number;
    debtInfo?: {
        totalDebt: number;
        debtChangeMonth: number; // positive means debt increased
        hasSilentGrowth: boolean;
        projectedPayoffMonths?: number;
    }
};

export type InsightFocus = 'general' | 'expense' | 'income' | 'net' | 'debt';

export async function generateFinancialInsight(data: FinancialData, focus: InsightFocus = 'general'): Promise<string> {
    const systemPrompt = `Anda adalah "Lemon Coach", pelatih keuangan Socratic yang cerdas dan suportif.
Tugas Anda adalah memberikan insight finansial menggunakan framework 50/30/20 (Needs/Wants/Savings) dan Logika Dana Darurat.

### PERSONA & TONE:
1. **Socratic**: Jangan langsung mendikte. Gunakan pertanyaan reflektif untuk mengajak user berpikir.
2. **Framework-based**: Gunakan logika 50% Needs, 30% Wants, 20% Savings internal untuk menganalisis data.
3. **Indonesian Context**: Gunakan bahasa yang relate (misal: "boncos", "ngopi", "dana darurat", "gajian").
4. **Empati**: Tetap suportif bahkan saat kondisi keuangan user kurang ideal.

### ATURAN LOGIKA:
- **Dana Darurat**: Jika totalBalance < (3 * monthlyExpense), prioritaskan penghematan pada 'Wants'.
- **Debt focus**: Jika ada debtInfo, berikan strategi spesifik atau tanya tentang rencana pelunasan.
- **Silent Growth**: Peringatan tegas tapi tetap memberikan solusi/harapan.`;

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
        case 'debt':
            focusInstruction = "Fokus pada efisiensi pelunasan hutang dan menghindari bunga yang menjerat.";
            break;
        default:
            focusInstruction = "Insight umum tentang rasio 50/30/20 dan kesehatan dana darurat.";
    }

    let debtContext = "";
    if (data.debtInfo) {
        debtContext = `
Data Hutang:
- Total: ${data.debtInfo.totalDebt}
- Tren: ${data.debtInfo.debtChangeMonth > 0 ? 'Meningkat' : 'Menurun'} ${Math.abs(data.debtInfo.debtChangeMonth)}
- Silent Growth: ${data.debtInfo.hasSilentGrowth ? 'BEHAYA (Bunga > Bayar)' : 'Terkendali'}
- Proyeksi Bebas Hutang: ${data.debtInfo.projectedPayoffMonths ? `${data.debtInfo.projectedPayoffMonths} bulan` : 'Tidak menentu'}
`;
    }

    const userPrompt = `### DATA KEUANGAN BULAN INI:
- Saldo Sekarang: ${data.totalBalance}
- Pemasukan (Bulan ini): ${data.monthlyIncome}
- Pengeluaran (Bulan ini): ${data.monthlyExpense}
- Top Boros: ${data.topExpenseCategories.map(c => `${c.category} (${c.amount})`).join(', ')}
- Aktivitas: ${data.recentTransactionsCount} transaksi
${debtContext}

### INSTRUKSI REFINEMENT:
- Konteks: ${focusInstruction}
- Berikan 1-2 kalimat insight yang cerdas, Socratic (ada unsur pertanyaan), dan memotivasi.
- Jika ada Silent Growth, wajib bahas dampaknya secara halus tapi nyata.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        return completion.choices[0].message.content || "Tetap semangat mengatur keuanganmu!";
    } catch (error) {
        console.error("Insight Generation Error:", error);
        return "Maaf, Lemon AI sedang istirahat. Teruslah mencatat transaksimu!";
    }
}
