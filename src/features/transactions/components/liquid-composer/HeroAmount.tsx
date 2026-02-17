'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';

interface HeroAmountProps {
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    onAmountClick?: () => void;
}

export const HeroAmount = ({ amount, type, onAmountClick }: HeroAmountProps) => {
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
            className="flex flex-col items-center justify-center py-10 cursor-pointer active:scale-95 transition-transform group"
        >
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-baseline gap-2"
            >
                <span className={cn(
                    "text-2xl font-black opacity-40 tracking-tighter",
                    typeColors[type]
                )}>
                    {symbol}
                </span>
                
                <div className="relative">
                    {/* Rolling Number Animation Effect would go here in full implementation */}
                    <span className={cn(
                        "text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none",
                        typeColors[type]
                    )}>
                        {valueStr}
                    </span>
                    
                    {/* Visual underline glow */}
                    <motion.div 
                        layoutId="activeUnderline"
                        className={cn(
                            "absolute -bottom-2 left-0 right-0 h-1.5 rounded-full blur-sm opacity-20",
                            type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
                        )}
                    />
                </div>
            </motion.div>
            
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-hover:text-primary transition-colors">
                Ketuk untuk ubah nominal
            </p>
        </div>
    );
};
