'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { PlusCircle, HandCoins, Plus, LoaderCircle } from 'lucide-react';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { formatCurrency } from '@/lib/utils';
import { ChartContainer } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { useUI } from '@/components/ui-provider';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { BudgetCard } from './budget-card';
import { calculateGlobalBudgetOverview } from '../logic';

export const BudgetingDashboard = () => {
    const { budgets, isLoading } = useBudgets();
    const { setIsBudgetModalOpen } = useUI();

    const now = useMemo(() => new Date(), []);
    const start = useMemo(() => startOfMonth(now), [now]);
    const end = useMemo(() => endOfMonth(now), [now]);

    const { transactions, isLoading: isTransactionsLoading } = useRangeTransactions(start, end);

    const overview = useMemo(() => {
        const stats = calculateGlobalBudgetOverview(budgets, transactions);

        const chartData = [
            { name: 'Terpakai', value: stats.totalSpent, fill: 'var(--destructive)' },
            { name: 'Sisa', value: Math.max(0, stats.totalRemaining), fill: 'var(--primary)' },
        ];

        return { ...stats, chartData };
    }, [budgets, transactions]);

    if (isLoading || isTransactionsLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (budgets.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-8 animate-in fade-in duration-500 min-h-[400px]">
                <div className="max-w-[320px] w-full p-10 bg-card rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                        <HandCoins className="h-40 w-40" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                            <HandCoins className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tighter mb-3">Belum Ada Anggaran</h2>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-8">
                            Buat pos pengeluaran bulanan agar keuanganmu lebih teratur.
                        </p>
                        <Button onClick={() => setIsBudgetModalOpen(true)} className="w-full rounded-full h-12 shadow-lg shadow-primary/20 active:scale-95 transition-all font-semibold text-xs uppercase tracking-widest">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Buat Anggaran Baru
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-2 duration-500 fade-in">
            <div className="grid grid-cols-12 gap-6">

                {/* OVERVIEW SECTION */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Ringkasan Bulan Ini</h2>
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[32px] bg-card overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="h-48 flex justify-center relative">
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                                    <p className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-widest">Sisa</p>
                                    <p className="text-2xl font-semibold tracking-tighter tabular-nums text-primary">{Math.round((overview.totalRemaining / overview.totalBudget) * 100)}%</p>
                                </div>
                                <ChartContainer config={{}} className="aspect-square h-full relative z-10">
                                    <PieChart>
                                        <Pie
                                            data={overview.chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={65}
                                            outerRadius={85}
                                            strokeWidth={0}
                                            cornerRadius={10}
                                            paddingAngle={5}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 rounded-2xl bg-muted/30 border border-border/20 shadow-inner">
                                    <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Total Limit Anggaran</p>
                                    <p className="text-2xl font-semibold tracking-tighter tabular-nums">{formatCurrency(overview.totalBudget)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* BUDGETS LIST */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Pos Anggaran</h2>
                        <Button onClick={() => setIsBudgetModalOpen(true)} variant="ghost" size="sm" className="h-8 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
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

            {/* Floating Action Button */}
            <FAB onClick={() => setIsBudgetModalOpen(true)} label="Tambah anggaran" />
        </div>
    );
};

