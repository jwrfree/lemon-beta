import { createClient } from '@/lib/supabase/client';
import type { SpendingRisk, MonthlySummary, MonthlySummaryRow } from '@/types/models';

export const mapMonthlySummaryFromDb = (row: MonthlySummaryRow): MonthlySummary => ({
    id: row.id,
    userId: row.user_id,
    monthDate: row.month_date,
    totalIncome: Number(row.total_income),
    totalExpense: Number(row.total_expense),
    netCashflow: Number(row.net_cashflow),
    velocityScore: Number(row.velocity_score),
    updatedAt: row.updated_at
});

import { generateSpendingInsight } from '@/features/insights/logic';
import { generateDailyBriefing, BriefingOutput } from '@/ai/flows/briefing-flow';

class InsightService {
    /**
     * Get current month's risk score and insights.
     */
    async getSpendingRisk(userId: string): Promise<SpendingRisk | null> {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_spending_risk_score', {
            p_user_id: userId
        });

        if (error) {
            console.error('[InsightService] Risk Score Error:', {
                message: error.message,
                code: error.code,
                hint: error.hint,
                details: error.details
            });
            return null;
        }

        const riskData: SpendingRisk = {
            level: data.level,
            score: data.score,
            burnRate: Number(data.burn_rate),
            velocity: Number(data.velocity),
            balance: Number(data.balance),
            survivalDays: Number(data.survival_days)
        };

        return {
            ...riskData,
            insight: generateSpendingInsight(riskData)
        };
    }

    /**
     * Get monthly summaries for trend analysis.
     */
    async getMonthlySummaries(userId: string, limit = 6): Promise<MonthlySummary[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('monthly_summaries')
            .select('*')
            .eq('user_id', userId)
            .order('month_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[InsightService] Fetch Summaries Error:', {
                message: error.message,
                code: error.code,
                hint: error.hint,
                details: error.details
            });
            return [];
        }

        return (data as MonthlySummaryRow[]).map(mapMonthlySummaryFromDb);
    }

    /**
     * Data aggregator for AI Briefing.
     */
    async getDailyBriefing(userId: string, userName: string): Promise<BriefingOutput | null> {
        const supabase = createClient();
        
        try {
            // 1. Fetch Wallets
            const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', userId);
            
            // 2. Fetch Current Month Summary
            const { data: summary } = await supabase.from('monthly_summaries').select('*').eq('user_id', userId).order('month_date', { ascending: false }).limit(1).single();
            
            // 3. Fetch Budgets
            const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', userId);
            
            // 4. Fetch Reminders
            const { data: reminders } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'upcoming').order('due_date', { ascending: true }).limit(3);

            // 5. Fetch Debts
            const { data: debts } = await supabase.from('debts').select('*').eq('user_id', userId).not('status', 'eq', 'settled');

            if (!wallets || !summary) return null;

            const activeDebts = debts || [];
            const nextDueDebt = activeDebts
                .filter(d => d.due_date)
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

            return await generateDailyBriefing({
                userName,
                totalBalance: wallets.reduce((acc, w) => acc + Number(w.balance), 0),
                monthlyIncome: Number(summary.total_income),
                monthlyExpense: Number(summary.total_expense),
                wallets: wallets.map(w => ({ name: w.name, balance: Number(w.balance) })),
                budgets: (budgets || []).map(b => ({
                    name: b.name,
                    limit: Number(b.amount),
                    spent: Number(b.spent),
                    remaining: Number(b.amount) - Number(b.spent)
                })),
                reminders: (reminders || []).map(r => ({
                    title: r.title,
                    amount: Number(r.amount),
                    dueDate: r.due_date || 'N/A'
                })),
                debts: {
                    totalOwed: activeDebts.filter(d => d.direction === 'owed').reduce((acc, d) => acc + Number(d.outstanding_balance), 0),
                    totalOwing: activeDebts.filter(d => d.direction === 'owing').reduce((acc, d) => acc + Number(d.outstanding_balance), 0),
                    nextDue: nextDueDebt ? {
                        title: nextDueDebt.title,
                        amount: Number(nextDueDebt.outstanding_balance),
                        dueDate: nextDueDebt.due_date,
                        direction: nextDueDebt.direction
                    } : undefined
                }
            });
        } catch (error) {
            console.error('[InsightService] Briefing Error:', error);
            return null;
        }
    }
}

export const insightService = new InsightService();
