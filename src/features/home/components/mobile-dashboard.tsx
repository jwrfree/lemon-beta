'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    type Icon as PhosphorIcon,
    Bell,
    Plus,
    Sparkle,
    ArrowsLeftRight,
    HandCoins,
    Receipt,
} from '@/lib/icons';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { useUI } from '@/components/ui-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet, Transaction, Reminder, Debt } from '@/types/models';
import { SpendingTrendChart } from './spending-trend-chart';
import { RiskScoreCard } from '@/features/insights';
import { OnboardingChecklist } from '@/components/onboarding-checklist';
import { AiBriefingCard } from '@/features/insights';
import { TransactionListItem, useCategories } from '@/features/transactions';

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
    expenseDiff,
    wallets,
    transactions,
    isLoading
}: MobileDashboardProps) => {
    const router = useRouter();
    const { getCategoryVisuals } = useCategories();
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
            icon: Sparkle,
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
            icon: ArrowsLeftRight,
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
    const renderMenuActionIcon = (Icon: PhosphorIcon, className: string) => (
        <Icon size={24} weight="regular" className={className} />
    );

    if (isLoading) return null;

    return (
        <AppPageShell className="bg-background">
            <AppPageHeaderChrome width="full" className="z-20">
                <div className="flex h-16 items-center justify-between gap-3 px-4 py-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-soft">
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                                {firstName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">Beranda</p>
                            <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
                                Halo, {firstName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-card text-muted-foreground shadow-soft hover:bg-muted hover:text-foreground border border-border/40"
                            onClick={() => setIsAIChatOpen(true)}
                        >
                            <Sparkle size={16} weight="regular" className="text-accent" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-full bg-card text-muted-foreground shadow-soft hover:bg-muted hover:text-foreground border border-border/40"
                            onClick={() => router.push('/notifications')}
                        >
                            <Bell size={16} weight="regular" />
                            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
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
                        <div className="relative overflow-hidden rounded-[32px] bg-foreground text-background shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

                            <div className="relative space-y-6 p-6">
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-muted-foreground text-label-sm font-bold uppercase tracking-widest">Total Kekayaan</span>
                                        <div className="rounded-full bg-background/10 px-2.5 py-1.5 shadow-sm border border-white/5 backdrop-blur-md">
                                            <BalanceVisibilityToggle className="h-4 w-4 text-background/80 hover:text-background" variant="ghost" size="icon" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold tracking-tighter tabular-nums text-background">
                                        <AnimatedCounter value={totalBalance} />
                                    </div>
                                    <div className="mt-5">
                                        <div className="w-fit rounded-full bg-accent px-4 py-1.5 text-label-sm font-bold uppercase tracking-wider text-accent-foreground shadow-lg">
                                            {expenseDiff > 0
                                                ? `Limit: -${Math.abs(expenseDiff / (monthlyExpense - expenseDiff) * 100).toFixed(0)}%`
                                                : 'Keuangan Stabil'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col justify-between rounded-2xl bg-background/5 p-4 border border-white/5 backdrop-blur-md">
                                            <div className="flex items-center gap-2">
                                                <span className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/60">Pemasukan</span>
                                            </div>
                                            <div className="mt-2">
                                                <AnimatedCounter value={monthlyIncome} className="text-base font-bold tracking-tight text-background" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between rounded-2xl bg-background/5 p-4 border border-white/5 backdrop-blur-md">
                                            <div className="flex items-center gap-2">
                                                <span className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/60">Pengeluaran</span>
                                            </div>
                                            <div className="mt-2">
                                                <AnimatedCounter value={monthlyExpense} className="text-base font-bold tracking-tight text-background" />
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
                                <div className={cn("flex h-16 w-16 items-center justify-center rounded-3xl bg-card transition-all shadow-soft border border-border/40 group-active:shadow-inner", action.bg.replace('/10', '/5'))}>
                                    {renderMenuActionIcon(action.icon, action.color)}
                                </div>
                                <span className="text-center text-label-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-5">
                        <h2 className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                            Daftar Dompet
                        </h2>
                        <Button variant="ghost" size="sm" className="h-8 px-0 text-label-sm font-bold uppercase tracking-wider text-primary hover:bg-transparent" onClick={() => router.push('/wallets')}>
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
                                        className="group relative flex h-36 w-48 flex-col justify-between overflow-hidden rounded-[32px] p-5 shadow-lg transition-all duration-500"
                                        style={{ background: dna.gradient }}
                                    >
                                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 opacity-40 blur-2xl" />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-card bg-white/10 p-2 shadow-elevation-2 backdrop-blur-xl">
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
                                            <div className="w-fit rounded-md bg-white/10 px-2 py-1 shadow-elevation-2 backdrop-blur-sm">
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
                                className="group relative flex h-36 w-48 flex-col items-center justify-center gap-3 overflow-hidden rounded-[32px] bg-card shadow-soft border border-dashed border-border transition-all hover:bg-muted/50 active:scale-95"
                            >
                                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/20 opacity-20 blur-2xl" />
                                <div className="rounded-2xl bg-accent/10 p-4 transition-colors group-hover:bg-accent/20">
                                    <Plus size={24} weight="regular" className="text-accent" />
                                </div>
                                <span className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                                    Tambah
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="px-4">
                    <div className="overflow-hidden rounded-[32px] bg-card p-1 shadow-soft border border-border/40">
                        <SpendingTrendChart transactions={transactions} days={14} />
                    </div>
                </section>

                <section className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-5">
                        <h2 className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                            Mutasi Terakhir
                        </h2>
                        <Button variant="ghost" size="sm" className="h-8 px-0 text-label-sm font-bold uppercase tracking-wider text-primary" onClick={() => router.push('/transactions')}>
                            Semua
                        </Button>
                    </div>

                    <div className="space-y-2 rounded-[32px] bg-muted/20 p-2 shadow-soft border border-border/40 mx-4">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="overflow-hidden rounded-3xl bg-card shadow-sm border border-border/20"
                                >
                                    <TransactionListItem
                                        transaction={transaction}
                                        wallets={wallets}
                                        getCategoryVisuals={getCategoryVisuals}
                                        hideDate
                                    />
                                </div>
                            ))
                        ) : (
                            <button
                                type="button"
                                onClick={() => openTransactionSheet()}
                                className="flex w-full items-center gap-3 rounded-[24px] bg-card px-4 py-4 text-left shadow-elevation-3 transition-transform active:scale-[0.985]"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-primary/10 text-primary shadow-elevation-2">
                                    <Receipt size={20} weight="regular" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold tracking-tight text-foreground">
                                        Belum ada mutasi
                                    </div>
                                    <div className="mt-1 text-label-md font-medium text-muted-foreground/55">
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


