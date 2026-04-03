import { createClient } from '@/lib/supabase/client';
import type { Budget, BudgetInput, BudgetRow } from '@/types/models';

export const mapBudgetFromDb = (budget: BudgetRow): Budget => ({
    id: budget.id,
    name: budget.name,
    targetAmount: budget.amount,
    spent: budget.spent,
    categories: budget.category ? [budget.category] : [],
    subCategory: budget.sub_category || undefined,
    period: budget.period,
    userId: budget.user_id,
    createdAt: budget.created_at,
});

export const budgetService = {
    async getBudgets(userId: string): Promise<Budget[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []).map(mapBudgetFromDb);
    },

    async addBudget(userId: string, budgetData: BudgetInput): Promise<Budget> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('budgets')
            .insert({
                name: budgetData.name,
                amount: budgetData.targetAmount,
                spent: 0,
                category: budgetData.categories?.[0] || '',
                sub_category: budgetData.subCategory || null,
                period: budgetData.period,
                user_id: userId,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return mapBudgetFromDb(data as BudgetRow);
    },

    async updateBudget(budgetId: string, budgetData: Partial<Budget>): Promise<void> {
        const supabase = createClient();
        const updateData: Partial<BudgetRow> = {};

        if (budgetData.name) updateData.name = budgetData.name;
        if (budgetData.targetAmount !== undefined) updateData.amount = budgetData.targetAmount;
        if (budgetData.categories !== undefined) updateData.category = budgetData.categories[0];
        if (budgetData.subCategory !== undefined) updateData.sub_category = budgetData.subCategory || null;
        if (budgetData.period) updateData.period = budgetData.period;

        const { error } = await supabase.from('budgets').update(updateData).eq('id', budgetId);

        if (error) {
            throw error;
        }
    },

    async deleteBudget(budgetId: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('budgets').delete().eq('id', budgetId);

        if (error) {
            throw error;
        }
    },
};
