'use client';
import React, { useMemo } from 'react';
import { TransactionListItem } from './transaction-list-item';
import { cn, formatCurrency, formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ReceiptText, MapPin, Wallet as WalletIcon, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types/models';
import { useData } from '@/hooks/use-data';

interface TransactionListProps {
    transactions?: Transaction[];
    limit?: number;
    walletId?: string;
    hasMore?: boolean;
    loadMore?: () => void;
    isLoading?: boolean;
}

export const TransactionList = ({ transactions: transactionsToShow, limit, walletId, hasMore, loadMore, isLoading }: TransactionListProps) => {
    const { transactions: allTransactions, wallets, getCategoryVisuals } = useData();
    const router = useRouter();

    const finalTransactions = useMemo(() => {
        if (transactionsToShow) {
            return transactionsToShow;
        }

        const baseTransactions = walletId
            ? allTransactions.filter(transaction => transaction.walletId === walletId)
            : allTransactions;

        return limit ? baseTransactions.slice(0, limit) : baseTransactions;
    }, [transactionsToShow, walletId, allTransactions, limit]);

    if (finalTransactions.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed rounded-xl bg-muted/30">
                <div className="p-4 bg-primary/10 rounded-full mb-4 animate-in zoom-in duration-300">
                    <ReceiptText className="h-8 w-8 text-primary/80" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Belum Ada Transaksi</h2>
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
            <div className="hidden md:block overflow-hidden rounded-xl border bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="p-4">Deskripsi</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Dompet</th>
                            <th className="p-4">Tanggal</th>
                            <th className="p-4 text-right">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card/30">
                        {finalTransactions.map((t) => {
                            const cat = getCategoryVisuals(t.category);
                            const CatIcon = cat.icon;
                            const wallet = wallets.find(w => w.id === t.walletId);
                            const isExpense = t.type === 'expense';

                            return (
                                <tr key={t.id} className="hover:bg-primary/[0.02] transition-colors group cursor-pointer" onClick={() => router.push('/transactions')}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2.5 rounded-xl shadow-sm", cat.bgColor)}>
                                                <CatIcon className={cn("h-4.5 w-4.5", cat.color)} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{t.description}</div>
                                                {t.location && (
                                                    <div className="flex items-center text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                                                        <MapPin className="h-2.5 w-2.5 mr-1" /> {t.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-tighter bg-muted/50 text-muted-foreground border-none px-2 py-0">
                                            {t.category}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-xs font-medium text-muted-foreground/80">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2" />
                                            {wallet?.name || 'Tunai'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-medium text-muted-foreground/60 whitespace-nowrap">
                                        {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                    </td>
                                    <td className={cn(
                                        "p-4 text-right font-extrabold text-sm",
                                        isExpense ? "text-destructive" : "text-success"
                                    )}>
                                        <span className="opacity-70 mr-0.5">{isExpense ? '-' : '+'}</span>
                                        {formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View (Grouped) */}
            <div className="md:hidden space-y-4">
                {Object.entries(finalTransactions.reduce<Record<string, Transaction[]>>((acc, t) => {
                    const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(t);
                    return acc;
                }, {})).map(([date, transactionsForDay]) => (
                    <div key={date}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                            {formatRelativeDate(parseISO(date))}
                        </h3>
                        <div className="space-y-2">
                            {transactionsForDay.map(transaction => (
                                <TransactionListItem key={transaction.id} transaction={transaction} hideDate />
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
                        {isLoading ? 'Memuat...' : 'Muat Lebih Banyak'}
                    </Button>
                </div>
            )}
        </div>
    );
};