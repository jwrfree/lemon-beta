'use client';
import React, { useMemo } from 'react';
import { TransactionListItem } from './transaction-list-item';
import { cn, formatCurrency, formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ReceiptText, MapPin, Wallet as WalletIcon, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types/models';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { DesktopTransactionTable } from './desktop-transaction-table';
import { groupTransactionsByDate } from '@/features/transactions/utils';

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
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                <div className="p-4 bg-primary/10 rounded-full mb-4 animate-in zoom-in duration-300">
                    <ReceiptText className="h-8 w-8 text-primary/80" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-medium tracking-tight">Belum Ada Transaksi</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-[300px]">
                    Semua catatan pengeluaran dan pemasukan kamu akan muncul di sini.
                </p>
                <Button onClick={() => router.push('/add-smart')} className="active:scale-95 transition-transform shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4" strokeWidth={2} />
                    Catat Transaksi Pertama
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DesktopTransactionTable transactions={finalTransactions} wallets={wallets} />
            </div>

            {/* Mobile List View (Grouped) */}
            <div className="md:hidden space-y-6">
                {groupedTransactions.map(([date, transactionsForDay]: [string, Transaction[]]) => (
                    <div key={date} className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-4">
                            {formatRelativeDate(parseISO(date))}
                        </h3>
                        <div className="bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden divide-y divide-border/30">
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
                        className="w-full md:w-auto md:px-8 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
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
