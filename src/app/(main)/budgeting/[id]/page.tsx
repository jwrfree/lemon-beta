'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { cn, formatCurrency, triggerHaptic, daysInMonth } from '@/lib/utils';
import { CaretRight, ChartBar, Eye, EyeSlash, Sparkle, Stack, Target, WarningCircle } from '@phosphor-icons/react';
import { startOfMonth } from 'date-fns';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { motion } from 'framer-motion';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { AppPageBody, AppPageShell } from '@/components/app-page-shell';

export default function BudgetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { getCategoryVisuals } = useCategories();
    const { openEditBudgetModal, openTransactionSheet } = useUI();
    const [isHidden, setIsHidden] = useState(false);

    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => startOfMonth(now), [now]);

    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(start, now);
    const { budgets, isLoading: isBudgetsLoading } = useBudgets();

    const budgetId = Array.isArray(params.id) ? params.id[0] : params.id;
    const budget = useMemo(() => budgets.find(b => b.id === budgetId), [budgets, budgetId]);

    const budgetDetails = useMemo(() => {
        if (!budget) return null;

        const budgetTransactions = transactions.filter(t => {
            const categoryMatches = budget.categories.includes(t.category);
            const subCategoryMatches = !budget.subCategory || budget.subCategory === t.subCategory;
            return t.type === 'expense' && categoryMatches && subCategoryMatches;
        });

        const spent = budgetTransactions.reduce((acc, t) => acc + t.amount, 0);
        const remaining = budget.targetAmount - spent;
        const progress = budget.targetAmount > 0 ? (spent / budget.targetAmount) * 100 : 0;
        const daysLeft = daysInMonth(now) - now.getDate() + 1;
        const safeDailyLimit = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

        return { budgetTransactions, spent, remaining, progress, safeDailyLimit };
    }, [budget, transactions, now]);

    if (isBudgetsLoading || isTransactionsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkle className="h-8 w-8 text-primary/40" weight="regular" />
                </motion.div>
            </div>
        );
    }

    if (!budget) {
        return (
            <AppPageShell className="bg-zinc-50 dark:bg-black">
                <PageHeader title="Detail Anggaran" width="compact" showBackButton onBackClick={() => router.back()} />
                <main className="flex justify-center text-center p-8 pt-20">
                    <div className="max-w-xs flex flex-col items-center">
                        <div className="p-5 bg-rose-500/10 rounded-card-premium mb-6">
                            <WarningCircle className="h-12 w-12 text-rose-500" weight="regular" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tighter">Tidak Ditemukan</h2>
                        <Button onClick={() => router.push('/budgeting')} variant="outline" className="mt-8 rounded-full h-11 px-6 font-medium">
                            Kembali ke Anggaran
                        </Button>
                    </div>
                </main>
            </AppPageShell>
        );
    }

    const { budgetTransactions, spent, remaining, progress, safeDailyLimit } = budgetDetails!;
    const isOver = remaining < 0;
    const firstCategory = budget.categories[0] || 'Lainnya';
    const visuals = getCategoryVisuals(firstCategory);
    const CategoryIcon = visuals.icon as React.ElementType;

    return (
        <AppPageShell className="bg-zinc-50 dark:bg-black">
            <PageHeader
                title="Anggaran"
                width="compact"
                showBackButton
                onBackClick={() => { triggerHaptic('light'); router.back(); }}
            />

            <AppPageBody width="compact" className="space-y-10 pt-6 pb-24">

                {/* 1. Hero Balance Section (Residual Display) */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-1 space-y-6"
                >
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 label-xs !text-muted-foreground/45">
                            <span>Sisa anggaran</span>
                            <button 
                                onClick={() => { triggerHaptic('light'); setIsHidden(!isHidden); }} 
                                className="hover:text-foreground transition-colors p-1 -m-1"
                            >
                                {isHidden ? <EyeSlash size={14} weight="bold" /> : <Eye size={14} weight="bold" />}
                            </button>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-3xl font-medium tracking-tighter tabular-nums leading-none text-foreground">
                                {isHidden ? '••••••••' : formatCurrency(Math.abs(remaining))}
                            </h2>
                        </div>
                    </div>

                    <Button 
                        onClick={() => { triggerHaptic('medium'); openTransactionSheet(null, 'manual'); }}
                        className="w-full h-14 rounded-full bg-primary text-primary-foreground font-medium text-base shadow-button hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Tambah transaksi
                    </Button>
                </motion.div>

                {/* 2. Status Analysis Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Status</h3>
                        <StatusBadge variant={isOver ? 'error' : progress > 80 ? 'warning' : 'success'}>
                            {isOver ? 'Berlebih' : progress > 80 ? 'Hampir Habis' : 'Sehat'}
                        </StatusBadge>
                    </div>

                    <motion.div whileTap={{ scale: 0.99 }}>
                        <Card className="border-none rounded-card-premium bg-card shadow-soft p-7 overflow-hidden active:bg-muted/30 transition-colors">
                            <div className="space-y-7">
                                {/* Utilization Analysis */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-card-icon bg-muted text-muted-foreground/60">
                                        <ChartBar size={20} weight="regular" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="label-xs !text-muted-foreground/45">Penggunaan</span>
                                                <span className="text-xl font-medium tracking-tight text-foreground">{progress.toFixed(1)}%</span>
                                            </div>
                                            <span className="label-xs !text-muted-foreground/30 tabular-nums">
                                                {formatCurrency(spent)} / {formatCurrency(budget.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                                className={cn("h-full rounded-full transition-colors", isOver ? "bg-destructive shadow-[0_0_12px_-2px_hsla(var(--rose-500)/0.4)]" : "bg-primary")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Jatah Aman Harian Insight */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-card-icon bg-muted text-muted-foreground/60">
                                        <Sparkle size={20} weight="regular" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="label-xs !text-muted-foreground/45">Jatah Aman Harian</span>
                                        <span className={cn("text-xl font-medium tracking-tight", isOver ? "text-destructive" : "text-foreground")}>
                                            {formatCurrency(safeDailyLimit)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* 3. Configuration & Info Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Konfigurasi</h3>
                        <button 
                            onClick={() => { triggerHaptic('light'); openEditBudgetModal(budget); }}
                            className="label-xs !text-muted-foreground/45 hover:text-foreground transition-colors p-1 -m-1"
                        >
                            Ubah anggaran
                        </button>
                    </div>

                    <motion.div 
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { triggerHaptic('light'); openEditBudgetModal(budget); }}
                    >
                        <Card className="border-none rounded-card-premium bg-card shadow-soft p-7 space-y-7 cursor-pointer active:bg-muted/30 transition-colors">
                            {/* Budget Name Identity */}
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3.5 rounded-card-icon", visuals.bgColor)}>
                                    <CategoryIcon className={visuals.color} size={20} weight="regular" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="label-xs !text-muted-foreground/45">Nama anggaran</span>
                                    <span className="text-base font-medium tracking-tight text-foreground">{budget.name}</span>
                                </div>
                            </div>

                            {/* Category Mapping */}
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 rounded-card-icon bg-muted text-muted-foreground/60">
                                    <Stack size={20} weight="regular" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="label-xs !text-muted-foreground/45">Kategori aktif</span>
                                    <span className="text-base font-medium tracking-tight text-foreground truncate max-w-[200px]">
                                        {budget.subCategory ? budget.subCategory : `${budget.categories.length} Kategori`}
                                    </span>
                                </div>
                            </div>

                            {/* Financial Target */}
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3.5 rounded-card-icon bg-muted text-muted-foreground/60")}>
                                    <Target size={20} weight="regular" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="label-xs !text-muted-foreground/45">Target bulanan</span>
                                    <span className="text-base font-medium tracking-tight tabular-nums text-foreground">{formatCurrency(budget.targetAmount)}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* 4. Activity Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Transaksi</h3>
                        <button className="flex items-center gap-0.5 label-xs !text-muted-foreground/35 hover:text-foreground transition-colors p-1 -m-1">
                            Lihat semua
                            <CaretRight size={10} weight="bold" />
                        </button>
                    </div>

                    <div className="rounded-card-premium bg-card shadow-soft overflow-hidden min-h-[100px]">
                        <TransactionList
                            transactions={budgetTransactions}
                            isLoading={isTransactionsLoading}
                        />
                    </div>
                </div>

            </AppPageBody>
        </AppPageShell>
    );
}
