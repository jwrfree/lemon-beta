'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/models';
import { format, parseISO } from 'date-fns';

import { AlertTriangle } from 'lucide-react';

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
    const displayColor = isOverBudget ? 'bg-rose-500' : color;

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-5 border shadow-sm hover:shadow-md transition-all text-left w-full",
                isOverBudget ? "border-rose-500/50 dark:border-rose-500/30 ring-1 ring-rose-500/20" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
        >
            <div className="flex justify-between items-end relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                        <p className={cn("font-semibold text-sm md:text-base truncate", isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100")}>
                            {category}
                        </p>
                        {isOverBudget && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />}
                    </div>
                    {budgetAmount ? (
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-zinc-500 tabular-nums">
                            <span className={isOverBudget ? "text-rose-500 font-bold" : ""}>{percentage.toFixed(0)}%</span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span>Limit: {formatCurrency(budgetAmount)}</span>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 font-medium tabular-nums mt-1">{percentage.toFixed(1)}% dari total</p>
                    )}
                </div>
                <p className={cn("font-semibold text-base md:text-lg tabular-nums", isOverBudget && "text-rose-600 dark:text-rose-400")}>
                    {formatCurrency(amount)}
                </p>
            </div>

            {/* Background Bars */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800" />

            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("absolute bottom-0 left-0 h-1.5", displayColor)}
            />

            {/* Glitch/Over-budget Indicator Line */}
            {isOverBudget && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-0 right-0 w-full h-1.5 bg-rose-500/30 blur-sm"
                />
            )}
        </button>
    );
}

export function TopTransactionItem({ transaction, rank, onClick }: { transaction: Transaction, rank: number, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all w-full text-left active:scale-[0.98]"
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-sm">
                {rank}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{transaction.description || transaction.category}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(parseISO(transaction.date), 'dd MMM yyyy')}</p>
            </div>
            <p className="font-semibold text-base tabular-nums">{formatCurrency(transaction.amount)}</p>
        </button>
    );
}
