'use client';

import React from 'react';
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
    Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { useUI } from '@/components/ui-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet, Transaction, Reminder, Debt } from '@/types/models';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { SpendingTrendChart } from './spending-trend-chart';
import { RiskScoreCard } from '@/features/insights/components/risk-score-card';
import { OnboardingChecklist } from '@/components/onboarding-checklist';
import { AiBriefingCard } from '@/features/insights/components/ai-briefing-card';

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
        openTransactionSheet,
        setIsTransferModalOpen,
        setIsDebtModalOpen,
        setDebtToEdit,
        setIsAIChatOpen,
    } = useUI();

    const firstName = userData?.displayName?.split(' ')[0] || 'User';

    // Menu Actions Configuration
    const menuActions = [
        {
            label: 'Catat Cepat',
            icon: Sparkles,
            color: 'text-warning',
            bg: 'bg-warning/10',
            onClick: () => openTransactionSheet()
        },
        {
            label: 'Manual',
            icon: Plus,
            color: 'text-success',
            bg: 'bg-success/10',
            onClick: () => openTransactionSheet(null, 'manual')
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
        <AppPageShell className="gap-6 bg-background pb-6">
            <AppPageHeaderChrome width="full" className="z-20">
                <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-9 w-9 rounded-full border border-border/30 bg-card p-0 shadow-none transition-all active:scale-95 overflow-hidden"
                    >
                        <Avatar className="h-full w-full cursor-pointer" onClick={() => router.push('/settings')}>
                            <AvatarImage src={userData?.photoURL} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {firstName[0]}
                            </AvatarFallback>
                        </Avatar>
                    </Button>

                    <div className="min-w-0">
                        <h1 className="truncate text-left text-base font-semibold tracking-tight text-foreground">
                            Beranda
                        </h1>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full border border-border/30 bg-card text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                            onClick={() => router.push('/search')}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-full border border-primary/25 bg-primary/10 text-primary shadow-none hover:bg-primary/15"
                            onClick={() => setIsAIChatOpen(true)}
                        >
                            <Sparkles className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-full border border-border/30 bg-card text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                            onClick={() => router.push('/notifications')}
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                        </Button>
                    </div>
                </div>
            </AppPageHeaderChrome>

            <div className="px-4">
                <OnboardingChecklist />
            </div>

            {/* 1.7 AI Briefing */}
            <AiBriefingCard />

            {/* 2. Hero Card (Apple Music Style Dynamic Mesh) */}
            <div className="px-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="relative overflow-hidden rounded-card-premium border border-white/10 bg-[#064e4b] text-white shadow-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />

                        <div className="relative space-y-5 p-5">
                            {/* Balance Section */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-white/50 text-label">Total Wealth</span>
                                    <div className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
                                        <BalanceVisibilityToggle className="h-4 w-4 text-white/80 hover:text-white" variant="ghost" size="icon" />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold tracking-tighter tabular-nums">
                                    <AnimatedCounter value={totalBalance} />
                                </div>
                                <div className="mt-4">
                                    <div className="w-fit max-w-[280px] rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold leading-relaxed text-white/70 backdrop-blur-sm">
                                        <Sparkles className="h-3 w-3 inline mr-2 text-yellow-300 fill-current" />
                                        {expenseDiff > 0
                                            ? `Pengeluaran naik ${Math.abs(expenseDiff / (monthlyExpense - expenseDiff) * 100).toFixed(0)}% bulan ini.`
                                            : 'Pengeluaran terkontrol. Kerja bagus!'}
                                    </div>
                                </div>
                            </div>

                            {/* Income/Expense Pill (Glassmorphism Inset) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex h-20 flex-col justify-between rounded-card-glass border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-300">
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-label">Inflow</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyIncome} className="text-sm font-semibold tracking-tight text-white" />
                                        <p className="mt-1 text-[10px] font-semibold text-white/40">
                                            {incomeDiff >= 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { notation: "compact" }).format(Math.abs(incomeDiff))} this month
                                        </p>
                                    </div>
                                </div>
                                <div className="flex h-20 flex-col justify-between rounded-card-glass border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <div className="p-1.5 rounded-md bg-rose-500/20 text-rose-300">
                                            <ArrowDownLeft className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-label">Outflow</span>
                                    </div>
                                    <div>
                                        <AnimatedCounter value={monthlyExpense} className="text-sm font-semibold tracking-tight text-white" />
                                        <p className="mt-1 text-[10px] font-semibold text-white/40">
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
                            <div className={cn("h-16 w-16 rounded-full flex items-center justify-center border border-border/40 transition-all group-active:shadow-inner bg-card", action.bg.replace('/10', '/5'))}>
                                <action.icon className={cn("h-7 w-7", action.color)} strokeWidth={1.5} />
                            </div>
                            <span className="text-label text-muted-foreground/60 text-center leading-tight">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 4. Horizontal Wallets (Snap Scroll - Dynamic Branded DNA) */}
            <div className="space-y-4">
                <div className="px-4 flex items-center justify-between">
                    <h2 className="text-label text-muted-foreground/40 flex items-center gap-2">
                        <WalletIcon className="h-3.5 w-3.5" />
                        Wallet Stack
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-label text-primary px-0 hover:bg-transparent" onClick={() => router.push('/wallets')}>
                        Manage
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto px-4 pb-6 snap-x snap-mandatory scrollbar-hide">
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
                                    className="w-44 h-32 rounded-card-premium p-4 flex flex-col justify-between relative overflow-hidden group border border-white/20 shadow-none transition-all duration-500"
                                    style={{ 
                                        background: dna.gradient,
                                    }}
                                >
                                    {/* Ambient Glow Ornament */}
                                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-40 bg-white/20"></div>
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-start justify-between relative z-10">
                                         <div className="p-2 rounded-card bg-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden h-9 w-9 border border-white/10">
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
                                        <span className="text-label text-white/40">
                                            {wallet.icon === 'e-wallet' ? 'E-Wallet' : wallet.icon === 'bank' ? 'Bank' : 'Cash'}
                                        </span>
                                    </div>

                                    <div className="relative z-10 space-y-1">
                                        <p className="text-label text-white/60 truncate">{wallet.name}</p>
                                        {/* Dynamic Contrast Protection for Balance */}
                                        <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5 w-fit">
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
                            className="w-44 h-32 rounded-card-premium border border-border/40 bg-card/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 hover:bg-muted/50 transition-all group relative overflow-hidden active:scale-95"
                        >
                            {/* Ambient Glow */}
                            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-20 bg-primary/30"></div>
                            
                            <div className="p-4 rounded-card-icon bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Plus className="h-6 w-6 text-primary" strokeWidth={2.5} />
                            </div>
                            <span className="text-label text-muted-foreground font-semibold uppercase tracking-widest">
                                Add Wallet
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Spending Trend */}
            <div className="px-4">
                <SpendingTrendChart transactions={transactions} days={14} />
            </div>

            {/* 6. Recent Transactions */}
            <div className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-label text-muted-foreground/40 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Mutasi Terbaru
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-label text-primary px-0" onClick={() => router.push('/transactions')}>
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
        </AppPageShell>
    );
};

