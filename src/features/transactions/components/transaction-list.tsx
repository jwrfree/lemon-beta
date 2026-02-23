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
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card rounded-card-premium shadow-card relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="p-6 bg-primary/10 rounded-card-glass mb-6 relative z-10 shadow-inner">
                    <ReceiptText className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tighter mb-2 relative z-10">Kosong Melompong</h2>
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-8 max-w-[240px] leading-relaxed relative z-10">
                    Semua catatan pengeluaran dan pemasukan kamu akan muncul secara cerdas di sini.
                </p>
                <Button 
                    onClick={() => router.push('/add-smart')} 
                    className="rounded-full h-12 px-8 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all relative z-10"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Mulai Catat
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
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 px-4">
                            {formatRelativeDate(parseISO(date))}
                        </h3>
                        <div className="bg-card rounded-card shadow-sm border border-border/40 overflow-hidden divide-y divide-border/30">
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
