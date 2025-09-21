
'use client';
import { useApp } from '@/components/app-provider';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Button } from './ui/button';
import { PlusCircle, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TransactionList = ({ transactions: transactionsToShow, limit, walletId }: { transactions?: any[], limit?: number, walletId?: string }) => {
    const { transactions: allTransactions } = useApp();
    const router = useRouter();

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
        const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(t);
        return acc;
    }, {} as Record<string, any[]>);

    if (!finalTransactions || finalTransactions.length === 0) {
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
                        {transactionsForDay.map((t) => (
                           <TransactionListItem key={t.id} transaction={t} hideDate={true} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
