import { createClient } from '@/lib/supabase/client';
import type { Wallet, WalletRow } from '@/types/models';

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
    }
};
