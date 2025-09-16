
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { TransactionList } from '@/components/transaction-list';

export default function AllTransactionsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Semua Transaksi</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-2 pb-16">
                <TransactionList />
            </main>
        </div>
    );
}
