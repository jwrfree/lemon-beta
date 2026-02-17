import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';

const supabase = createClient();

export const mapTransactionFromDb = (t: TransactionRow): Transaction => ({
    id: t.id,
    amount: t.amount,
    category: t.category,
    date: t.date,
    description: t.description,
    type: t.type,
    walletId: t.wallet_id,
    userId: t.user_id,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    subCategory: t.sub_category || undefined,
    location: t.location || undefined,
    isNeed: t.is_need
});

export const transactionService = {
    async getTransactions(userId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapTransactionFromDb);
    },

    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    }
};
