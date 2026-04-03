'use client';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CircleNotch, Receipt } from '@/lib/icons';
import type { Transaction } from '@/types/models';
import { useWallets } from '@/features/wallets';
import { useUI } from '@/components/ui-provider';
import { useCategories, groupTransactionsByDate } from '@/features/transactions';
import { EmptyState } from '@/components/empty-state';
import { TransactionListDesktop } from './transaction-list-desktop';
import { TransactionListMobile } from './transaction-list-mobile';

interface TransactionListProps {
    transactions?: Transaction[];
    limit?: number;
    walletId?: string;
    hasMore?: boolean;
    loadMore?: () => void;
    isLoading?: boolean;
}

export const TransactionList = ({ transactions, limit, walletId, hasMore, loadMore, isLoading }: TransactionListProps) => {
    const { wallets } = useWallets();
    const { getCategoryVisuals } = useCategories();
    const { openTransactionSheet } = useUI();

    const finalTransactions = useMemo(() => {
        if (!transactions) return [];
        return limit ? transactions.slice(0, limit) : transactions;
    }, [transactions, limit]);

    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(finalTransactions);
    }, [finalTransactions]);

    if (finalTransactions.length === 0 && !isLoading) {
        return (
            <EmptyState
                title="Kosong Melompong"
                description="Semua catatan pengeluaran dan pemasukan kamu akan muncul secara cerdas di sini."
                actionLabel="Mulai Catat"
                onAction={() => openTransactionSheet()}
                icon={Receipt}
                className="pt-10"
            />
        );
    }

    return (
        <div
            className="space-y-6 motion-list-transition"
            data-loading={isLoading ? 'true' : undefined}
            style={isLoading ? { minHeight: '240px' } : undefined}
        >
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <TransactionListDesktop transactions={finalTransactions} wallets={wallets} />
            </div>

            {/* Mobile List View (Grouped) */}
            <div className="md:hidden">
                <TransactionListMobile
                    groupedTransactions={groupedTransactions}
                    wallets={wallets}
                    getCategoryVisuals={getCategoryVisuals}
                />
            </div>

            {hasMore && loadMore && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="w-full rounded-full bg-card/90 shadow-sm md:w-auto md:px-6 text-muted-foreground hover:bg-card hover:text-primary transition-all"
                    >
                        {isLoading ? (
                            <>
                                <CircleNotch size={16} weight="regular" className="mr-2 animate-spin" />
                                Memuat...
                            </>
                        ) : (
                            'Muat Lebih Banyak'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};


