import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
    const apiKey = config.ai.deepseek.apiKey;
    const baseUrl = config.ai.deepseek.baseURL;

    if (!apiKey) {
        return NextResponse.json({ error: 'DeepSeek API key not found' }, { status: 500 });
    }

    try {
        const response = await fetch(`${baseUrl}/user/balance`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: 'Failed to fetch balance', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract relevant data
        // DeepSeek API usually returns { is_available: boolean, balance_infos: [{ currency: "CNY", total_balance: "0.00", ... }] }
        // We want to return a simplified structure for the frontend

        return NextResponse.json({
            isAvailable: data.is_available,
            balanceInfos: data.balance_infos,
        });
    } catch (error) {
        console.error('Error fetching DeepSeek balance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
