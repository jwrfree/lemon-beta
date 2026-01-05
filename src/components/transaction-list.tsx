
'use client';
import { useMemo } from 'react';
import { useData } from '@/hooks/use-data';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Button } from './ui/button';
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
            <div className="flex flex-col h-full items-center justify-center text-center p-8">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <ReceiptText className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold">Belum Ada Transaksi</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Semua transaksimu akan muncul di sini setelah kamu mencatatnya.</p>
                <Button onClick={() => router.push('/add-smart')}>
                    <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                    Tambah Transaksi
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
