'use client';

import React from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, getDay } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpenseHeatmapProps {
    transactions: { date: string, amount: number, type: 'income' | 'expense' }[];
    start: Date;
    end: Date;
}

export function ExpenseHeatmap({ transactions, start, end }: ExpenseHeatmapProps) {
    const days = eachDayOfInterval({ start, end });

    // Process data: Sum expense per day
    const dailyExpenses: Record<string, number> = {};
    let maxExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'expense') {
            const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
            dailyExpenses[dateKey] = (dailyExpenses[dateKey] || 0) + t.amount;
            if (dailyExpenses[dateKey] > maxExpense) maxExpense = dailyExpenses[dateKey];
        }
    });

    // Helper to determine color intensity
    const getIntensityClass = (amount: number) => {
        if (amount === 0) return 'bg-muted/30 dark:bg-muted/10';
        const ratio = amount / maxExpense;
        if (ratio < 0.2) return 'bg-rose-100 dark:bg-rose-900/20';
        if (ratio < 0.4) return 'bg-rose-300 dark:bg-rose-700/40';
        if (ratio < 0.6) return 'bg-rose-400 dark:bg-rose-600/60';
        if (ratio < 0.8) return 'bg-rose-500 dark:bg-rose-500/80';
        return 'bg-rose-600 dark:bg-rose-500';
    };

    return (
        <div className="w-full bg-card rounded-md p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium tracking-tight text-foreground">
                        Intensitas Pengeluaran
                    </h3>
                    <p className="text-sm text-muted-foreground">Pola belanja harian Anda bulan ini</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const amount = dailyExpenses[dateKey] || 0;

                    return (
                        <TooltipProvider key={dateKey}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-md transition-all hover:scale-110 cursor-pointer border border-transparent hover:border-primary/50",
                                            getIntensityClass(amount)
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-xs">
                                        <p className="font-medium">{format(day, 'EEEE, d MMM')}</p>
                                        <p className={amount > 0 ? "text-rose-500" : "text-zinc-500"}>
                                            {amount > 0 ? formatCurrency(amount) : 'Tidak ada pengeluaran'}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs uppercase tracking-widest font-semibold text-muted-foreground/40">
                <span>Rendah</span>
                <div className="w-3 h-3 bg-rose-100 dark:bg-rose-900/20 rounded-sm" />
                <div className="w-3 h-3 bg-rose-300 dark:bg-rose-700/40 rounded-sm" />
                <div className="w-3 h-3 bg-rose-500 dark:bg-rose-500/80 rounded-sm" />
                <div className="w-3 h-3 bg-rose-600 dark:bg-rose-500 rounded-sm" />
                <span>Tinggi</span>
            </div>
        </div>
    );
}

