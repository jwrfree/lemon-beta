
'use client';
import { useApp } from '@/components/app-provider';
import { TransactionListItem } from './transaction-list-item';
import { Skeleton } from './ui/skeleton';
import { formatRelativeDate } from '@/lib/utils';
import { parseISO } from 'date-fns';

export const TransactionList = ({ limit }: { limit?: number }) => {
    const { transactions, handleEdit, openDeleteModal, isLoading } = useApp();

    const transactionsToShow = limit ? transactions.slice(0, limit) : transactions;

    const groupedTransactions = transactionsToShow.reduce((acc, t) => {
        const date = parseISO(t.date).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(t);
        return acc;
    }, {} as Record<string, any[]>);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(limit || 5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                ))}
            </div>
        )
    }

    if (transactions.length === 0) {
        return <div className="text-muted-foreground text-sm text-center py-8">Tidak ada transaksi.</div>;
    }

    if (limit) {
        return (
            <div className="space-y-2">
                {transactionsToShow.map(t => (
                    <TransactionListItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={openDeleteModal} />
                ))}
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
                        {transactionsForDay.map(t => (
                            <TransactionListItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={openDeleteModal} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
