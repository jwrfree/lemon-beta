'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { cn, formatCurrency, triggerHaptic, daysInMonth } from '@/lib/utils';
import { AlertCircle, Pencil, ArrowLeft, Target, Flame, Sparkles, Tag, Layers } from 'lucide-react';
import { startOfMonth, differenceInDays } from 'date-fns';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/features/transactions/hooks/use-categories';

export default function BudgetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { getCategoryVisuals } = useCategories();
    const { openEditBudgetModal } = useUI();

    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => startOfMonth(now), [now]);

    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(start, now);
    const { budgets, isLoading: isBudgetsLoading } = useBudgets();

    const budgetId = Array.isArray(params.id) ? params.id[0] : params.id;
    const budget = useMemo(() => budgets.find(b => b.id === budgetId), [budgets, budgetId]);

    const budgetDetails = useMemo(() => {
        if (!budget) return null;

        const budgetTransactions = transactions.filter(t =>
            t.type === 'expense' &&
            budget.categories.includes(t.category)
        );

        const spent = budgetTransactions.reduce((acc, t) => acc + t.amount, 0);
        const remaining = budget.targetAmount - spent;
        const progress = budget.targetAmount > 0 ? (spent / budget.targetAmount) * 100 : 0;

        const daysInMonthValue = daysInMonth(now);
        const daysLeft = daysInMonthValue - now.getDate() + 1;
        const daysPassedPercentage = (now.getDate() / daysInMonthValue) * 100;

        // Projection logic
        const daysElapsed = now.getDate();
        const dailyRate = spent / daysElapsed;
        const daysToZero = dailyRate > 0 ? Math.floor(remaining / dailyRate) : Infinity;
        const safeDailyLimit = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

        return { budgetTransactions, spent, remaining, progress, daysLeft, daysPassedPercentage, daysToZero, safeDailyLimit };
    }, [budget, transactions, now]);

    if (isBudgetsLoading || isTransactionsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="h-8 w-8 text-primary/40" />
                </motion.div>
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="h-full bg-zinc-50 dark:bg-black">
                <PageHeader title="Detail Anggaran" />
                <main className="flex justify-center text-center p-8 pt-20">
                    <div className="max-w-xs flex flex-col items-center">
                        <div className="p-5 bg-rose-500/10 rounded-[2rem] mb-6">
                            <AlertCircle className="h-12 w-12 text-rose-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter">Tidak Ditemukan</h2>
                        <p className="text-sm font-medium text-muted-foreground mt-3">Anggaran ini mungkin sudah dihapus atau dipindahkan.</p>
                        <Button onClick={() => router.push('/budgeting')} variant="outline" className="mt-8 rounded-xl h-11 px-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Anggaran
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const { budgetTransactions, spent, remaining, progress, daysLeft, daysPassedPercentage, daysToZero, safeDailyLimit } = budgetDetails!;

    // Visual Configuration
    const isOver = remaining < 0;
    const barColor = isOver ? 'bg-rose-600' : (progress > 80 ? 'bg-yellow-400' : 'bg-primary');
    const glowColor = isOver ? 'shadow-[0_0_20px_rgba(225,29,72,0.4)]' : (progress > 80 ? 'shadow-[0_0_20px_rgba(253,224,71,0.3)]' : 'shadow-[0_0_20px_rgba(13,148,136,0.3)]');
    const textColor = isOver ? 'text-rose-600' : (progress > 80 ? 'text-yellow-600' : 'text-primary');

    const firstCategory = budget.categories[0] || 'Lainnya';
    const visuals = getCategoryVisuals(firstCategory);
    const CategoryIcon = visuals.icon as React.ElementType;

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-black">
            <PageHeader
                title="Detail Anggaran"
                actionButton={{
                    icon: Pencil,
                    label: "Ubah",
                    onClick: () => { triggerHaptic('light'); openEditBudgetModal(budget); }
                }}
            />

            <main className="flex-1 overflow-y-auto px-4 md:px-8 space-y-8 pb-32 pt-4">

                {/* 1. Identity & Health Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm overflow-hidden premium-shadow">
                        <div className="p-8 space-y-10">
                            {/* Title & Icon */}
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className={cn("p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-inner transition-colors", visuals.bgColor)}>
                                    <CategoryIcon className={cn("h-10 w-10", visuals.color)} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-medium tracking-tighter">{budget.name}</h2>
                                    <div className="flex items-center justify-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-zinc-100 dark:border-zinc-800">
                                            {budget.categories.length} Kategori
                                        </Badge>
                                        <span className={cn("text-[10px] font-medium uppercase tracking-widest", textColor)}>
                                            {isOver ? 'Overbudget' : (progress > 80 ? 'Hampir Habis' : 'Sehat')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Massive Progress Bar */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                                    <span>PENGGUNAAN</span>
                                    <span>{progress.toFixed(1)}%</span>
                                </div>
                                <div className="relative h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-zinc-400/30 z-20"
                                        style={{ left: `${Math.min(daysPassedPercentage, 100)}%` }}
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(progress, 100)}%` }}
                                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 z-10", barColor, glowColor)}
                                    >
                                        <div className="absolute inset-0 opacity-20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.2) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between text-[9px] font-medium text-zinc-400 uppercase tracking-widest px-1">
                                    <span>Awal Bulan</span>
                                    <span>Hari ke-{now.getDate()}</span>
                                    <span>Akhir Bulan</span>
                                </div>
                            </div>

                            {/* Multi-Stat Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div className="p-6 rounded-[2rem] bg-muted/30 shadow-inner space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <Target className="h-3 w-3" /> Target
                                    </p>
                                    <p className="text-xl font-bold tracking-tighter tabular-nums text-foreground">{formatCurrency(budget.targetAmount)}</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-muted/30 shadow-inner space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <Layers className="h-3 w-3" /> Terpakai
                                    </p>
                                    <p className={cn("text-xl font-bold tracking-tighter tabular-nums", isOver ? 'text-rose-600' : 'text-foreground')}>{formatCurrency(spent)}</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-muted/30 shadow-inner space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <Flame className="h-3 w-3" /> {isOver ? 'Kekurangan' : 'Sisa'}
                                    </p>
                                    <p className={cn("text-xl font-bold tracking-tighter tabular-nums", isOver ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400')}>
                                        {formatCurrency(Math.abs(remaining))}
                                    </p>
                                </div>
                            </div>

                            {/* Action Insight Bar */}
                            {!isOver && remaining > 0 && (
                                <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div className="text-center md:text-left space-y-0.5">
                                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tracking-tight uppercase">Jatah Aman Harian</p>
                                            <p className="text-[10px] font-medium text-emerald-600/60 uppercase tracking-widest">Kontrol Budget Berjalan</p>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">{formatCurrency(safeDailyLimit)}</p>
                                        <p className="text-[9px] font-bold text-emerald-600/40 uppercase tracking-[0.3em]">per hari</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* 2. List Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 text-zinc-400">
                            <Tag className="h-4 w-4" />
                            <h2 className="text-lg font-medium tracking-tighter text-zinc-900 dark:text-zinc-100">Aktivitas Anggaran</h2>
                        </div>
                        <Badge variant="outline" className="rounded-lg font-normal text-[10px] uppercase">{budgetTransactions.length} Transaksi</Badge>
                    </div>

                    <TransactionList
                        transactions={budgetTransactions}
                        isLoading={isTransactionsLoading}
                    />
                </motion.div>
            </main>
        </div>
    )
}
