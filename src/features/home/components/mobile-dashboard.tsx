'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Bell,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet as WalletIcon,
    TrendingUp,
    Plus,
    Sparkles,
    ArrowRightLeft,
    HandCoins,
    MoreHorizontal,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { useUI } from '@/components/ui-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet, Transaction, Reminder, Debt } from '@/types/models';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { SmartAddOverlay } from '@/features/transactions/components/smart-add-overlay';
import { SpendingTrendChart } from './spending-trend-chart';

interface MobileDashboardProps {
    userData: any;
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    incomeDiff: number;
    expenseDiff: number;
    wallets: Wallet[];
    transactions: Transaction[];
    reminders: Reminder[];
    debts: Debt[];
    isLoading: boolean;
}

export const MobileDashboard = ({
    userData,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    incomeDiff,
    expenseDiff,
    wallets,
    transactions,
    isLoading
}: MobileDashboardProps) => {
    const router = useRouter();
    const [showSmartAdd, setShowSmartAdd] = React.useState(false);
    const {
        setIsTxModalOpen,
        setTransactionToEdit,
        setIsTransferModalOpen,
        setIsDebtModalOpen,
        setDebtToEdit
    } = useUI();

    const timeBasedGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Selamat Malam';
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

    const firstName = userData?.displayName?.split(' ')[0] || 'User';

    // Menu Actions Configuration
    const menuActions = [
        {
            label: 'Catat Cepat',
            icon: Sparkles,
            color: 'text-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-900/40',
            onClick: () => setShowSmartAdd(true)
        },
        {
            label: 'Manual',
            icon: Plus,
            color: 'text-teal-600',
            bg: 'bg-teal-100 dark:bg-teal-900/40',
            onClick: () => {
                setTransactionToEdit(null);
                setIsTxModalOpen(true);
            }
        },
        {
            label: 'Transfer',
            icon: ArrowRightLeft,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            onClick: () => setIsTransferModalOpen(true)
        },
        {
            label: 'Hutang',
            icon: HandCoins,
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-900/40',
            onClick: () => {
                setDebtToEdit(null);
                setIsDebtModalOpen(true);
            }
        }
    ];

    if (isLoading) return null; // Parent handles skeleton currently

    return (
        <main className="flex-1 pb-24 space-y-6">
            {/* 1. Header Section */}
            <div className="px-5 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm cursor-pointer" onClick={() => router.push('/settings')}>
                        <AvatarImage src={userData?.photoURL} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {firstName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium">{timeBasedGreeting},</span>
                        <h1 className="text-lg font-bold leading-tight">{firstName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.push('/search')}>
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative" onClick={() => router.push('/notifications')}>
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-background"></span>
                    </Button>
                </div>
            </div>

            {/* 2. Hero Card (Gradient) */}
            <div className="px-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 text-white shadow-xl shadow-teal-900/20">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl"></div>

                        <div className="relative p-6 space-y-6">
                            {/* Balance Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-teal-100 text-sm font-medium">Total Saldo</span>
                                    <div className="bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5">
                                        <BalanceVisibilityToggle className="h-4 w-4 text-teal-100 hover:text-white" variant="ghost" size="icon" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold tracking-tight">
                                    <AnimatedCounter value={totalBalance} />
                                </div>
                            </div>

                            {/* Income/Expense Pill */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-between h-20">
                                    <div className="flex items-center gap-1.5 text-teal-200">
                                        <div className="p-1 rounded-full bg-teal-500/20">
                                            <ArrowUpRight className="h-3 w-3" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Pemasukan</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyIncome} className="font-semibold text-sm" />
                                        <p className="text-[10px] text-teal-200/70 mt-0.5">
                                            {incomeDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(incomeDiff))}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-between h-20">
                                    <div className="flex items-center gap-1.5 text-rose-200">
                                        <div className="p-1 rounded-full bg-rose-500/20">
                                            <ArrowDownLeft className="h-3 w-3" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Pengeluaran</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyExpense} className="font-semibold text-sm" />
                                        <p className="text-[10px] text-rose-200/70 mt-0.5">
                                            {expenseDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(expenseDiff))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3. Quick Actions Grid */}
            <div className="px-4">
                <div className="grid grid-cols-4 gap-4">
                    {menuActions.map((action, idx) => (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm border border-border/50", action.bg)}>
                                <action.icon className={cn("h-6 w-6", action.color)} strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 4. Horizontal Wallets (Snap Scroll) */}
            <div className="space-y-3">
                <div className="px-5 flex items-center justify-between">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <WalletIcon className="h-4 w-4 text-primary" />
                        Dompet Kamu
                    </h2>
                    <Button size="sm" className="h-8 text-xs hover:bg-transparent hover:text-primary px-0" onClick={() => router.push('/wallets')}>
                        Lihat Semua
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide">
                    {wallets.slice(0, 5).map((wallet, idx) => {
                        const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                        return (
                            <motion.div
                                key={wallet.id}
                                className="snap-center shrink-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="w-40 h-24 rounded-2xl bg-card border border-border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-3 flex flex-col justify-between relative overflow-hidden group">
                                    {/* Subtle background decoration */}
                                    <div className={cn("absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 bg-current", textColor)}></div>

                                    <div className="flex items-start justify-between relative z-10">
                                        <div className={cn("p-1.5 rounded-lg bg-muted", textColor)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{wallet.type || 'Cash'}</span>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-xs font-medium text-muted-foreground truncate mb-0.5">{wallet.name}</p>
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Add Wallet Placehoder */}
                    <div className="snap-center shrink-0">
                        <button
                            onClick={() => router.push('/wallets')}
                            className="w-12 h-24 rounded-2xl border border-dashed border-muted-foreground/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                        >
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Spending Trend (14 Days) */}
            <SpendingTrendChart transactions={transactions} days={14} />

            {/* 6. Recent Transactions */}
            <div className="space-y-3 px-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Aktivitas Terakhir
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-transparent hover:text-primary px-0" onClick={() => router.push('/transactions')}>
                        Lihat Semua
                    </Button>
                </div>

                <Card className="border-none shadow-none bg-transparent">
                    <TransactionList
                        transactions={transactions}
                        limit={4}
                        isLoading={false}
                    />
                </Card>
            </div>

            <SmartAddOverlay isOpen={showSmartAdd} onClose={() => setShowSmartAdd(false)} />
        </main>
    );
};
