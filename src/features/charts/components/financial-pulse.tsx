'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import type { DailyExpense } from '../types';

interface FinancialPulseProps {
    net: number;
    income: number;
    expense: number;
    dataPoints: DailyExpense[];
    prevMonthNet: number;
    prevMonthIncome: number;
    prevMonthExpense: number;
    projectedExpense: number;
}

export function FinancialPulse({
    net,
    income,
    expense,
    dataPoints,
    prevMonthNet,
    prevMonthIncome,
    prevMonthExpense,
    projectedExpense
}: FinancialPulseProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const netChange = prevMonthNet !== 0 ? ((net - prevMonthNet) / Math.abs(prevMonthNet)) * 100 : 0;
    const incomeChange = prevMonthIncome !== 0 ? ((income - prevMonthIncome) / prevMonthIncome) * 100 : 0;
    const expenseChange = prevMonthExpense !== 0 ? ((expense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

    const incomeDiff = income - prevMonthIncome;
    const expenseDiff = expense - prevMonthExpense;

    return (
        <div id="widget-financial-pulse" className="group relative overflow-hidden rounded-card-premium border border-white/5 bg-teal-950 p-8 text-white shadow-none">
            {/* Dynamic Background Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-success/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-300/5 rounded-full blur-[80px] -ml-24 -mb-24" />

            {/* Background Chart */}
            {mounted && dataPoints.length > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-40 opacity-[0.15] pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataPoints}>
                            <defs>
                                <linearGradient id="chartPulseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="white" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="white"
                                strokeWidth={2.5}
                                fill="url(#chartPulseGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Left: Net Value */}
                <div className="text-center md:text-left space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-2.5">
                        <p className="text-label text-white/40">Arus kas bulanan</p>
                        {netChange !== 0 && (
                            <div className={cn(
                                "text-label font-bold px-2.5 py-1 rounded-full border",
                                netChange > 0 ? "bg-success/20 text-success-foreground border-success/30" : "bg-error/20 text-error border-error/30"
                            )}>
                                {netChange > 0 ? <ArrowUpRight className="w-2.5 h-2.5 inline mr-1" /> : <ArrowDownRight className="w-2.5 h-2.5 inline mr-1" />}
                                {Math.abs(netChange).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter tabular-nums leading-none">
                        {formatCurrency(net)}
                    </h1>

                    <Button 
                        variant="ghost" 
                        onClick={() => triggerHaptic('light')}
                        className="mt-8 flex items-center gap-2.5 text-white/90 text-label bg-white/10 w-fit px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer h-auto"
                    >
                        <TrendingUp className="w-3.5 h-3.5 text-success" />
                        <span>Keuangan <b className="text-white font-black text-xs ml-1">Surplus</b></span>
                        <div className="h-3 w-px bg-white/20 mx-1" />
                        <span className="text-success-foreground">Siap investasi</span>
                    </Button>

                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/30 text-label mt-8">
                        <span>Proyeksi saldo:</span>
                        <span className="text-white/80 tabular-nums font-black">{formatCurrency(projectedExpense)}</span>
                    </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 rounded-card-glass bg-white/5 border border-white/10 backdrop-blur-md group/stat hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center gap-2 text-white/40 mb-3 group-hover/stat:text-white/60 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-label">Income</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tighter">{formatCurrency(income)}</p>
                        <div className="w-full bg-white/10 h-1 mt-4 mb-3 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                className="bg-success h-full rounded-full" 
                            />
                        </div>
                        <div className="text-label text-white/50">
                            Monthly total
                        </div>
                    </div>

                    <div className="p-6 rounded-card-glass bg-white/5 border border-white/10 backdrop-blur-md group/stat hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center gap-2 text-white/40 mb-3 group-hover/stat:text-white/60 transition-colors">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-xs font-bold text-white/40">Expenses</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tighter">{formatCurrency(expense)}</p>
                        <div className="w-full bg-white/10 h-1 mt-4 mb-3 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${income > 0 ? Math.min((expense / income) * 100, 100) : 100}%` }}
                                className="bg-error h-full rounded-full" 
                            />
                        </div>
                        <div className="text-label text-white/50">
                            Budget usage
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

