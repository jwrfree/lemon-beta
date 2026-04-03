'use server';

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { SubscriptionSummary } from '@/lib/subscription-analysis';
import { config } from '@/lib/config';
import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
} from "@/ai/prompts";

const deepseek = createDeepSeek({
    apiKey: config.ai.deepseek.apiKey,
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
    Kamu adalah "Lemon Coach", auditor pengeluaran yang kritis tapi tetap suportif. 
    Analisis "silent drainage" dari biaya langganan berikut:
    - Total bulanan: Rp${compactData.totalMonthly.toLocaleString('id-ID')}
    - Jumlah langganan: ${compactData.count} item
    - Anomali harga/kenaikan: ${JSON.stringify(compactData.anomalies)}

    Target Insight (Pilih yang paling relevan):
    1. Jika ada anomali (kenaikan harga), tanya apakah user sadar "kebocoran halus" ini terjadi.
    2. Jika total > Rp1.000.000, berikan perbandingan nilai (misal: "Setara dengan beli gadget X tiap tahun").
    3. Jika langganan > 5 item, ajak evaluasi kegunaannya satu per satu.
    4. Jika aman, berikan apresiasi karena sudah disiplin menjaga "fixed cost".

    Output: 1-2 kalimat "to the point", Socratic (ada unsur pertanyaan), bahasa Indonesia santai. Jangan beri salam pembuka.
    `;

    try {
        const { text } = await generateText({
            model: deepseek("deepseek-chat"),
            system: `${LEMON_COACH_IDENTITY}\n\n${TONE_AND_LANGUAGE}\n\nAnalisis langganan user dan berikan saran penghematan.`,
            prompt: prompt,
            temperature: 0.6,
            maxOutputTokens: 200,
        });

        return text?.trim() || null;
    } catch (error) {
        console.error("Audit AI Error:", error);
        return null;
    }
}
