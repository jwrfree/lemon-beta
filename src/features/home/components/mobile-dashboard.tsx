'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
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
    Search,
    ReceiptText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { useUI } from '@/components/ui-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet, Transaction, Reminder, Debt } from '@/types/models';
import { SpendingTrendChart } from './spending-trend-chart';
import { RiskScoreCard } from '@/features/insights/components/risk-score-card';
import { OnboardingChecklist } from '@/components/onboarding-checklist';
import { AiBriefingCard } from '@/features/insights/components/ai-briefing-card';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { getMerchantVisuals } from '@/lib/merchant-utils';

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

const formatTransactionStamp = (date: string) => {
    const parsed = parseISO(date);

    if (isToday(parsed)) {
        return format(parsed, 'HH:mm');
    }

    if (isYesterday(parsed)) {
        return 'Kemarin';
    }

    return format(parsed, 'd MMM');
};

const MobileRecentTransactionRow = ({
    transaction,
    wallets,
    onOpen,
}: {
    transaction: Transaction;
    wallets: Wallet[];
    onOpen: (transaction: Transaction) => void;
}) => {
    const wallet = wallets.find((item) => item.id === transaction.walletId);
    const category = categoryDetails(transaction.category);
    const merchantVisuals = getMerchantVisuals(transaction.merchant || transaction.description);
    const Icon = merchantVisuals?.icon || getCategoryIcon(category.icon);
    const iconColor = merchantVisuals?.color || category.color;
    const iconBg = merchantVisuals?.bgColor || category.bg_color;
    const title = transaction.description || transaction.merchant || transaction.category;
    const amountTone =
        transaction.type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-foreground';

    return (
        <button
            type="button"
            onClick={() => onOpen(transaction)}
            className="flex w-full items-center gap-3 rounded-[24px] bg-card px-3.5 py-3 text-left shadow-[0_18px_32px_-26px_rgba(15,23,42,0.2)] transition-transform active:scale-[0.985]"
        >
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]', iconBg)}>
                <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {title}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/55">
                    <span className="truncate">{transaction.category}</span>
                    {wallet?.name ? (
                        <>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                            <span className="truncate">{wallet.name}</span>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="shrink-0 text-right">
                <div className={cn('text-sm font-semibold tracking-tight tabular-nums', amountTone)}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                </div>
                <div className="mt-1 text-[11px] font-medium text-muted-foreground/45">
                    {formatTransactionStamp(transaction.date)}
                </div>
            </div>
        </button>
    );
};

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
    const recentTransactions = [...transactions]
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
        .slice(0, 4);

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
        <AppPageShell className="bg-background">
            <AppPageHeaderChrome width="full" className="z-20">
                <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
                    <div className="min-w-0">
                        <h1 className="truncate text-left text-base font-semibold tracking-tight text-foreground">
                            Beranda
                        </h1>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-white dark:bg-slate-900 text-muted-foreground shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)] hover:bg-muted hover:text-foreground"
                            onClick={() => router.push('/search')}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-full bg-primary/10 text-primary shadow-[0_10px_22px_-18px_rgba(13,148,136,0.2)] hover:bg-primary/15"
                            onClick={() => setIsAIChatOpen(true)}
                        >
                            <Sparkles className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-full bg-white dark:bg-slate-900 text-muted-foreground shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)] hover:bg-muted hover:text-foreground"
                            onClick={() => router.push('/notifications')}
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                        </Button>
                    </div>
                </div>
            </AppPageHeaderChrome>

            <AppPageBody width="full" className="space-y-6 px-0 py-0 pb-6">
                <section className="px-4">
                    <OnboardingChecklist />
                </section>

                <section className="px-4">
                    <AiBriefingCard />
                </section>

                <section className="px-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="relative overflow-hidden rounded-card-premium bg-[#064e4b] text-white shadow-[0_24px_48px_-32px_rgba(13,148,136,0.42)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />

                            <div className="relative space-y-5 p-5">
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-white/50 text-label font-semibold uppercase tracking-widest">Total Kekayaan</span>
                                        <div className="rounded-full bg-white/10 px-2 py-0.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.2)]">
                                            <BalanceVisibilityToggle className="h-4 w-4 text-white/80 hover:text-white" variant="ghost" size="icon" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-semibold tracking-tighter tabular-nums">
                                        <AnimatedCounter value={totalBalance} />
                                    </div>
                                    <div className="mt-4">
                                        <div className="w-fit max-w-[280px] rounded-full bg-white/6 px-3 py-1.5 text-xs font-semibold leading-relaxed text-white/70 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                                            {expenseDiff > 0
                                                ? `Pengeluaran naik ${Math.abs(expenseDiff / (monthlyExpense - expenseDiff) * 100).toFixed(0)}% bulan ini.`
                                                : 'Pengeluaran terkontrol. Kerja bagus!'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                        <div className="flex h-20 flex-col justify-between rounded-card-glass bg-white/6 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <span className="text-label font-semibold uppercase tracking-widest">Pemasukan</span>
                                            </div>
                                            <div>
                                                <AnimatedCounter value={monthlyIncome} className="text-sm font-semibold tracking-tight text-white" />
                                                <p className="mt-1 text-[10px] font-semibold text-white/40">
                                                    {incomeDiff >= 0 ? '+' : ''}
                                                    {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(Math.abs(incomeDiff))} bulan ini
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex h-20 flex-col justify-between rounded-card-glass bg-white/6 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <span className="text-label font-semibold uppercase tracking-widest">Pengeluaran</span>
                                            </div>
                                            <div>
                                                <AnimatedCounter value={monthlyExpense} className="text-sm font-semibold tracking-tight text-white" />
                                                <p className="mt-1 text-[10px] font-semibold text-white/40">
                                                    {expenseDiff >= 0 ? '+' : ''}
                                                    {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(Math.abs(expenseDiff))} bulan ini
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="px-4">
                    <RiskScoreCard />
                </section>

                <section className="px-4">
                    <div className="grid grid-cols-4 gap-4">
                        {menuActions.map((action, idx) => (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.9 }}
                                onClick={action.onClick}
                                className="group flex flex-col items-center gap-3"
                            >
                                <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-card/96 transition-all shadow-[0_14px_28px_-22px_rgba(15,23,42,0.18)] group-active:shadow-inner", action.bg.replace('/10', '/5'))}>
                                    <action.icon className={cn("h-7 w-7", action.color)} strokeWidth={1.5} />
                                </div>
                                <span className="text-center text-label leading-tight text-muted-foreground/60">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-label font-semibold uppercase tracking-widest text-muted-foreground/50">
                            Daftar Dompet
                        </h2>
                        <Button variant="ghost" size="sm" className="h-8 px-0 text-label text-primary hover:bg-transparent" onClick={() => router.push('/wallets')}>
                            Kelola
                        </Button>
                    </div>

                    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
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
                                        className="group relative flex h-32 w-44 flex-col justify-between overflow-hidden rounded-card-premium p-4 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.22)] transition-all duration-500"
                                        style={{ background: dna.gradient }}
                                    >
                                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 opacity-40 blur-2xl" />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-card bg-white/10 p-2 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                                                {logo ? (
                                                    <img
                                                        src={logo}
                                                        alt={wallet.name}
                                                        className="h-full w-full rounded-full bg-white/90 object-contain p-0.5"
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
                                            <p className="truncate text-label text-white/60">{wallet.name}</p>
                                            <div className="w-fit rounded-md bg-white/10 px-2 py-1 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                                                <p className="truncate text-sm font-semibold tracking-tighter text-white tabular-nums">
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
                                className="group relative flex h-32 w-44 flex-col items-center justify-center gap-3 overflow-hidden rounded-card-premium bg-card/60 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all hover:bg-muted/50 active:scale-95"
                            >
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/30 opacity-20 blur-2xl" />
                                <div className="rounded-card-icon bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                                    <Plus className="h-6 w-6 text-primary" strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                    Tambah Dompet
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="px-4">
                    <SpendingTrendChart transactions={transactions} days={14} />
                </section>

                <section className="space-y-4 px-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-label font-semibold uppercase tracking-widest text-muted-foreground/50">
                            Mutasi Terbaru
                        </h2>
                        <Button variant="ghost" size="sm" className="h-8 px-0 text-label text-primary" onClick={() => router.push('/transactions')}>
                            Semua
                        </Button>
                    </div>

                    <div className="space-y-2 rounded-[30px] bg-muted/45 p-2.5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.16)]">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                                <MobileRecentTransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    wallets={wallets}
                                    onOpen={openTransactionSheet}
                                />
                            ))
                        ) : (
                            <button
                                type="button"
                                onClick={() => openTransactionSheet()}
                                className="flex w-full items-center gap-3 rounded-[24px] bg-card px-4 py-4 text-left shadow-[0_18px_32px_-26px_rgba(15,23,42,0.2)] transition-transform active:scale-[0.985]"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-primary/10 text-primary shadow-[0_10px_24px_-20px_rgba(13,148,136,0.22)]">
                                    <ReceiptText className="h-5 w-5" strokeWidth={2.1} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold tracking-tight text-foreground">
                                        Belum ada mutasi
                                    </div>
                                    <div className="mt-1 text-[11px] font-medium text-muted-foreground/55">
                                        Catat transaksi pertama supaya arus uang mulai terbaca.
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </section>
            </AppPageBody>
        </AppPageShell>
    );
};

