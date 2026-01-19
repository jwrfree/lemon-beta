'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Bell, ArrowUpRight, ArrowDownLeft, BellPlus, HandCoins, CalendarClock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInCalendarDays, formatDistanceToNow, isSameMonth, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { AnimatedCounter } from '@/components/animated-counter';
import type { Reminder, Debt } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { DesktopDashboard } from '@/features/home/components/desktop-dashboard';
import { AIInsightCard } from '@/features/home/components/ai-insight-card';
import { HomeSkeleton } from '@/features/home/components/home-skeleton';
import { QuickAddWidget } from '@/features/home/components/quick-add-widget';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { PullToRefresh } from '@/components/pull-to-refresh';

export default function HomePage() {
    const { wallets, transactions, isLoading: isDataLoading } = useData();
    const { debts, isLoading: isDebtLoading } = useDebts();
    const { reminders, isLoading: isReminderLoading } = useReminders();
    const { setIsReminderModalOpen, setReminderToEdit, setIsDebtModalOpen, setDebtToEdit } = useUI();
    const { userData } = useApp();
    const router = useRouter();

    const isLoading = isDataLoading || isDebtLoading || isReminderLoading;

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    const now = new Date();
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
        .reduce((acc, t) => acc + t.amount, 0);
    
    // ... existing useMemo hooks ...

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

    const timeBasedGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

    const userDisplayName = useMemo(() => {
        if (!userData?.displayName) return '';
        // Get first name only for cleaner UI
        return userData.displayName.split(' ')[0];
    }, [userData]);

    if (isLoading) {
        return <HomeSkeleton />;
    }

    return (
        <>
            <div className="hidden md:block h-full">
                <DesktopDashboard />
            </div>

            <div className="md:hidden bg-muted min-h-full flex flex-col">
                <PullToRefresh onRefresh={async () => {
                    // Simple refresh simulation
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }}>
                    <motion.header 
                        className="h-16 px-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-lg z-20 border-b shrink-0"
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <motion.div 
                            className="flex flex-col justify-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-lg font-bold text-primary flex items-center gap-1">
                                Lemon <span className="text-xs font-normal text-muted-foreground px-1.5 py-0.5 rounded-full bg-primary/10">Beta</span>
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {timeBasedGreeting}{userDisplayName ? `, ${userDisplayName}` : ''}
                            </p>
                        </motion.div>
                        <motion.div 
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <BalanceVisibilityToggle />
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/notifications')}
                                    aria-label="Buka notifikasi"
                                >
                                    <Bell className="h-6 w-6" strokeWidth={1.75} />
                                    <span className="sr-only">Buka notifikasi</span>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.header>
                    <main className="flex-1 p-4 space-y-6">
                    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-lg shadow-primary/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
                                <BalanceVisibilityToggle variant="ghost" size="icon" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            >
                                <AnimatedCounter value={totalBalance} className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" />
                            </motion.div>
                            <div className="flex gap-4 mt-4">
                                <motion.div 
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full">
                                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pemasukan</p>
                                        <AnimatedCounter value={monthlyIncome} className="text-sm font-semibold" />
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                                        <ArrowDownLeft className="h-4 w-4 text-destructive" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pengeluaran</p>
                                        <AnimatedCounter value={monthlyExpense} className="text-sm font-semibold" />
                                    </div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>

                    <QuickAddWidget />

                    <AIInsightCard transactions={transactions} wallets={wallets} />

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
                            <div className="flex gap-3 overflow-x-auto pb-2 wallet-scroll-container">
                                {wallets.slice(0, 5).map((wallet, index) => {
                                    const { Icon } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                                    return (
                                        <motion.div
                                            key={wallet.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <Card className="flex-shrink-0 w-48 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/30 shadow-lg shadow-primary/10 interactive-element">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon className={cn('h-6 w-6 text-muted-foreground')} />
                                                        <span className="text-sm font-medium truncate">{wallet.name}</span>
                                                    </div>
                                                    <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                                        {formatCurrency(wallet.balance)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
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
                        <Card className="p-4 space-y-3 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/30 shadow-lg shadow-primary/10">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                                    <p className="text-muted-foreground text-xs mb-1">Saya Berhutang</p>
                                    <p className="text-lg font-semibold text-destructive">{formatCurrency(debtSummary.owed)}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-right">
                                    <p className="text-muted-foreground text-xs mb-1">Orang Lain Berhutang</p>
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
                </PullToRefresh>
            </div>
        </>
    );
}
