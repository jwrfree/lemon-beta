import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client for DeepSeek
const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
    try {
        if (!process.env.DEEPSEEK_API_KEY) {
            return NextResponse.json(
                { error: 'DeepSeek API Key not configured' },
                { status: 500 }
            );
        }

        const { transactions, daysElapsed, daysInMonth } = await req.json();

        // Summarize transactions to save tokens
        // Group by category and date to see patterns
        const summary = transactions.map((t: any) => ({
            d: t.date.split('T')[0], // YYYY-MM-DD
            c: t.category,
            a: t.amount
        }));

        const prompt = `
        You are a smart financial assistant.
        Current Date Progress: Day ${daysElapsed} of ${daysInMonth}.
        
        Analyze the following transaction history for this month and forecast the end-of-month spending.
        
        Transactions (Date, Category, Amount):
        ${JSON.stringify(summary)}

        Instructions:
        1. Predict the final "projected" amount for each category based on the current run rate and patterns (e.g. if bills usually happen once, don't project them linearly. If food is daily, project linearly).
        2. Assign a status: 'safe' (on track), 'warning' (slightly high), 'critical' (spending too fast).
        3. Provide a short, witty, and actionable 1-sentence insight for each category in Bahasa Indonesia.
        
        Format your response purely as a JSON object with this structure:
        {
            "forecasts": [
                { "category": "Example", "current": 1000, "projected": 1500, "status": "safe", "insight": "Hemat pangkal kaya!" }
            ],
            "overall_comment": "A summary comment about the overall financial health in Bahasa Indonesia."
        }
        Do not include markdown formatting (like \`\`\`json). Just the raw JSON.
        `;

        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const result = completion.choices[0].message.content;

        if (!result) {
            throw new Error('No content from AI');
        }

        return NextResponse.json(JSON.parse(result));

    } catch (error: any) {
        console.error('DeepSeek Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze finances' },
            { status: 500 }
        );
    }
}
