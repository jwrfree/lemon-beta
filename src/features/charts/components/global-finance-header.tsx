'use client';

import React, { useMemo } from 'react';
import { isSameMonth, parseISO, format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Scale, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DateRangeFilter } from '@/features/insights/components/date-range-filter';
// Use relative path to ensure module resolution
import { ExportButton } from '../../insights/components/export-button';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Transaction } from '@/types/models';

export const GlobalFinanceHeader = ({ 
    transactions: manualTransactions,
    label: manualLabel 
}: { 
    transactions?: Transaction[],
    label?: string 
}) => {
    const { transactions: hookTransactions } = useTransactions();
    const transactions = manualTransactions || hookTransactions;
    const isMobile = useIsMobile();
    
    const summary = useMemo(() => {
        const now = new Date();
        const monthLabel = manualLabel || format(now, 'MMMM yyyy', { locale: dateFnsLocaleId });
        
        // If manualTransactions provided, we assume they are already filtered by the caller
        const relevantTransactions = manualTransactions ? transactions : transactions.filter((t) => isSameMonth(parseISO(t.date), now));
        
        const income = relevantTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = relevantTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;
        const isPositive = net >= 0;

        return { monthLabel, income, expense, net, isPositive, relevantTransactions };
    }, [transactions, manualTransactions, manualLabel]);

    return (
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-background border-b">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Statistik Keuangan</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                            Ringkasan <span className="font-medium text-foreground">{summary.monthLabel}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        <DateRangeFilter />
                        <ExportButton transactions={summary.relevantTransactions} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* Arus Kas Card (Main Highlight) */}
                    <Card className={cn(
                        "relative overflow-hidden border-none shadow-lg transition-all hover:shadow-xl",
                        summary.isPositive ? "bg-emerald-500" : "bg-rose-500"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Scale size={isMobile ? 60 : 80} />
                        </div>
                        <CardContent className="p-4 sm:p-5 text-white">
                            <p className="text-[10px] sm:text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Arus Kas (Net)</p>
                            <h3 className="text-xl sm:text-2xl font-bold mb-2 tabular-nums">
                                {formatCurrency(summary.net)}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-full">
                                {summary.isPositive ? (
                                    <>
                                        <TrendingUp size={12} />
                                        <span>Surplus bulan ini</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown size={12} />
                                        <span>Defisit bulan ini</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pemasukan Card */}
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900 transition-all hover:shadow-lg">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Pemasukan</p>
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <ArrowUpRight size={isMobile ? 14 : 16} />
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(summary.income)}
                            </h3>
                        </CardContent>
                    </Card>

                    {/* Pengeluaran Card */}
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900 transition-all hover:shadow-lg">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran</p>
                                <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
                                    <ArrowDownLeft size={isMobile ? 14 : 16} />
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                {formatCurrency(summary.expense)}
                            </h3>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
