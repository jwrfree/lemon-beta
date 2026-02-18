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
    Kamu adalah konsultan finansial pribadi yang empatik tapi tegas.
    Tugasmu: Audit kondisi hutang user ini & beri strategi 1 kalimat.

    Data:
    - Total Hutang (User Berhutang): Rp${summary.totalOwed.toLocaleString('id-ID')}
    - Total Piutang (Orang Lain Berhutang ke User): Rp${summary.totalOwing.toLocaleString('id-ID')}
    - Hutang Terbesar: ${summary.highestDebt} (Rp${summary.highestDebtAmount.toLocaleString('id-ID')})
    - Rata-rata Bayar: Rp${summary.totalMonthlyPaymentAvg.toLocaleString('id-ID')}/bulan
    - Estimasi Lunas: ${summary.estimatedPayoffDate || 'Tidak tentu'}
    - Hutang Berbunga/Denda: ${summary.highInterestCount}
    - Hutang Jatuh Tempo (Overdue): ${summary.overdueCount}

    Panduan Insight (Pilih 1 yang paling critical):
    1. Jika ada 'Overdue', TEGASKAN untuk segera bayar yang terlambat.
    2. Jika 'Hutang Berbunga' > 0, sarankan metode Avalanche (fokus bunga tinggi dulu).
    3. Jika 'Total Owed' sangat besar vs 'Rata-rata Bayar', beri peringatan "Danger Zone".
    4. Jika 'Total Owing' besar, sarankan untuk menagih.
    5. Jika semua aman/kecil, beri pujian "Financial Health Good".

    Output: 
    1-2 kalimat pendek bahasa Indonesia gaul/santai. 
    Contoh: "Waduh, ada 2 hutang telat nih! Prioritaskan yang overdue dulu biar ga kena denda, baru pikirin yang lain."
    `;

    try {
        const { text } = await generateText({
            model: deepseek('deepseek-chat'),
            prompt: prompt,
            temperature: 0.6,
            maxTokens: 150,
        });

        return text.trim();
    } catch (error) {
        console.error("Audit Debt Error:", error);
        return null;
    }
}
