'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, HandCoins, Plus, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { useUI } from '@/components/ui-provider';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { PageHeader } from '@/components/page-header';
import { BudgetCard } from '@/features/budgets/components/budget-card';
import { Skeleton } from '@/components/ui/skeleton';

function BudgetingPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-black p-6 space-y-8">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="md:col-span-1 h-[300px] rounded-[2.5rem]" />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-[2rem]" />)}
                </div>
            </div>
        </div>
    );
}

export default function BudgetingPage() {
    const { budgets, isLoading } = useBudgets();
    const { setIsBudgetModalOpen } = useUI();

    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => startOfMonth(now), [now]);
    const end = useMemo(() => endOfMonth(now), [now]);

    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(start, end);

    const overview = useMemo(() => {
        const totalBudget = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
        const relevantCategories = Array.from(new Set(budgets.flatMap(b => b.categories)));

        const totalSpent = transactions
            .filter(t => t.type === 'expense' && relevantCategories.includes(t.category))
            .reduce((acc, t) => acc + t.amount, 0);

        const totalRemaining = totalBudget - totalSpent;
        const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        const chartData = [
            { name: 'Terpakai', value: totalSpent, color: 'var(--chart-2)' },
            { name: 'Sisa', value: Math.max(0, totalRemaining), color: 'var(--primary)' },
        ];

        return { totalBudget, totalSpent, totalRemaining, percentUsed, chartData };
    }, [budgets, transactions]);

    if (isLoading || isTransactionsLoading) {
        return <BudgetingPageSkeleton />;
    }

    return (
        <div className="flex flex-col h-full relative bg-zinc-50 dark:bg-black">
            <PageHeader title="Manajemen Anggaran" />
            
            <main className="flex-1 overflow-y-auto pb-32">
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
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200/60 dark:border-zinc-800/60">
                                    <HandCoins className="h-10 w-10 text-primary" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="max-w-[300px] space-y-3">
                                <h2 className="text-3xl font-black tracking-tighter">Budgeting Cerdas</h2>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Atur batas pengeluaran untuk setiap pos agar uangmu tidak "numpang lewat".
                                </p>
                            </div>
                            <Button 
                                onClick={() => { triggerHaptic('medium'); setIsBudgetModalOpen(true); }} 
                                size="lg" 
                                className="mt-10 rounded-2xl h-14 px-10 shadow-xl shadow-primary/20 active:scale-95 transition-all font-bold text-lg"
                            >
                                <PlusCircle className="mr-2 h-6 w-6" />
                                Buat Anggaran Pertama
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-10">
                            
                            <div className="grid grid-cols-12 gap-8 items-start">
                                {/* 1. Premium Overview Card */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="col-span-12 lg:col-span-4"
                                >
                                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] -rotate-12">
                                            <TrendingUp className="h-32 w-32" />
                                        </div>
                                        
                                        <CardContent className="p-8 space-y-8 relative z-10">
                                            <div className="space-y-1">
                                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status Global</h2>
                                                <p className="text-2xl font-black tracking-tight">Kesehatan Anggaran</p>
                                            </div>

                                            <div className="h-56 flex justify-center items-center relative">
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-4xl font-black tracking-tighter tabular-nums">
                                                        {Math.round(overview.percentUsed)}%
                                                    </p>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Terpakai</p>
                                                </div>
                                                
                                                <ChartContainer config={{}} className="aspect-square h-full">
                                                    <PieChart>
                                                        <Pie
                                                            data={overview.chartData}
                                                            dataKey="value"
                                                            innerRadius={70}
                                                            outerRadius={95}
                                                            strokeWidth={0}
                                                            paddingAngle={8}
                                                            cornerRadius={12}
                                                            startAngle={90}
                                                            endAngle={450}
                                                        >
                                                            {overview.chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ChartContainer>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Sisa</p>
                                                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                            {formatCurrency(overview.totalRemaining)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Dari Total</p>
                                                        <p className="text-sm font-bold text-zinc-500 tabular-nums">
                                                            {formatCurrency(overview.totalBudget)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 px-2 text-[10px] font-medium text-zinc-400">
                                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                                    <span>Tips: Kamu masih punya sisa {Math.round(100 - overview.percentUsed)}% dana menganggur.</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* 2. Staggered Budget List */}
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <h2 className="text-xl font-black tracking-tighter">Pos Anggaran</h2>
                                        </div>
                                        <Button 
                                            onClick={() => { triggerHaptic('light'); setIsBudgetModalOpen(true); }} 
                                            variant="ghost" 
                                            size="sm" 
                                            className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors"
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
                    <motion.div 
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 20 }}
                        className="fixed bottom-24 right-6 z-40 md:bottom-10 md:right-10"
                    >
                        <Button
                            onClick={() => { triggerHaptic('medium'); setIsBudgetModalOpen(true); }}
                            size="icon"
                            className="h-16 w-16 rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-110 transition-all active:scale-95 bg-primary text-white"
                            aria-label="Tambah anggaran"
                        >
                            <Plus className="h-8 w-8" strokeWidth={2.5} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
