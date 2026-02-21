'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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
    Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { useUI } from '@/components/ui-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet, Transaction, Reminder, Debt } from '@/types/models';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { SpendingTrendChart } from './spending-trend-chart';
import { RiskScoreCard } from '@/features/insights/components/risk-score-card';

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
    const {
        setIsTxModalOpen,
        setTransactionToEdit,
        setIsTransferModalOpen,
        setIsDebtModalOpen,
        setDebtToEdit,
        setIsSmartAddOpen,
        isSmartAddOpen
    } = useUI();

    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            color: 'text-warning',
            bg: 'bg-warning/10',
            onClick: () => setIsSmartAddOpen(true)
        },
        {
            label: 'Manual',
            icon: Plus,
            color: 'text-success',
            bg: 'bg-success/10',
            onClick: () => {
                setTransactionToEdit(null);
                setIsTxModalOpen(true);
            }
        },
        {
            label: 'Transfer',
            icon: ArrowRightLeft,
            color: 'text-info',
            bg: 'bg-info/10',
            onClick: () => setIsTransferModalOpen(true)
        },
        {
            label: 'Hutang',
            icon: HandCoins,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            onClick: () => {
                setDebtToEdit(null);
                setIsDebtModalOpen(true);
            }
        }
    ];

    if (isLoading) return null;

    return (
        <main className="flex-1 pb-24 space-y-6">
            {/* 1. Header Section */}
            <div className="px-5 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm cursor-pointer" onClick={() => router.push('/settings')}>
                        <AvatarImage src={userData?.photoURL} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {firstName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">{timeBasedGreeting},</span>
                            {currentTime && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md tabular-nums">
                                    {format(currentTime, 'HH:mm')}
                                </span>
                            )}
                        </div>
                        <h1 className="text-lg font-medium leading-tight tracking-tight">{firstName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.push('/search')}>
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative" onClick={() => router.push('/notifications')}>
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
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
                    <div className="relative overflow-hidden rounded-[32px] bg-teal-900 text-white shadow-[0_20px_50px_-12px_rgba(13,148,136,0.2)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-primary-foreground/10 blur-2xl"></div>

                        <div className="relative p-7 space-y-6">
                            {/* Balance Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em]">Total Saldo</span>
                                    <div className="bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5">
                                        <BalanceVisibilityToggle className="h-4 w-4 text-white/80 hover:text-white" variant="ghost" size="icon" />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-semibold tracking-tighter tabular-nums">
                                    <AnimatedCounter value={totalBalance} />
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="text-[11px] text-white/70 font-medium leading-relaxed max-w-[280px]">
                                        <Sparkles className="h-3 w-3 inline mr-1 opacity-70" />
                                        {expenseDiff > 0
                                            ? `Pengeluaranmu naik ${Math.abs(expenseDiff / (monthlyExpense - expenseDiff) * 100).toFixed(0)}% dari bulan lalu.`
                                            : 'Pengeluaranmu bulan ini lebih terkontrol. Kerja bagus!'}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-fit h-7 px-3 text-[9px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10"
                                        onClick={() => router.push('/charts')}
                                    >
                                        Analitik Detail
                                    </Button>
                                </div>
                            </div>

                            {/* Income/Expense Pill */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3.5 flex flex-col justify-between h-20 border border-white/5">
                                    <div className="flex items-center gap-1.5 text-white/80">
                                        <div className="p-1 rounded-full bg-white/10">
                                            <ArrowUpRight className="h-3 w-3" />
                                        </div>
                                        <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">Pemasukan</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyIncome} className="font-semibold text-sm tracking-tight text-white" />
                                        <p className="text-[10px] text-white/40 mt-0.5 font-medium tracking-tighter">
                                            {incomeDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(incomeDiff))}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3.5 flex flex-col justify-between h-20 border border-white/5">
                                    <div className="flex items-center gap-1.5 text-white/80">
                                        <div className="p-1 rounded-full bg-white/10">
                                            <ArrowDownLeft className="h-3 w-3" />
                                        </div>
                                        <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">Pengeluaran</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyExpense} className="font-semibold text-sm tracking-tight text-white" />
                                        <p className="text-[10px] text-white/40 mt-0.5 font-medium tracking-tighter">
                                            {expenseDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(expenseDiff))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 2.5 Risk Insight */}
            <div className="px-4">
                <RiskScoreCard />
            </div>

            {/* 3. Quick Actions Grid */}
            <div className="px-4">
                <div className="grid grid-cols-4 gap-4">
                    {menuActions.map((action, idx) => (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={cn("h-14 w-14 rounded-full flex items-center justify-center shadow-md border border-border/40 transition-all group-active:scale-90 bg-card", action.bg.replace('/10', '/5'))}>
                                <action.icon className={cn("h-6 w-6", action.color)} strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground/80 text-center leading-tight uppercase tracking-widest">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 4. Horizontal Wallets (Snap Scroll) */}
            <div className="space-y-3">
                <div className="px-6 flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                        <WalletIcon className="h-3 w-3" />
                        Dompet Kamu
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary px-0" onClick={() => router.push('/wallets')}>
                        Lihat Semua
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide">
                    {wallets.slice(0, 5).map((wallet, idx) => {
                        const { Icon, textColor, logo } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                        return (
                            <motion.div
                                key={wallet.id}
                                className="snap-center shrink-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="w-40 h-24 rounded-2xl bg-card border border-border/40 shadow-sm p-3.5 flex flex-col justify-between relative overflow-hidden group">
                                    <div className={cn("absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-5 bg-current", textColor)}></div>

                                    <div className="flex items-start justify-between relative z-10">
                                        <div className={cn("p-1.5 rounded-xl bg-muted flex items-center justify-center overflow-hidden h-7 w-7 shadow-inner", textColor)}>
                                            {logo ? (
                                                <>
                                                    <img
                                                        src={logo}
                                                        alt={wallet.name}
                                                        className="h-full w-full object-contain rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const icon = e.currentTarget.nextElementSibling;
                                                            if (icon) icon.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <Icon className="h-4 w-4 hidden" />
                                                </>
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                        </div>
                                        <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            {wallet.icon === 'e-wallet' ? 'E-Wallet' : wallet.icon === 'bank' ? 'Bank' : wallet.icon || 'Cash'}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight truncate mb-0.5">{wallet.name}</p>
                                        <p className="text-sm font-semibold text-foreground truncate tracking-tighter tabular-nums">
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    <div className="snap-center shrink-0">
                        <button
                            onClick={() => router.push('/wallets')}
                            className="w-12 h-24 rounded-2xl border border-dashed border-border/60 flex items-center justify-center hover:bg-muted/50 transition-colors"
                        >
                            <Plus className="h-5 w-5 text-muted-foreground/40" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Spending Trend */}
            <SpendingTrendChart transactions={transactions} days={14} />

            {/* 6. Recent Transactions */}
            <div className="space-y-3 px-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Aktivitas Terakhir
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary px-0" onClick={() => router.push('/transactions')}>
                        Lihat Semua
                    </Button>
                </div>

                <div className="border-none shadow-none bg-transparent pb-10">
                    <TransactionList
                        transactions={transactions}
                        limit={2}
                        isLoading={false}
                    />
                </div>
            </div>
        </main>
    );
};
