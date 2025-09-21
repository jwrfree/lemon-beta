
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Bell, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/components/transaction-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSameMonth, parseISO } from 'date-fns';
import { AnimatedCounter } from '@/components/animated-counter';

export default function HomePage() {
    const { wallets, transactions, isLoading } = useApp();
    const router = useRouter();

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    const now = new Date();
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);
    
    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);

    if (isLoading) {
        return null;
    }

    return (
        <div className="overflow-y-auto pb-16 bg-muted">
            <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-background z-20 border-b">
                <h1 className="text-2xl font-bold text-primary">Lemon</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/notifications')}>
                        <Bell className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <AnimatedCounter value={totalBalance} className="text-3xl font-bold" />
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full">
                                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pemasukan</p>
                                    <AnimatedCounter value={monthlyIncome} className="text-sm font-semibold" />
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                                    <ArrowDownLeft className="h-4 w-4 text-destructive" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pengeluaran</p>
                                    <AnimatedCounter value={monthlyExpense} className="text-sm font-semibold" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Dompet Kamu</h2>
                        <Button onClick={() => router.push('/wallets')} variant="link" size="sm">Lihat Semua</Button>
                    </div>
                    {wallets.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Kamu belum punya dompet.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {wallets.slice(0, 3).map(wallet => {
                                const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon);
                                return (
                                    <Card key={wallet.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className={cn("h-6 w-6 text-muted-foreground")} />
                                                <span className="text-sm font-medium">{wallet.name}</span>
                                            </div>
                                            <p className="text-xl font-bold">{formatCurrency(wallet.balance)}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
                        <Button variant="link" size="sm" onClick={() => router.push('/transactions')}>Lihat Semua</Button>
                    </div>
                   <TransactionList limit={5} />
                </div>
            </main>
        </div>
    );
};

