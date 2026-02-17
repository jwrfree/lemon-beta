'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, HandCoins, Plus, LoaderCircle } from 'lucide-react';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { formatCurrency } from '@/lib/utils';
import { ChartContainer } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { useUI } from '@/components/ui-provider';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { BudgetCard } from './budget-card';

export const BudgetingDashboard = () => {
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
            <div className="flex flex-col h-full items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (budgets.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-8 animate-in fade-in duration-500 min-h-[400px]">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <HandCoins className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-medium tracking-tight">Belum Ada Anggaran</h2>
                <p className="text-muted-foreground mt-2 mb-8 max-w-xs">Buat pos pengeluaran bulanan agar keuanganmu lebih teratur.</p>
                <Button onClick={() => setIsBudgetModalOpen(true)} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Buat Anggaran Pertama
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in">
            <div className="grid grid-cols-12 gap-6">

                {/* OVERVIEW SECTION */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground px-1">Ringkasan Bulan Ini</h2>
                    <Card className="border-none shadow-sm rounded-xl bg-card overflow-hidden">
                        <CardContent className="p-6 space-y-8">
                            <div className="h-48 flex justify-center relative">
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Sisa</p>
                                    <p className="text-lg font-medium">{Math.round((overview.totalRemaining / overview.totalBudget) * 100)}%</p>
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
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Total Limit</p>
                                    <p className="text-xl font-medium">{formatCurrency(overview.totalBudget)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* BUDGETS LIST */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Pos Anggaran</h2>
                        <Button onClick={() => setIsBudgetModalOpen(true)} variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-medium uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
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

            {/* Floating Action Button - Only show on desktop or if not handled by parent (Plan Page handles FAB differently usually) 
                But for now let's keep it here but adjust position if needed.
            */}
            <div className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden">
                <Button
                    onClick={() => setIsBudgetModalOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95"
                    aria-label="Tambah anggaran"
                >
                    <Plus className="h-7 w-7" />
                </Button>
            </div>
        </div>
    );
};

