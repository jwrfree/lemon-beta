'use server';

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

import { config } from "@/lib/config";
import type { UnifiedFinancialContext } from "@/lib/services/financial-context-service";
import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
  FINANCIAL_FRAMEWORK,
  INDONESIAN_FORMAT_RULES 
} from "@/ai/prompts";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

export type InsightFocus = 'general' | 'expense' | 'income' | 'net' | 'debt' | 'goals' | 'wealth';

export async function generateFinancialInsight(
    data: UnifiedFinancialContext, 
    focus: InsightFocus = 'general'
): Promise<string> {
    const systemPrompt = `## INSTRUKSI GENERASI INSIGHT ##
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

${FINANCIAL_FRAMEWORK}

### ATURAN LOGIKA KHUSUS:
1. **Dana Darurat**: Jika wealth.cash < (3 * monthly.expense), prioritaskan penghematan pada 'Wants'.
2. **Wealth Focus**: Jika assets > liabilities, apresiasi pertumbuhan kekayaan bersih.
3. **Budget Alerts**: Jika ada budget yang > 90% (percent), hubungkan dengan framework 50/30/20.`;

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
- Saldo: ${data.wealth.cash} | Net Worth: ${data.wealth.net_worth}
- Inflow: ${data.monthly.income} | Outflow: ${data.monthly.expense}
- Risk: ${data.risk.level} (${data.risk.score})
- Top Categories: ${data.top_categories.slice(0, 3).map(c => `${c.category} (${c.amount})`).join(', ')}
- Budget Critical: ${data.budgets.filter(b => b.percent > 85).slice(0, 2).map(b => `${b.name} (${b.percent}%)`).join(', ') || 'None'}
- Goal Progress: ${data.goals.slice(0, 2).map(g => `${g.name} (${g.percent.toFixed(0)}%)`).join(', ')}

### INSTRUKSI REFINEMENT:
- Fokus: ${focusInstruction}
- Berikan 1-2 kalimat insight yang cerdas, Socratic, dan memotivasi.`;

    try {
        const { text } = await generateText({
            model: deepseek("deepseek-chat"),
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.7,
            maxOutputTokens: 300,
        });

        return text || "Tetap semangat mengatur keuanganmu!";
    } catch (error) {
        console.error("Insight Generation Error:", error);
        return "Maaf, Lemon AI sedang istirahat. Teruslah mencatat transaksimu!";
    }
}
