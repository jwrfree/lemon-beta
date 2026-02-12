
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, HandCoins, Plus, LoaderCircle } from 'lucide-react';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { cn, formatCurrency, daysInMonth } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { useUI } from '@/components/ui-provider';
import { startOfMonth, parseISO, endOfMonth } from 'date-fns';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { PageHeader } from '@/components/page-header';
import type { Budget, Transaction } from '@/types/models';

const BudgetCard = ({ budget, transactions }: { budget: Budget, transactions: Transaction[] }) => {
    const { getCategoryVisuals } = useCategories();
    const router = useRouter();

    const spent = useMemo(() => {
        return transactions
            .filter(t =>
                t.type === 'expense' &&
                budget.categories.includes(t.category)
            )
            .reduce((acc, t) => acc + t.amount, 0);
    }, [transactions, budget.categories]);

    const remaining = budget.targetAmount - spent;
    const progress = (spent / budget.targetAmount) * 100;

    const now = new Date();
    const daysInMonthValue = daysInMonth(now);
    const daysLeft = daysInMonthValue - now.getDate();

    let progressBarColor = 'bg-primary';
    if (progress > 80 && progress <= 100) {
        progressBarColor = 'bg-yellow-500';
    } else if (progress > 100) {
        progressBarColor = 'bg-foreground';
    }

    const firstCategory = budget.categories[0] || 'Lainnya';
    const visuals = getCategoryVisuals(firstCategory);
    const CategoryIcon = visuals.icon as React.ElementType;
    const { color, bgColor } = visuals;

    return (
        <motion.button
            type="button"
            onClick={() => router.push(`/budgeting/${budget.id}`)}
            whileHover={{ y: -4 }}
            className={cn(
                'w-full text-left rounded-xl group transition-all focus-visible:outline-none'
            )}
            aria-label={`Buka detail anggaran ${budget.name}`}
        >
            <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden bg-card h-full">
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("flex-shrink-0 p-2.5 rounded-lg shadow-inner", bgColor)}>
                                <CategoryIcon className={cn("h-5 w-5", color)} />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm tracking-tight">{budget.name}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{budget.categories.length} Kategori</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-muted/50 text-[10px] font-bold uppercase tracking-tighter border-none">
                            {daysLeft} HARI LAGI
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn("h-full rounded-full", progressBarColor)}
                            />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Sisa</p>
                                <p className={cn(
                                    "text-sm font-bold tracking-tight tabular-nums",
                                    remaining < 0 ? "text-destructive" : "text-teal-600"
                                )}>
                                    {remaining < 0 ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Target</p>
                                <p className="text-sm font-bold text-foreground/80">{formatCurrency(budget.targetAmount)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.button>
    );
};

export default function BudgetingPage() {
    const { getCategoryVisuals } = useCategories();
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
            .filter(t =>
                t.type === 'expense' &&
                relevantCategories.includes(t.category)
            )
            .reduce((acc, t) => acc + t.amount, 0);

        const totalRemaining = totalBudget - totalSpent;

        const chartData = [
            { name: 'Terpakai', value: totalSpent, fill: 'var(--destructive)' },
            { name: 'Sisa', value: Math.max(0, totalRemaining), fill: 'var(--primary)' },
        ];

        return { totalBudget, totalSpent, totalRemaining, chartData };
    }, [budgets, transactions]);

    if (isLoading || isTransactionsLoading) {
        return (
            <div className="flex flex-col h-full pb-24">
                <div className="flex h-full w-full items-center justify-center p-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            <PageHeader title="Manajemen Anggaran" />
            <main className="flex-1 overflow-y-auto pb-24">
                {budgets.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center p-8 animate-in fade-in duration-500">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <HandCoins className="h-12 w-12 text-primary" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Belum Ada Anggaran</h2>
                        <p className="text-muted-foreground mt-2 mb-8 max-w-xs">Buat pos pengeluaran bulanan agar keuanganmu lebih teratur.</p>
                        <Button onClick={() => setIsBudgetModalOpen(true)} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Buat Anggaran Pertama
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
                        <div className="grid grid-cols-12 gap-8">

                            {/* OVERVIEW SECTION */}
                            <div className="col-span-12 lg:col-span-4 space-y-4">
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Ringkasan Bulan Ini</h2>
                                <Card className="border-none shadow-sm rounded-xl bg-card overflow-hidden">
                                    <CardContent className="p-6 space-y-8">
                                        <div className="h-48 flex justify-center relative">
                                            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sisa</p>
                                                <p className="text-lg font-black">{Math.round((overview.totalRemaining / overview.totalBudget) * 100)}%</p>
                                            </div>
                                            <ChartContainer config={{}} className="aspect-square h-full relative z-10">
                                                <PieChart>
                                                    <Pie
                                                        data={overview.chartData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        strokeWidth={0}
                                                        cornerRadius={10}
                                                        paddingAngle={5}
                                                    />
                                                </PieChart>
                                            </ChartContainer>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 rounded-lg bg-background/40 shadow-inner">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Limit</p>
                                                <p className="text-xl font-extrabold">{formatCurrency(overview.totalBudget)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* BUDGETS LIST */}
                            <div className="col-span-12 lg:col-span-8 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Pos Anggaran</h2>
                                    <Button onClick={() => setIsBudgetModalOpen(true)} variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Tambah
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {budgets.map((budget) => (
                                        <BudgetCard key={budget.id} budget={budget} transactions={transactions} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            {budgets.length > 0 && (
                <div className="fixed bottom-20 right-6 z-40 md:bottom-8 md:right-8">
                    <Button
                        onClick={() => setIsBudgetModalOpen(true)}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95"
                        aria-label="Tambah anggaran"
                    >
                        <Plus className="h-7 w-7" />
                    </Button>
                </div>
            )}
        </div>
    );
}
