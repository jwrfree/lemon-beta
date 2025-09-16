
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { TransactionListItem } from '@/components/transaction-list-item';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';


export default function TransactionsPage() {
    const { wallets, transactions, openDeleteModal, handleEdit } = useApp();
    const router = useRouter();

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-16">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <h1 className="text-xl font-bold">Ringkasan</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/notifications')}>
                        <Bell className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
                        <Settings className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4">
                <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Dompet Anda</h2>
                        <Button onClick={() => router.push('/wallets')} variant="link" size="sm">Lihat Semua</Button>
                    </div>
                    {wallets.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Anda belum memiliki dompet.</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {wallets.slice(0, 2).map(wallet => {
                                const { Icon, color } = getWalletVisuals(wallet.icon);
                                return (
                                    <div key={wallet.id} className={cn("p-4 rounded-lg text-white", color)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Icon className="h-6 w-6" />
                                            <span className="text-xs font-medium opacity-80">{wallet.name}</span>
                                        </div>
                                        <p className="text-xl font-bold">{formatCurrency(wallet.balance)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
                        <Button variant="link" size="sm" onClick={() => router.push('/transactions/all')}>Lihat Semua</Button>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="text-muted-foreground text-sm text-center py-8">Tidak ada transaksi.</div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.slice(0, 5).map(t => (
                                <TransactionListItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={openDeleteModal} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

