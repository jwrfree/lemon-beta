
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { TransactionListItem } from '@/components/transaction-list-item';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function TransactionsPage() {
    const { transactions, handleEdit, openDeleteModal } = useApp();
    const router = useRouter();

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.push('/')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Semua Transaksi</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-2 pb-16">
                {transactions.length === 0 ? (
                    <div className="text-muted-foreground text-sm text-center py-8">Tidak ada transaksi.</div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(t => (
                            <TransactionListItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={openDeleteModal} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
