'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { PlusCircle, HandCoins, Plus, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { formatCurrency, triggerHaptic, cn } from '@/lib/utils';
import { Pie, PieChart, Cell } from "recharts"
import { useUI } from '@/components/ui-provider';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { PageHeader } from '@/components/page-header';
import { BudgetCard } from '@/features/budgets/components/budget-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer } from '@/components/ui/chart';
import { spacing } from '@/lib/layout-tokens';

function BudgetingPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-background p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="md:col-span-1 h-[300px] rounded-lg" />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
                </div>
            </div>
        </div>
    );
}

import { calculateGlobalBudgetOverview } from '@/features/budgets/logic';

export default function BudgetingPage() {
    const { budgets, isLoading } = useBudgets();
    const { setIsBudgetModalOpen } = useUI();

    // Use mounting pattern without useEffect to avoid cascading renders
    const [isMounted] = useState(() => {
        // This runs only once during initial render
        return true;
    });

    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => startOfMonth(now), [now]);
    const end = useMemo(() => endOfMonth(now), [now]);

    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(start, end);

    const overview = useMemo(() => {
        const stats = calculateGlobalBudgetOverview(budgets, transactions);

        const chartData = [
            { name: 'Terpakai', value: stats.totalSpent, color: 'var(--chart-2)' },
            { name: 'Sisa', value: Math.max(0, stats.totalRemaining), color: 'var(--primary)' },
        ];

        return { ...stats, chartData };
    }, [budgets, transactions]);

    if (isLoading || isTransactionsLoading || !isMounted) {
        return <BudgetingPageSkeleton />;
    }

    return (
        <div className="flex flex-col h-full relative bg-background">
            <PageHeader title="Manajemen Anggaran" />

            <main className="flex-1 overflow-y-auto pb-24">
                <AnimatePresence mode="wait">
                    {budgets.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col h-full items-center justify-center text-center p-8 min-h-[70vh]"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 opacity-50" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-lg bg-card shadow-xl border border-border">
                                    <HandCoins className="h-10 w-10 text-primary" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="max-w-[300px] space-y-3">
                                <h2 className="text-3xl font-medium tracking-tighter">Budgeting Cerdas</h2>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Atur batas pengeluaran untuk setiap pos agar uangmu tidak "numpang lewat".
                                </p>
                            </div>
                            <Button
                                onClick={() => { triggerHaptic('medium'); setIsBudgetModalOpen(true); }}
                                size="lg"
                                className="mt-10 rounded-lg h-14 px-10 shadow-xl shadow-primary/20 active:scale-95 transition-all font-medium text-lg"
                            >
                                <PlusCircle className="mr-2 h-6 w-6" />
                                Buat Anggaran Pertama
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">

                            <div className="grid grid-cols-12 gap-8 items-start">
                                {/* 1. Premium Overview Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="col-span-12 lg:col-span-4"
                                >
                                    <Card className="border-none rounded-card-premium bg-[#064e4b] text-white shadow-xl shadow-primary/10 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] -rotate-12">
                                            <TrendingUp className="h-40 w-40" />
                                        </div>

                                        <CardContent className={cn(spacing.cardPremium, "space-y-6 relative z-10")}>
                                            <div className="space-y-1">
                                                <h2 className="label-xs text-white/60">Ringkasan Bulan Ini</h2>
                                                <p className="text-2xl font-semibold tracking-tight">Kesehatan Anggaran</p>
                                            </div>

                                            <div className="h-60 flex justify-center items-center relative">
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <p className="text-5xl font-semibold tracking-tighter tabular-nums text-white">
                                                        {Math.round(overview.percentUsed)}%
                                                    </p>
                                                    <p className="label-xs text-white/40 mt-1">Total Terpakai</p>
                                                </div>

                                                <ChartContainer config={{}} className="aspect-square h-full">
                                                    <PieChart>
                                                        <Pie
                                                            data={overview.chartData}
                                                            dataKey="value"
                                                            innerRadius={75}
                                                            outerRadius={100}
                                                            strokeWidth={0}
                                                            paddingAngle={6}
                                                            cornerRadius={10}
                                                            startAngle={90}
                                                            endAngle={450}
                                                        >
                                                            {overview.chartData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={index === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'}
                                                                />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ChartContainer>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-4 rounded-card-glass bg-white/10 backdrop-blur-md border border-white/10 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-card-icon bg-white p-2 flex items-center justify-center shrink-0">
                                                            <Sparkles className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="label-xs text-white/60 mb-0.5">Sisa Dana Aman</p>
                                                            <p className="text-xl font-semibold text-white tabular-nums truncate">
                                                                {formatCurrency(overview.totalRemaining)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-1 text-xs font-medium leading-relaxed text-white/80">
                                                    Kamu masih punya <b>{Math.round(100 - overview.percentUsed)}%</b> budget untuk dialokasikan. Pertahankan disiplin belanjamu!
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* 2. Staggered Budget List */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <h2 className="text-xl font-medium tracking-tighter">Pos Anggaran</h2>
                                        </div>
                                        <Button
                                            onClick={() => { triggerHaptic('light'); setIsBudgetModalOpen(true); }}
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-lg h-9 text-label text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Baru
                                        </Button>
                                    </div>

                                    <motion.div
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.1 }
                                            }
                                        }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {budgets.map((budget) => (
                                            <BudgetCard key={budget.id} budget={budget} transactions={transactions} />
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating Action Button */}
            <AnimatePresence>
                {budgets.length > 0 && (
                    <FAB
                        onClick={() => { triggerHaptic('medium'); setIsBudgetModalOpen(true); }}
                        label="Tambah anggaran"
                        mobileOnly={false}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}


