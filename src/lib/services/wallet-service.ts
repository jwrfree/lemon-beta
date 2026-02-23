import { createClient } from '@/lib/supabase/client';
import type { Wallet, WalletInput, WalletRow } from '@/types/models';

export const mapWalletFromDb = (w: WalletRow): Wallet => ({
    id: w.id,
    name: w.name,
    balance: w.balance,
    icon: w.icon,
    color: w.color,
    isDefault: w.is_default,
    userId: w.user_id,
    createdAt: w.created_at
});

export const walletService = {
    async getWallets(userId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapWalletFromDb);
    },

    async addWallet(userId: string, walletData: WalletInput): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('wallets').insert({
            name: walletData.name,
            balance: walletData.balance || 0,
            icon: walletData.icon,
            color: walletData.color,
            is_default: walletData.isDefault || false,
            user_id: userId
        });
        if (error) throw error;
    },

    async updateWallet(userId: string, walletId: string, walletData: Partial<Wallet>): Promise<void> {
        const supabase = createClient();

        if (walletData.isDefault === true) {
            const { error: unsetError } = await supabase
                .from('wallets')
                .update({ is_default: false })
                .eq('user_id', userId);
            if (unsetError) throw unsetError;
        }

        const { isDefault, ...rest } = walletData;
        const updateData: Record<string, unknown> = { ...rest };
        if (isDefault !== undefined) updateData.is_default = isDefault;

        const { error } = await supabase.from('wallets').update(updateData).eq('id', walletId);
        if (error) throw error;
    },

    async deleteWallet(userId: string, walletId: string): Promise<{ blocked: string | null }> {
        const supabase = createClient();

        const { count: txCount, error: txError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('wallet_id', walletId);

        if (txError) throw txError;

        if (txCount && txCount > 0) {
            return { blocked: 'Gagal menghapus: Dompet masih memiliki riwayat transaksi.' };
        }

        const { count: paymentCount, error: paymentError } = await supabase
            .from('debt_payments')
            .select('*', { count: 'exact', head: true })
            .eq('wallet_id', walletId);

        if (!paymentError && paymentCount && paymentCount > 0) {
            return { blocked: 'Dompet tidak bisa dihapus karena terkait dengan pembayaran hutang.' };
        }

        const { error } = await supabase
            .from('wallets')
            .delete()
            .eq('id', walletId)
            .eq('user_id', userId);

        if (error) throw error;
        return { blocked: null };
    },

    async reconcileWallet(userId: string, walletId: string, currentBalance: number, targetBalance: number): Promise<void> {
        const difference = targetBalance - currentBalance;
        if (difference === 0) return;

        const supabase = createClient();
        const type = difference > 0 ? 'income' : 'expense';
        const absAmount = Math.abs(difference);

        const { error } = await supabase.rpc('create_transaction_v1', {
            p_user_id: userId,
            p_wallet_id: walletId,
            p_amount: absAmount,
            p_category: 'Penyesuaian Saldo',
            p_sub_category: 'Koreksi',
            p_date: new Date().toISOString(),
            p_description: `Koreksi Saldo (Target: ${targetBalance})`,
            p_type: type,
            p_is_need: false
        });

        if (error) throw error;
    }
};

