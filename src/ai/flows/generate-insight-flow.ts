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
};

export async function generateFinancialInsight(data: FinancialData): Promise<string> {
    const systemPrompt = `You are "Lemon AI", a sharp, friendly, and helpful financial advisor.
Your goal is to provide brief, actionable advice in Indonesian based on user spending habits.
Tone: Casual, empathetic (like a friend), but professional.`;

    const userPrompt = `Data Keuangan Bulan Ini:
- Total Saldo: ${data.totalBalance}
- Pemasukan: ${data.monthlyIncome}
- Pengeluaran: ${data.monthlyExpense}
- Kategori Terboros: ${data.topExpenseCategories.map(c => `${c.category} (${c.amount})`).join(', ')}
- Jumlah Transaksi: ${data.recentTransactionsCount}

Berikan 1 insight singkat (max 2 kalimat) yang cerdas dan memotivasi.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7, // Balanced creativity
            max_tokens: 150,
        });

        return completion.choices[0].message.content || "Tetap semangat mengatur keuanganmu!";
    } catch (error) {
        console.error("Insight Generation Error:", error);
        return "Maaf, Lemon AI sedang istirahat. Teruslah mencatat transaksimu!";
    }
}
