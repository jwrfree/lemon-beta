'use client';
import { useMemo } from 'react';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CircleNotch, Receipt } from '@phosphor-icons/react';
import type { Transaction } from '@/types/models';
import { useWallets } from '@/features/wallets';
import { useUI } from '@/components/ui-provider';
import { useCategories, groupTransactionsByDate } from '@/features/transactions';
import { DesktopTransactionTable } from './desktop-transaction-table';
import { EmptyState } from '@/components/empty-state';

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
                <DesktopTransactionTable transactions={finalTransactions} wallets={wallets} />
            </div>

            {/* Mobile List View (Grouped) */}
            <div className="md:hidden space-y-6">
                {groupedTransactions.map(([date, transactionsForDay]: [string, Transaction[]]) => (
                    <div key={date} className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-5 mb-2">
                            {formatRelativeDate(parseISO(date))}
                        </h3>
                        <div className="overflow-hidden rounded-3xl bg-card shadow-soft border border-border/40">
                            {transactionsForDay.map((transaction: Transaction, index: number) => (
                                <TransactionListItem
                                    key={transaction.id}
                                    transaction={{ ...transaction, showDivider: index !== transactionsForDay.length - 1 } as any}
                                    wallets={wallets}
                                    getCategoryVisuals={getCategoryVisuals}
                                    hideDate
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && loadMore && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="w-full rounded-full bg-card/90 shadow-button md:w-auto md:px-6 text-muted-foreground hover:bg-card hover:text-primary transition-all"
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
