import { createClient } from '@/lib/supabase/client';
import { SIDEBAR_PRIMARY_NAV_ITEMS } from '@/lib/sidebar-config';
import { financialContextService } from './financial-context-service';

export interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    type: 'nav' | 'transaction' | 'goal' | 'debt' | 'wallet' | 'action';
    href?: string;
    icon?: string;
    amount?: number;
    metadata?: any;
}

class SearchService {
    private get supabase() {
        return createClient();
    }

    async search(userId: string, query: string): Promise<SearchResult[]> {
        if (!query || query.length < 2) {
            return this.getSuggestedResults();
        }

        const normalizedQuery = query.toLowerCase().trim();

        const [transactions, goals, debts, wallets] = await Promise.all([
            this.searchTransactions(userId, normalizedQuery),
            this.searchGoals(userId, normalizedQuery),
            this.searchDebts(userId, normalizedQuery),
            this.searchWallets(userId, normalizedQuery),
        ]);

        const navMatches = this.searchNav(normalizedQuery);
        const actionMatches = this.searchActions(normalizedQuery);

        return [
            ...navMatches,
            ...actionMatches,
            ...transactions,
            ...goals,
            ...debts,
            ...wallets,
        ].slice(0, 15);
    }

    private getSuggestedResults(): SearchResult[] {
        // Return top-level navigation and common actions when query is empty
        const topNav = SIDEBAR_PRIMARY_NAV_ITEMS.slice(0, 4).map(item => ({
            id: `nav-${item.id}`,
            title: item.name,
            type: 'nav' as const,
            href: item.href,
            subtitle: 'Navigasi',
        }));

        const commonActions: SearchResult[] = [
            {
                id: 'action-add-tx',
                title: 'Catat Transaksi',
                type: 'action',
                subtitle: 'Aset & Pengeluaran',
                metadata: { action: 'openUniversalAdd' }
            },
            {
                id: 'action-add-goal',
                title: 'Buat Target Baru',
                type: 'action',
                subtitle: 'Perencanaan',
                metadata: { action: 'openGoalModal' }
            }
        ];

        return [...topNav, ...commonActions];
    }

    private searchNav(query: string): SearchResult[] {
        return SIDEBAR_PRIMARY_NAV_ITEMS
            .filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.shortName?.toLowerCase().includes(query)
            )
            .map(item => ({
                id: `nav-${item.id}`,
                title: item.name,
                type: 'nav',
                href: item.href,
                subtitle: 'Navigasi',
            }));
    }

    private searchActions(query: string): SearchResult[] {
        const actions: SearchResult[] = [
            {
                id: 'action-add-tx',
                title: 'Catat Transaksi / Pengeluaran',
                type: 'action',
                subtitle: 'Aksi Cepat',
                metadata: { action: 'openUniversalAdd' }
            },
            {
                id: 'action-add-goal',
                title: 'Tambah Target / Goal',
                type: 'action',
                subtitle: 'Aksi Cepat',
                metadata: { action: 'openGoalModal' }
            },
            {
                id: 'action-add-debt',
                title: 'Catat Hutang / Piutang',
                type: 'action',
                subtitle: 'Aksi Cepat',
                metadata: { action: 'openDebtModal' }
            }
        ];

        return actions.filter(a => a.title.toLowerCase().includes(query));
    }

    private async searchTransactions(userId: string, query: string): Promise<SearchResult[]> {
        const results = await financialContextService.findTransactionsByQuery(userId, query, undefined, 5);
        return results.map(t => ({
            id: `tx-${t.id}`,
            title: t.description,
            subtitle: `${t.category} • ${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
            type: 'transaction',
            amount: t.amount,
            metadata: { type: t.type, id: t.id }
        }));
    }

    private async searchGoals(userId: string, query: string): Promise<SearchResult[]> {
        const { data, error } = await this.supabase
            .from('goals')
            .select('id, name, target_amount, current_amount')
            .eq('user_id', userId)
            .ilike('name', `%${query}%`)
            .limit(3);

        if (error || !data) return [];

        return data.map(g => ({
            id: `goal-${g.id}`,
            title: g.name,
            subtitle: `Target: Rp ${(g.target_amount / 1000000).toFixed(1)}jt`,
            type: 'goal',
            amount: g.current_amount,
            href: `/plan?tab=goals&id=${g.id}`
        }));
    }

    private async searchDebts(userId: string, query: string): Promise<SearchResult[]> {
        const { data, error } = await this.supabase
            .from('debts')
            .select('id, title, counterparty, principal, direction')
            .eq('user_id', userId)
            .or(`title.ilike.%${query}%,counterparty.ilike.%${query}%`)
            .limit(3);

        if (error || !data) return [];

        return data.map(d => ({
            id: `debt-${d.id}`,
            title: d.title,
            subtitle: `${d.counterparty} • ${d.direction === 'owed' ? 'Saya Hutang' : 'Piutang'}`,
            type: 'debt',
            amount: d.principal,
            href: `/plan?tab=debts&id=${d.id}`
        }));
    }

    private async searchWallets(userId: string, query: string): Promise<SearchResult[]> {
        const { data, error } = await this.supabase
            .from('wallets')
            .select('id, name, balance')
            .eq('user_id', userId)
            .ilike('name', `%${query}%`)
            .limit(3);

        if (error || !data) return [];

        return data.map(w => ({
            id: `wallet-${w.id}`,
            title: w.name,
            subtitle: 'Dompet',
            type: 'wallet',
            amount: w.balance,
            href: '/wallets'
        }));
    }
}

export const searchService = new SearchService();
