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

import { getVisualDNA, extractBaseColor } from '@/lib/visual-dna';

// ... (interface MobileDashboardProps remains same)

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
        <main className="flex-1 pb-24 space-y-8">
            {/* 1. Header Section */}
            <div className="px-5 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-md cursor-pointer" onClick={() => router.push('/settings')}>
                        <AvatarImage src={userData?.photoURL} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {firstName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{timeBasedGreeting},</span>
                            {currentTime && (
                                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md tabular-nums">
                                    {format(currentTime, 'HH:mm')}
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold leading-tight tracking-tighter">{firstName}</h1>
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

            {/* 2. Hero Card (Apple Music Style Dynamic Mesh) */}
            <div className="px-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="relative overflow-hidden rounded-[32px] bg-[#064e4b] text-white shadow-[0_20px_50px_-12px_rgba(13,148,136,0.3)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]">
                        {/* Dynamic Mesh Ornaments */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-[80px] animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-teal-300/10 blur-[80px]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-gradient-to-br from-transparent via-black/5 to-black/20"></div>

                        <div className="relative p-8 space-y-8">
                            {/* Balance Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white/50 text-[10px] uppercase font-semibold tracking-[0.3em]">Total Wealth</span>
                                    <div className="bg-white/10 backdrop-blur-xl rounded-full px-2 py-0.5 border border-white/10 shadow-inner">
                                        <BalanceVisibilityToggle className="h-4 w-4 text-white/80 hover:text-white" variant="ghost" size="icon" />
                                    </div>
                                </div>
                                <div className="text-5xl font-semibold tracking-tighter tabular-nums drop-shadow-sm">
                                    <AnimatedCounter value={totalBalance} />
                                </div>
                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="text-[11px] text-white/70 font-semibold leading-relaxed max-w-[280px] bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                                        <Sparkles className="h-3 w-3 inline mr-2 text-yellow-300 fill-current" />
                                        {expenseDiff > 0
                                            ? `Pengeluaran naik ${Math.abs(expenseDiff / (monthlyExpense - expenseDiff) * 100).toFixed(0)}% bulan ini.`
                                            : 'Pengeluaran terkontrol. Kerja bagus!'}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-fit h-8 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 transition-all active:scale-95"
                                        onClick={() => router.push('/charts')}
                                    >
                                        Financial Pulse
                                    </Button>
                                </div>
                            </div>

                            {/* Income/Expense Pill (Glassmorphism Inset) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-4 flex flex-col justify-between h-24 border border-white/10 shadow-inner group">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-[9px] uppercase font-semibold tracking-widest">Inflow</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyIncome} className="font-semibold text-base tracking-tight text-white" />
                                        <p className="text-[9px] text-white/30 mt-1 font-semibold uppercase tracking-tighter">
                                            {incomeDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(incomeDiff))} this month
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-4 flex flex-col justify-between h-24 border border-white/10 shadow-inner group">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300">
                                            <ArrowDownLeft className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-[9px] uppercase font-semibold tracking-widest">Outflow</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyExpense} className="font-semibold text-base tracking-tight text-white" />
                                        <p className="text-[9px] text-white/30 mt-1 font-semibold uppercase tracking-tighter">
                                            {expenseDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(expenseDiff))} this month
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
                            whileTap={{ scale: 0.9 }}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className={cn("h-16 w-16 rounded-full flex items-center justify-center shadow-lg border border-border/40 transition-all group-active:shadow-inner bg-card", action.bg.replace('/10', '/5'))}>
                                <action.icon className={cn("h-7 w-7", action.color)} strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-semibold text-muted-foreground/60 text-center leading-tight uppercase tracking-widest">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 4. Horizontal Wallets (Snap Scroll - Dynamic Branded DNA) */}
            <div className="space-y-4">
                <div className="px-6 flex items-center justify-between">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                        <WalletIcon className="h-3.5 w-3.5" />
                        Wallet Stack
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary px-0 hover:bg-transparent" onClick={() => router.push('/wallets')}>
                        Manage
                    </Button>
                </div>

                <div className="flex gap-5 overflow-x-auto px-6 pb-6 snap-x snap-mandatory scrollbar-hide">
                    {wallets.slice(0, 5).map((wallet, idx) => {
                        const { Icon, logo, textColor } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                        const dna = getVisualDNA(extractBaseColor(textColor));
                        
                        return (
                            <motion.div
                                key={wallet.id}
                                className="snap-center shrink-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => router.push(`/wallets?id=${wallet.id}`)}
                            >
                                <div 
                                    className="w-44 h-32 rounded-[28px] p-4 flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-500"
                                    style={{ 
                                        background: dna.gradient,
                                        boxShadow: `0 20px 40px -12px ${dna.ambient.replace('0.2', '0.4')}` 
                                    }}
                                >
                                    {/* Ambient Glow Ornament */}
                                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-40 bg-white/20"></div>
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden h-9 w-9 shadow-inner border border-white/10">
                                            {logo ? (
                                                <img
                                                    src={logo}
                                                    alt={wallet.name}
                                                    className="h-full w-full object-contain rounded-full bg-white/90 p-0.5"
                                                />
                                            ) : (
                                                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <span className="text-[8px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                                            {wallet.icon === 'e-wallet' ? 'E-Wallet' : wallet.icon === 'bank' ? 'Bank' : 'Cash'}
                                        </span>
                                    </div>

                                    <div className="relative z-10 space-y-1">
                                        <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest truncate">{wallet.name}</p>
                                        {/* Dynamic Contrast Protection for Balance */}
                                        <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/5 w-fit">
                                            <p className="text-sm font-semibold text-white truncate tracking-tighter tabular-nums">
                                                {formatCurrency(wallet.balance)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    <div className="snap-center shrink-0">
                        <button
                            onClick={() => router.push('/wallets')}
                            className="w-16 h-32 rounded-[28px] border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all group"
                        >
                            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Spending Trend */}
            <div className="px-2">
                <SpendingTrendChart transactions={transactions} days={14} />
            </div>

            {/* 6. Recent Transactions */}
            <div className="space-y-4 px-6 pb-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Recent Flux
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary px-0" onClick={() => router.push('/transactions')}>
                        Feed
                    </Button>
                </div>

                <div className="border-none shadow-none bg-transparent">
                    <TransactionList
                        transactions={transactions}
                        limit={3}
                        isLoading={false}
                    />
                </div>
            </div>
        </main>
    );
};

