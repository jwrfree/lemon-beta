import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client for DeepSeek (or any compatible API)
const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
    try {
        // Fallback or Mock if API Key missing (Good for dev environment/demo)
        if (!process.env.DEEPSEEK_API_KEY) {
            // Return mock data for demo purposes if no key
            console.warn("No API Key, returning mock data");
            return NextResponse.json({
                summary: "Mode Demo: Pendapatan Anda stabil, namun pengeluaran kategori Makanan perlu diperhatikan.",
                savingsTip: "Coba kurangi jajan kopi kekinian, bisa hemat 500rb/bulan.",
                categoryForecast: [
                    { category: 'Makanan', predictedAmount: 1500000, reason: 'Tren harian tinggi' },
                    { category: 'Transport', predictedAmount: 500000, reason: 'Stabil' }
                ],
                sentiment: 'neutral'
            });
        }

        const body = await req.json();
        const { transactions, view } = body;

        // Simplify data for AI Context Window
        const summary = transactions.slice(0, 100).map((t: any) => ({
            d: t.date.split('T')[0],
            c: t.category,
            a: t.amount,
            t: t.type // income/expense
        }));

        let prompt = '';

        if (view === 'dashboard_summary') {
            prompt = `
            Act as a witty financial advisor. Analyze these recent transactions JSON:
            ${JSON.stringify(summary)}

            Return ONLY a raw JSON object (no markdown) with this structure:
            {
                "summary": "A concise, witty 2-sentence summary of the user's financial behavior this month in Bahasa Indonesia (slang/gaul is okay).",
                "savingsTip": "One specific, actionable tip to save money based on the highest expense category.",
                "categoryForecast": [ 
                    {"category": "category_name", "predictedAmount": number, "reason": "short reason"} 
                ] (Top 2 categories likely to overspend),
                "sentiment": "positive" | "neutral" | "negative" | "critical"
            }
            `;
        } else {
            // Default Forecasting View
            prompt = `
            Analyze the following transaction history and forecast end-of-month spending.
            Transactions: ${JSON.stringify(summary)}
            
            Return JSON:
            {
                "forecasts": [
                    { "category": "Name", "current": 100, "projected": 150, "status": "safe"|"warning"|"critical", "insight": "Indonesian insight" }
                ],
                "overall_comment": "Summary in Indonesian"
            }
            `;
        }

        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const result = completion.choices[0].message.content;

        if (!result) throw new Error('No content from AI');

        return NextResponse.json(JSON.parse(result));

    } catch (error: any) {
        console.error('AI Error:', error);
        // Fail gracefully
        return NextResponse.json(
            { error: error.message || 'Failed to analyze finances' },
            { status: 500 }
        );
    }
}
