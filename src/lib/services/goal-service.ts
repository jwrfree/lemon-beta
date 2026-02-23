import { createClient } from '@/lib/supabase/client';
import type { Goal, GoalInput, GoalRow } from '@/types/models';

export const mapGoalFromDb = (g: GoalRow): Goal => ({
    id: g.id,
    name: g.name,
    targetAmount: g.target_amount,
    currentAmount: g.current_amount,
    targetDate: g.target_date,
    icon: g.icon,
    userId: g.user_id,
    createdAt: g.created_at
});

export const goalService = {
    async getGoals(userId: string): Promise<Goal[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('target_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapGoalFromDb);
    },

    async addGoal(userId: string, goalData: GoalInput): Promise<Goal> {
        const supabase = createClient();
        const { data, error } = await supabase.from('goals').insert({
            name: goalData.name,
            target_amount: goalData.targetAmount,
            current_amount: goalData.currentAmount || 0,
            target_date: goalData.targetDate,
            icon: goalData.icon,
            user_id: userId
        }).select().single();

        if (error) throw error;
        return mapGoalFromDb(data);
    },

    async updateGoal(goalId: string, goalData: Partial<Goal>): Promise<void> {
        const supabase = createClient();
        const dbPayload: Partial<GoalRow> = {};
        if (goalData.name) dbPayload.name = goalData.name;
        if (goalData.targetAmount !== undefined) dbPayload.target_amount = goalData.targetAmount;
        if (goalData.currentAmount !== undefined) dbPayload.current_amount = goalData.currentAmount;
        if (goalData.targetDate) dbPayload.target_date = goalData.targetDate;
        if (goalData.icon) dbPayload.icon = goalData.icon;

        const { error } = await supabase.from('goals').update(dbPayload).eq('id', goalId);
        if (error) throw error;
    },

    async deleteGoal(goalId: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('goals').delete().eq('id', goalId);
        if (error) throw error;
    }
};
