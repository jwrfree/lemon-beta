'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/models';
import { format, parseISO } from 'date-fns';

import { AlertTriangle, Trophy } from 'lucide-react';

export function CategoryPilla({ category, amount, total, budgetAmount, color, onClick }: {
    category: string,
    amount: number,
    total: number,
    budgetAmount?: number,
    color: string,
    onClick?: () => void
}) {
    // If budget exists, percentage is based on budget. Else, based on total expense.
    const percentage = budgetAmount ? (amount / budgetAmount) * 100 : (total > 0 ? (amount / total) * 100 : 0);
    const isOverBudget = budgetAmount ? amount > budgetAmount : false;

    // Extract background color from tailwind class if possible, or use a default
    const getGradientColor = () => {
        if (isOverBudget) return 'from-rose-500 to-rose-600';
        const colorName = color.replace('bg-', '').replace('-500', '');
        return `from-${colorName}-500 to-${colorName}-600`;
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden bg-card rounded-xl p-5 border-none shadow-card transition-all text-left w-full",
                isOverBudget
                    ? "ring-1 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                    : "hover:bg-muted/50"
            )}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", isOverBudget ? "bg-rose-500" : color)} />
                            <p className={cn("font-medium text-xs uppercase tracking-widest", isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                                {category}
                            </p>
                        </div>
                        <p className={cn("text-xl md:text-2xl font-bold tracking-tighter tabular-nums", isOverBudget ? "text-rose-700 dark:text-rose-300" : "text-foreground")}>
                            {formatCurrency(amount)}
                        </p>
                    </div>
                    {isOverBudget && (
                        <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className={isOverBudget ? "text-rose-500" : "text-zinc-400"}>
                                {percentage.toFixed(0)}% Terpakai
                            </span>
                        </div>
                        {budgetAmount && (
                            <span className="text-muted-foreground">Limit: {formatCurrency(budgetAmount)}</span>
                        )}
                    </div>
                    <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                getGradientColor()
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Subtle background pattern for premium feel */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Trophy className="h-20 w-20 -rotate-12" />
            </div>
        </button>
    );
}

export function TopTransactionItem({ transaction, rank, onClick }: { transaction: Transaction, rank: number, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border-none hover:bg-muted/50 transition-all w-full text-left active:scale-[0.98]"
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-semibold text-xs">
                {rank}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate tracking-tight">{transaction.description || transaction.category}</p>
                <p className="text-xs uppercase font-semibold tracking-widest text-muted-foreground/50">{format(parseISO(transaction.date), 'dd MMM yyyy')}</p>
            </div>
            <p className="font-medium text-base tabular-nums">{formatCurrency(transaction.amount)}</p>
        </button>
    );
}

