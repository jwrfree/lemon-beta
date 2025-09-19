
'use client';
import { useApp } from '@/components/app-provider';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { parseISO } from 'date-fns';

export const TransactionList = ({ transactions: transactionsToShow, limit, walletId }: { transactions?: any[], limit?: number, walletId?: string }) => {
    const { transactions: allTransactions, openDeleteModal, openEditModal, isLoading } = useApp();

    let finalTransactions = transactionsToShow;

    if (!finalTransactions) {
      finalTransactions = walletId 
        ? allTransactions.filter(t => t.walletId === walletId) 
        : allTransactions;

      if (limit) {
        finalTransactions = finalTransactions.slice(0, limit);
      }
    }
    
    const groupedTransactions = (finalTransactions || []).reduce((acc, t) => {
        const dateKey = parseISO(t.date).toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(t);
        return acc;
    }, {} as Record<string, any[]>);

    if (isLoading) {
        return null;
    }

    if (!finalTransactions || finalTransactions.length === 0) {
        return <div className="text-muted-foreground text-sm text-center py-8">Belum ada transaksi di sini.</div>;
    }
    
    return (
        <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, transactionsForDay]) => (
                <div key={date}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                        {formatRelativeDate(parseISO(date))}
                    </h3>
                    <div className="space-y-2">
                        {transactionsForDay.map((t) => (
                           <TransactionListItem key={t.id} transaction={t} onDelete={openDeleteModal} onEdit={openEditModal} hideDate={true} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
