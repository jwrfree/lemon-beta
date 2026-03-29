'use client';
import React, { useMemo } from 'react';
import { TransactionListItem } from './transaction-list-item';
import { cn, formatCurrency, formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceiptText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types/models';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useUI } from '@/components/ui-provider';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { DesktopTransactionTable } from './desktop-transaction-table';
import { groupTransactionsByDate } from '@/features/transactions/utils';
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
    const router = useRouter();

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
        icon={ReceiptText}
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
                        <h3 className="text-label text-muted-foreground/60 px-4">
                            {formatRelativeDate(parseISO(date))}
                        </h3>
                        <div className="bg-card rounded-card border border-border/40 overflow-hidden">
                            {transactionsForDay.map((transaction: Transaction) => (
                                <TransactionListItem 
                                    key={transaction.id} 
                                    transaction={transaction} 
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
                        variant="outline" 
                        onClick={loadMore} 
                        disabled={isLoading}
                        className="w-full md:w-auto md:px-6 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
