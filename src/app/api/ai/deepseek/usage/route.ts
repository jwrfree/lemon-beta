import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { differenceInDays, startOfDay } from 'date-fns';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch transaction count and first transaction date as a proxy for platform usage
        const { data: stats, error } = await supabase
            .from('transactions')
            .select('created_at', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const totalTransactions = stats.length;
        const firstTxDate = totalTransactions > 0 ? new Date(stats[0].created_at) : new Date();
        const daysActive = Math.max(differenceInDays(new Date(), startOfDay(firstTxDate)), 1);

        // Standard Lemon Coach token consumption estimates:
        // Average 485 tokens per transaction (400 overhead + 85 response)
        // Average 1500 tokens per chat session involvement
        // We use a blended average based on real platform activity
        const TRANSACTION_TOKEN_WEIGHT = 485;
        const CHAT_ACTIVITY_WEIGHT = 2500; // Estimated daily baseline for coaching

        const estimatedTotalTokens = (totalTransactions * TRANSACTION_TOKEN_WEIGHT) + (daysActive * CHAT_ACTIVITY_WEIGHT);
        const avgDailyTokens = Math.floor(estimatedTotalTokens / daysActive);

        return NextResponse.json({
            avgDailyTokens,
            daysActive,
            totalTransactions,
            lastSynced: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error calculating AI usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
