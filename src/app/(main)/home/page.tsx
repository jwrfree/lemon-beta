'use client';

import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/ui-provider';
import { useAuth } from '@/providers/auth-provider';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { Button } from '@/components/ui/button';
import { Bell, ArrowUpRight, ArrowDownLeft, BellPlus, HandCoins, CalendarClock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInCalendarDays, formatDistanceToNow, isSameMonth, parseISO, subMonths, startOfMonth } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { AnimatedCounter } from '@/components/animated-counter';
import type { Reminder, Debt } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useHomeSummary } from '@/features/home/hooks/use-home-summary';
import dynamic from 'next/dynamic';
import { AIInsightCard } from '@/features/home/components/ai-insight-card';
import { HomeSkeleton } from '@/features/home/components/home-skeleton';

const DesktopDashboard = dynamic(() => import('@/features/home/components/desktop-dashboard').then(mod => mod.DesktopDashboard), {
    loading: () => <HomeSkeleton />,
    ssr: false
});
const MobileDashboard = dynamic(() => import('@/features/home/components/mobile-dashboard').then(mod => mod.MobileDashboard), {
    loading: () => <HomeSkeleton />,
    ssr: false
});
import { QuickAddWidget } from '@/features/home/components/quick-add-widget';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { config } from '@/lib/config';
import { PageHeader } from '@/components/page-header';

export default function HomePage() {
    const homeUi = config.ui?.home;
    const walletPreviewLimit = homeUi?.walletPreviewLimit ?? 5;
    const remindersPastDays = homeUi?.upcomingRemindersPastDays ?? 1;
    const remindersForwardDays = homeUi?.upcomingRemindersForwardDays ?? 7;
    const recentTransactionsLimit = homeUi?.recentTransactionsLimit ?? 5;

    const { wallets, isLoading: isWalletsLoading } = useWallets();

    const now = useMemo(() => new Date(), []);
    const twoMonthsAgoStart = useMemo(() => startOfMonth(subMonths(now, 1)), [now]);
    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(twoMonthsAgoStart, now);

    const { debts, isLoading: isDebtLoading } = useDebts();
    const { reminders, isLoading: isReminderLoading } = useReminders();
    const { setIsReminderModalOpen, setReminderToEdit, setIsDebtModalOpen, setDebtToEdit } = useUI();
    const { userData } = useAuth();
    const router = useRouter();

    const { monthlyIncome, monthlyExpense, incomeDiff, expenseDiff } = useHomeSummary(transactions);

    const isLoading = isWalletsLoading || isTransactionsLoading || isDebtLoading || isReminderLoading;

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    const upcomingReminders = useMemo(() => {
        const nowDate = new Date();
        return reminders
            .filter((reminder: Reminder) => {
                if (reminder.status === 'completed' || !reminder.dueDate) return false;
                const due = parseISO(reminder.dueDate);
                const days = differenceInCalendarDays(due, nowDate);
                return days >= -remindersPastDays && days <= remindersForwardDays;
            })
            .sort((a, b) => {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            })
            .slice(0, 3);
    }, [reminders, remindersPastDays, remindersForwardDays]);

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

    // Check for debts due in 3 days and trigger local notification
    useEffect(() => {
        if (isDebtLoading || debts.length === 0) return;

        const checkDueDebts = () => {
            if (!('Notification' in window)) return;

            if (Notification.permission === 'granted') {
                const today = new Date();
                const dueDebts = debts.filter(d => {
                    if (!d.dueDate || d.status === 'settled') return false;
                    const diff = differenceInCalendarDays(parseISO(d.dueDate), today);
                    return diff === 3;
                });

                dueDebts.forEach(debt => {
                    const key = `notified-debt-${debt.id}-${today.toDateString()}`;
                    if (sessionStorage.getItem(key)) return;

                    new Notification('Pengingat Hutang', {
                        body: `Hutang "${debt.title}" jatuh tempo dalam 3 hari lagi.`,
                        icon: '/icons/icon-192x192.png',
                        tag: `debt-due-${debt.id}`
                    });
                    sessionStorage.setItem(key, 'true');
                });
            } else if (Notification.permission !== 'denied') {
                // Opsional: Minta izin jika belum ditolak, tapi sebaiknya via tombol settings
                // Notification.requestPermission();
            }
        };

        checkDueDebts();
    }, [debts, isDebtLoading]);

    if (isLoading) {
        return <HomeSkeleton />;
    }

    return (
        <>
            <div className="hidden md:block h-full">
                <DesktopDashboard />
            </div>

            <div className="md:hidden min-h-full flex flex-col bg-background">
                <PullToRefresh onRefresh={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }}>
                    <MobileDashboard
                        userData={userData}
                        totalBalance={totalBalance}
                        monthlyIncome={monthlyIncome}
                        monthlyExpense={monthlyExpense}
                        incomeDiff={incomeDiff}
                        expenseDiff={expenseDiff}
                        wallets={wallets}
                        transactions={transactions}
                        reminders={reminders}
                        debts={debts}
                        isLoading={isLoading}
                    />
                </PullToRefresh>
            </div>
        </>
    );
}
