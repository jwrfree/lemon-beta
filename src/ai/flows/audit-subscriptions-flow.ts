'use server';

import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { SubscriptionSummary } from '@/lib/subscription-analysis';
import { config } from '@/lib/config';

const deepseek = createDeepSeek({
    apiKey: config.ai.deepseek.apiKey || '',
    baseURL: config.ai.deepseek.baseURL,
});

/**
 * Menggunakan AI untuk memberikan insight mendalam tentang biaya langganan.
 * Input data sudah diringkas oleh pre-processor lokal agar hemat token.
 */
export async function auditSubscriptionsFlow(summary: SubscriptionSummary) {
    if (summary.activeSubscriptions === 0) return null;

    // Persiapkan data teks yang sangat ringkas untuk AI
    const compactData = {
        totalMonthly: summary.totalMonthlyBurn,
        count: summary.activeSubscriptions,
        anomalies: summary.anomalies.map(a => ({
            name: a.merchantName,
            diff: a.difference,
            current: a.currentAmount
        }))
    };

    const prompt = `
    Kamu adalah auditor keuangan pribadi yang kritis tapi membantu. 
    Analisis data langganan berikut:
    - Total biaya bulanan: Rp${compactData.totalMonthly.toLocaleString('id-ID')}
    - Jumlah langganan aktif: ${compactData.count}
    - Anomali harga: ${JSON.stringify(compactData.anomalies)}

    Berikan 1-2 kalimat insight yang SANGAT SINGKAT dan "to the point". 
    Fokus pada:
    1. Kenaikan harga (silent inflation).
    2. Apakah total biayanya terlalu besar (misal > 1jt).
    3. Jika tidak ada anomali, beri apresiasi singkat.

    Bahasa: Indonesia santai tapi profesional. Jangan beri salam pembuka.
    `;

    try {
        const { text } = await generateText({
            model: deepseek('deepseek-chat'),
            prompt: prompt,
            // maxTokens: 100,
            temperature: 0.7,
        });

        return text.trim();
    } catch (error) {
        console.error("Audit AI Error:", error);
        return null;
    }
}
