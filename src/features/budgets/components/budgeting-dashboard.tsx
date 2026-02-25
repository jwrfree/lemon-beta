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
import { EmptyState } from '@/components/empty-state';

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
            <div className="flex flex-col h-full min-h-[400px] animate-in fade-in duration-500">
                <EmptyState
                    icon={HandCoins}
                    title="Belum Ada Anggaran"
                    description="Buat pos pengeluaran bulanan agar keuanganmu lebih teratur dan terkendali."
                    actionLabel="Buat Anggaran Baru"
                    onAction={() => setIsBudgetModalOpen(true)}
                    variant="default"
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in">
            <div className="grid grid-cols-12 gap-6">

                {/* OVERVIEW SECTION */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-2">Ringkasan Bulan Ini</h2>
                    <Card className="border-none shadow-card rounded-card-premium bg-card overflow-hidden">
                        <CardContent className="p-7 space-y-6">
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
                                <div className="p-5 rounded-card bg-muted/30 border border-border/20 shadow-inner">
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
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Pos Anggaran</h2>
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

