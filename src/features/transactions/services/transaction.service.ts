import { createClient } from '@/lib/supabase/client';
import { Transaction, TransactionInput } from '@/types/models';
import { UnifiedTransactionFormValues } from '../schemas/transaction-schema';

// Standardized Result Pattern for Robust Error Handling
export type ServiceResult<T> = {
    data: T | null;
    error: string | null;
};

class TransactionService {
    private supabase = createClient();

    /**
     * Create a new transaction using the atomic RPC function.
     */
    async createTransaction(userId: string, data: UnifiedTransactionFormValues): Promise<ServiceResult<string>> {
        try {
            // Amount is already transformed to number by Zod schema
            const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount);

            if (data.type === 'transfer') {
                const { error } = await this.supabase.rpc('create_transfer_v1', {
                    p_user_id: userId,
                    p_from_wallet_id: data.fromWalletId,
                    p_to_wallet_id: data.toWalletId,
                    p_amount: amount,
                    p_date: data.date.toISOString(),
                    p_description: data.description,
                });

                if (error) {
                    console.error('[TransactionService] Transfer RPC Error:', error);
                    throw error;
                }
                return { data: 'Transfer successful', error: null };
            } else {
                const { data: result, error } = await this.supabase.rpc('create_transaction_v1', {
                    p_user_id: userId,
                    p_wallet_id: data.walletId,
                    p_amount: amount,
                    p_category: data.category,
                    p_sub_category: (data as any).subCategory || null,
                    p_date: data.date.toISOString(),
                    p_description: data.description,
                    p_type: data.type,
                    p_is_need: data.isNeed ?? true,
                });

                if (error) {
                    console.error('[TransactionService] Create RPC Error:', error);
                    throw error;
                }

                return { data: result?.id || 'Success', error: null };
            }
        } catch (err: any) {
            console.error('[TransactionService] Create Exception:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return {
                data: null,
                error: this.formatError(err)
            };
        }
    }

    /**
     * Update an existing transaction safely using atomic RPC.
     */
    async updateTransaction(
        userId: string,
        transactionId: string,
        data: UnifiedTransactionFormValues
    ): Promise<ServiceResult<boolean>> {
        try {
            if (data.type === 'transfer') {
                return { data: null, error: "Editing transfers is restricted. Please delete and recreate." };
            }

            // Amount is already transformed to number by Zod schema
            const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount);

            const { error } = await this.supabase.rpc('update_transaction_v1', {
                p_user_id: userId,
                p_transaction_id: transactionId,
                p_new_amount: amount,
                p_new_category: data.category,
                p_new_sub_category: (data as any).subCategory || null,
                p_new_date: data.date.toISOString(),
                p_new_description: data.description,
                p_new_type: data.type,
                p_new_wallet_id: (data as any).walletId,
                p_new_is_need: data.isNeed ?? true,
            });

            if (error) {
                // EXPLICIT LOGGING to catch the actual message
                console.error('[TransactionService] RPC Error Message:', error.message);
                console.error('[TransactionService] RPC Error Code:', error.code);
                console.error('[TransactionService] RPC Error Hint:', error.hint);
                console.error('[TransactionService] Full Error JSON:', JSON.stringify(error));
                throw error;
            }

            return { data: true, error: null };

        } catch (err: any) {
            console.error('[TransactionService] Caught Exception String:', String(err));
            if (err.message) console.error('[TransactionService] Exception Message:', err.message);
            return {
                data: null,
                error: this.formatError(err)
            };
        }
    }

    /**
     * Delete a transaction and revert wallet balance automatically (handled by RPC).
     */
    async deleteTransaction(userId: string, transactionId: string): Promise<ServiceResult<boolean>> {
        try {
            const { error } = await this.supabase.rpc('delete_transaction_v1', {
                p_transaction_id: transactionId,
                p_user_id: userId
            });

            if (error) throw error;
            return { data: true, error: null };
        } catch (err: any) {
            console.error('[TransactionService] Delete Error:', err);
            return {
                data: null,
                error: this.formatError(err)
            };
        }
    }

    /**
     * Get monthly statistics for a category (last 3 months).
     * Used for budget recommendations.
     */
    async getCategoryMonthlyStats(userId: string, category: string, subCategory?: string): Promise<ServiceResult<{ avg: number; max: number }>> {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setDate(1); // Start from the first day
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            let query = this.supabase
                .from('transactions') // Table name is plural 'transactions'
                .select('amount, date')
                .eq('user_id', userId)
                .eq('category', category)
                .eq('type', 'expense')
                .gte('date', threeMonthsAgo.toISOString());

            if (subCategory) {
                query = query.eq('sub_category', subCategory);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length === 0) {
                return { data: { avg: 0, max: 0 }, error: null };
            }

            const monthlyTotals: Record<string, number> = {};

            data.forEach((t: any) => {
                const monthKey = t.date.substring(0, 7); // YYYY-MM
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
            });

            const months = Object.keys(monthlyTotals).length;
            const values = Object.values(monthlyTotals);
            const total = values.reduce((a, b) => a + b, 0);
            const max = Math.max(...values, 0);
            const avg = months > 0 ? total / months : 0;

            return { data: { avg, max }, error: null };
        } catch (err: any) {
            console.error('[TransactionService] Stats Error:', err);
            return {
                data: null,
                error: this.formatError(err),
            };
        }
    }

    /**
     * Helper to format database errors into user-friendly messages.
     */
    private formatError(err: any): string {
        const msg = err.message || JSON.stringify(err);
        if (msg.includes('violates row-level security')) return 'Akses ditolak. Anda tidak memiliki izin.';
        if (msg.includes('Saldo tidak mencukupi')) return 'Saldo dompet tidak mencukupi untuk perubahan ini.';
        return 'Terjadi kesalahan sistem. Silakan coba lagi.';
    }
}

export const transactionService = new TransactionService();
