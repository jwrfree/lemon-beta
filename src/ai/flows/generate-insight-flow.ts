'use server';

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export type FinancialData = {
    monthlyIncome: number;
    monthlyExpense: number;
    totalBalance: number;
    topExpenseCategories: { category: string; amount: number }[];
    recentTransactionsCount: number;
};

export async function generateFinancialInsight(data: FinancialData): Promise<string> {
    const prompt = `
    You are a friendly and sharp financial advisor for a personal finance app.
    Analyze this user's data for the current month:
    - Total Balance: ${data.totalBalance}
    - Monthly Income: ${data.monthlyIncome}
    - Monthly Expense: ${data.monthlyExpense}
    - Top Expense Categories: ${data.topExpenseCategories.map(c => `${c.category} (${c.amount})`).join(', ')}
    - Recent Transactions: ${data.recentTransactionsCount}

    Give ONE short, actionable, and friendly insight (max 2 sentences) in Indonesian.
    Style: Casual, encouraging, but direct.
    Example: "Wah, pengeluaran makanmu bulan ini agak tinggi nih. Coba masak sendiri minggu depan biar lebih hemat!"
    If everything looks good, give a compliment.
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful financial assistant." },
                { role: "user", content: prompt }
            ],
            model: "deepseek-chat",
            max_tokens: 100,
        });

        return completion.choices[0].message.content || "Tetap semangat mengatur keuanganmu!";
    } catch (error) {
        console.error("DeepSeek Insight Error:", error);
        return "Maaf, AI sedang istirahat sebentar. Coba lagi nanti ya.";
    }
}
