'use client';
import React, { useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types/models';

interface TransactionListProps {
    transactions?: Transaction[];
    limit?: number;
    walletId?: string;
}

export const TransactionList = ({ transactions: transactionsToShow, limit, walletId }: TransactionListProps) => {
    const { transactions: allTransactions } = useData();
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

    const groupedTransactions = useMemo(() => {
        return finalTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
            const dateKey = format(parseISO(transaction.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(transaction);
            return acc;
        }, {});
    }, [finalTransactions]);

    if (finalTransactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                <div className="p-4 bg-primary/10 rounded-full mb-4 animate-in zoom-in duration-300">
                    <ReceiptText className="h-8 w-8 text-primary/80" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Belum Ada Transaksi</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-[250px]">
                    Mulai catat pengeluaranmu hari ini untuk keuangan yang lebih baik.
                </p>
                <Button onClick={() => router.push('/add-smart')} className="active:scale-95 transition-transform">
                    <PlusCircle className="mr-2 h-4 w-4" strokeWidth={2} />
                    Catat Transaksi
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, transactionsForDay]) => (
                <div key={date}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
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
    );
};
