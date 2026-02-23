'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';

interface HeroAmountProps {
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    onAmountClick?: () => void;
    compact?: boolean; // New prop for space optimization
}

export const HeroAmount = ({ amount, type, onAmountClick, compact = false }: HeroAmountProps) => {
    // Separate currency symbol and value for more precise styling
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Math.abs(amount));

    const symbol = "Rp";
    const valueStr = formatted.replace("Rp", "").trim();

    const typeColors = {
        expense: "text-rose-600 dark:text-rose-400",
        income: "text-emerald-600 dark:text-emerald-400",
        transfer: "text-blue-600 dark:text-blue-400"
    };

    return (
        <div
            onClick={onAmountClick}
            className={cn(
                "flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all duration-500 group",
                compact ? "py-4" : "py-10"
            )}
        >
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-baseline gap-2"
            >
                <span className={cn(
                    "font-medium opacity-40 tracking-tighter transition-all duration-500",
                    compact ? "text-lg" : "text-2xl",
                    typeColors[type]
                )}>
                    {symbol}
                </span>

                <div className="relative">
                    <span className={cn(
                        "font-medium tracking-tighter tabular-nums leading-none transition-all duration-500",
                        compact ? "text-4xl md:text-5xl" : "text-6xl md:text-8xl",
                        typeColors[type]
                    )}>
                        {valueStr}
                    </span>

                    <motion.div
                        layoutId="activeUnderline"
                        className={cn(
                            "absolute -bottom-1 left-0 right-0 h-1 rounded-full blur-sm opacity-20",
                            type === 'expense' ? "bg-rose-500" : "bg-emerald-500"
                        )}
                    />
                </div>
            </motion.div>

            {!compact && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/40 group-hover:text-primary transition-colors">
                    Ketuk untuk ubah nominal
                </p>
            )}
        </div>
    );
};
