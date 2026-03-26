import { createClient } from '@/lib/supabase/client';

export interface UnifiedFinancialContext {
    wealth: {
        cash: number;
        assets: number;
        liabilities: number;
        net_worth: number;
    };
    budgets: {
        name: string;
        limit: number;
        spent: number;
        percent: number;
    }[];
    goals: {
        name: string;
        target: number;
        current: number;
        percent: number;
    }[];
    risk: {
        level: 'Low' | 'Moderate' | 'Critical';
        score: number;
        burn_rate: number;
        velocity: number;
        balance: number;
        survival_days: number;
    };
    monthly: {
        income: number;
        expense: number;
        cashflow: number;
        velocity: number;
    };
    top_categories: {
        category: string;
        amount: number;
    }[];
    timestamp: string;
}

class FinancialContextService {
    async getUnifiedContext(userId: string): Promise<UnifiedFinancialContext | null> {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_unified_context', {
            p_user_id: userId
        });

        if (error) {
            console.error('[FinancialContextService] Error:', error);
            return null;
        }

        return data as UnifiedFinancialContext;
    }
}

export const financialContextService = new FinancialContextService();
