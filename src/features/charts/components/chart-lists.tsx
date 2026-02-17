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
                "group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[2rem] p-5 border transition-all text-left w-full premium-shadow",
                isOverBudget 
                    ? "border-rose-500/30 ring-1 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]" 
                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover-glow"
            )}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", isOverBudget ? "bg-rose-500" : color)} />
                            <p className={cn("font-bold text-sm uppercase tracking-wider", isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400")}>
                                {category}
                            </p>
                        </div>
                        <p className={cn("text-xl md:text-2xl font-bold tracking-tighter tabular-nums", isOverBudget ? "text-rose-700 dark:text-rose-300" : "text-zinc-900 dark:text-zinc-100")}>
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
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className={isOverBudget ? "text-rose-500" : "text-zinc-400"}>
                                {percentage.toFixed(0)}% Terpakai
                            </span>
                        </div>
                        {budgetAmount && (
                            <span className="text-zinc-400">Limit: {formatCurrency(budgetAmount)}</span>
                        )}
                    </div>
                    
                    <div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
