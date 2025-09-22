
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Bell, ArrowUpRight, ArrowDownLeft, BellPlus, HandCoins, CalendarClock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/components/transaction-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInCalendarDays, formatDistanceToNow, isSameMonth, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { AnimatedCounter } from '@/components/animated-counter';
import type { Reminder, Debt } from '@/types/models';

export default function HomePage() {
    const { wallets, transactions, reminders, debts } = useApp();
    const { setIsReminderModalOpen, setReminderToEdit, setIsDebtModalOpen, setDebtToEdit } = useUI();
    const router = useRouter();

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    const now = new Date();
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);

    const upcomingReminders = useMemo(() => {
        const nowDate = new Date();
        return reminders
            .filter((reminder: Reminder) => {
                if (reminder.status === 'completed' || !reminder.dueDate) return false;
                const due = parseISO(reminder.dueDate);
                const days = differenceInCalendarDays(due, nowDate);
                return days >= -1 && days <= 7;
            })
            .sort((a, b) => {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            })
            .slice(0, 3);
    }, [reminders]);

    const debtSummary = useMemo(() => {
        let owed = 0;
        let owing = 0;
        debts.forEach((debt: Debt) => {
            const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
            if (debt.status === 'settled' || outstanding <= 0) return;
            if (debt.direction === 'owed') {
                owed += outstanding;
            } else {
                owing += outstanding;
            }
        });
        return { owed, owing };
    }, [debts]);

    const nextDueDebt = useMemo(() => {
        return debts
            .filter((debt: Debt) => debt.dueDate && debt.status !== 'settled')
            .sort((a: Debt, b: Debt) => {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            })[0];
    }, [debts]);

    return (
        <>
            <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-background z-20 border-b">
                <h1 className="text-2xl font-bold text-primary">Lemon</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/notifications')}
                        aria-label="Buka notifikasi"
                    >
                        <Bell className="h-6 w-6" strokeWidth={1.75} />
                        <span className="sr-only">Buka notifikasi</span>
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

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={() => {
                            setReminderToEdit(null);
                            setIsReminderModalOpen(true);
                        }}
                    >
                        <BellPlus className="h-5 w-5 text-primary" />
                        Pengingat Baru
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={() => {
                            setDebtToEdit(null);
                            setIsDebtModalOpen(true);
                        }}
                    >
                        <HandCoins className="h-5 w-5 text-primary" />
                        Catatan Hutang
                    </Button>
                </div>

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
                                const { Icon } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                                return (
                                    <Card key={wallet.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className={cn('h-6 w-6 text-muted-foreground')} />
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
                        <h2 className="text-lg font-semibold">Pengingat Terdekat</h2>
                        <Button variant="link" size="sm" onClick={() => router.push('/reminders')}>
                            Lihat Semua
                        </Button>
                    </div>
                    {upcomingReminders.length === 0 ? (
                        <Card className="p-4 text-sm text-muted-foreground">
                            Tidak ada pengingat dalam 7 hari ke depan.
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {upcomingReminders.map(reminder => {
                                const due = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                return (
                                    <Card key={reminder.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{reminder.title}</p>
                                            {due && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarClock className="h-4 w-4" />
                                                    {formatDistanceToNow(due, { addSuffix: true, locale: dateFnsLocaleId })}
                                                </p>
                                            )}
                                        </div>
                                        {reminder.amount ? (
                                            <span className="text-sm font-semibold">{formatCurrency(reminder.amount)}</span>
                                        ) : null}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Ringkasan Hutang & Piutang</h2>
                        <Button variant="link" size="sm" onClick={() => router.push('/debts')}>
                            Lihat Semua
                        </Button>
                    </div>
                    <Card className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Saya Berhutang</p>
                                <p className="text-lg font-semibold text-destructive">{formatCurrency(debtSummary.owed)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground">Orang Lain Berhutang</p>
                                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(debtSummary.owing)}</p>
                            </div>
                        </div>
                        {nextDueDebt ? (
                          <div className="text-xs text-muted-foreground">
                              Selanjutnya: {nextDueDebt.title} jatuh tempo {formatDistanceToNow(parseISO(nextDueDebt.dueDate as string), { addSuffix: true, locale: dateFnsLocaleId })}
                          </div>
                        ) : (
                            <div className="text-xs text-muted-foreground">Tidak ada jatuh tempo yang mendesak.</div>
                        )}
                    </Card>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">5 transaksi terakhir</h2>
                        <Button variant="link" size="sm" onClick={() => router.push('/transactions')}>
                            Lihat Semua
                        </Button>
                    </div>
                    <TransactionList limit={5} />
                </div>
            </main>
        </>
    );
}
