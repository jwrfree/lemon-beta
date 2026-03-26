'use server';

import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { config } from '@/lib/config';

const deepseek = createDeepSeek({
    apiKey: config.ai.deepseek.apiKey || '',
    baseURL: config.ai.deepseek.baseURL,
});

export interface DebtAuditSummary {
    totalOwed: number;
    totalOwing: number;
    highestDebt: string;
    highestDebtAmount: number;
    totalMonthlyPaymentAvg: number;
    estimatedPayoffDate: string | null;
    highInterestCount: number;
    overdueCount: number;
}

/**
 * Menggunakan AI untuk memberikan strategi pelunasan hutang.
 */
export async function auditDebtsFlow(summary: DebtAuditSummary) {
    // Skip if no debt
    if (summary.totalOwed === 0 && summary.totalOwing === 0) return null;

    const prompt = `
    Kamu adalah "Lemon Coach", pelatih keuangan Socratic yang cerdas dan empatik.
    Analisis kondisi hutang user dan berikan 1-2 kalimat insight/strategi.

    Konteks Finansial:
    - Hutang (Total Keluar): Rp${summary.totalOwed.toLocaleString('id-ID')}
    - Piutang (Total Masuk): Rp${summary.totalOwing.toLocaleString('id-ID')}
    - Hutang Terbesar: ${summary.highestDebt} (Rp${summary.highestDebtAmount.toLocaleString('id-ID')})
    - Rata-rata Cicilan: Rp${summary.totalMonthlyPaymentAvg.toLocaleString('id-ID')}/bulan
    - Estimasi Lunas: ${summary.estimatedPayoffDate || 'Belum terdeteksi'}
    - Berbunga/Denda: ${summary.highInterestCount} akun
    - Terlambat (Overdue): ${summary.overdueCount} akun

    Misi Anda (Socratic Trainer):
    1. PRIORITAS UTAMA: Jika ada 'Overdue', jangan basa-basi, tanya apa rencananya untuk segera lunasin sebelum denda numpuk.
    2. Jika ada bunga Tinggi (>0), tanya apakah dia tahu metode Avalanche atau butuh bantuan prioritas.
    3. Jika 'Total Owed' sangat besar vs 'Rata-rata Cicilan', berikan pertanyaan reflektif tentang beban mental/finansialnya.
    4. Jika 'Total Owing' (Piutang) besar, ingatkan dengan santai untuk mulai menagih.
    5. Gunakan bahasa Indonesia yang santai ("boncos", "ngopi", "dana darurat") tapi tetap berwibawa.

    Output: 1-2 kalimat pendek yang cerdas, motivatif, dan ada unsur pertanyaan reflektif.
    `;

    try {
        const { text } = await generateText({
            model: deepseek('deepseek-chat'),
            prompt: prompt,
            temperature: 0.6,
            // maxTokens: 150,
        });

        return text.trim();
    } catch (error) {
        console.error("Audit Debt Error:", error);
        return null;
    }
}
