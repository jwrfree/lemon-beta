import { createClient } from '@/lib/supabase/client';
import type { SpendingRisk, MonthlySummary, MonthlySummaryRow } from '@/types/models';

const supabase = createClient();

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

class InsightService {
    /**
     * Get current month's risk score and insights.
     */
    async getSpendingRisk(userId: string): Promise<SpendingRisk | null> {
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

        return {
            level: data.level,
            score: data.score,
            burnRate: Number(data.burn_rate),
            velocity: Number(data.velocity),
            insight: data.insight
        };
    }

    /**
     * Get monthly summaries for trend analysis.
     */
    async getMonthlySummaries(userId: string, limit = 6): Promise<MonthlySummary[]> {
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
}

export const insightService = new InsightService();
