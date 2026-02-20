'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
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
        <div className="relative overflow-hidden rounded-2xl bg-[#064e4b] text-white p-8 md:p-12 shadow-2xl mx-4 mt-4 border border-white/10">
            {/* Background Chart */}
            {mounted && dataPoints.length > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-48 opacity-10 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataPoints}>
                            <defs>
                                <linearGradient id="chartPulseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="hsl(var(--primary-foreground))"
                                strokeWidth={2}
                                fill="url(#chartPulseGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left: Net Value */}
                <div className="text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <p className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-widest">Sisa Uang (Cashflow)</p>
                        {netChange !== 0 && (
                            <Badge className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 h-5",
                                netChange > 0 ? "bg-white/20 text-white border-white/30" : "bg-destructive/20 text-destructive-foreground border-destructive/30"
                            )}>
                                {netChange > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                {Math.abs(netChange).toFixed(1)}%
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium tracking-tighter tabular-nums leading-none">
                        {formatCurrency(net)}
                    </h1>

                    {/* Layer 1 AI Insight Sentence */}
                    <div className="mt-4 flex items-center gap-2 text-white/80 md:text-sm text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span>Keuanganmu bulan ini <b>12% lebih stabil</b> dibanding bulan lalu.</span>
                        <div className="h-3 w-px bg-white/20 mx-1" />
                        <button className="underline decoration-white/30 hover:decoration-white font-bold">Lihat Analitik</button>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 text-[10px] md:text-xs mt-4">
                        <span>Estimasi Pengeluaran Akhir Bulan:</span>
                        <span className="text-white/80 font-medium tabular-nums">{formatCurrency(projectedExpense)}</span>
                    </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-white/80 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Pemasukan</span>
                        </div>
                        <p className="text-lg md:text-xl font-medium tabular-nums">{formatCurrency(income)}</p>
                        <div className="w-full bg-white/10 h-1 mt-2 mb-2 rounded-full overflow-hidden">
                            <div className="bg-white/80 h-full rounded-full" style={{ width: '100%' }} />
                        </div>
                        <div className={cn("text-[10px] font-medium flex items-center gap-1 flex-wrap", incomeChange >= 0 ? "text-white" : "text-white/60")}>
                            {incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{formatCurrency(Math.abs(incomeDiff))}</span>
                            <span className="opacity-70">({Math.abs(incomeChange).toFixed(0)}%)</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-white/80 mb-1">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Pengeluaran</span>
                        </div>
                        <p className="text-lg md:text-xl font-medium tabular-nums">{formatCurrency(expense)}</p>
                        <div className="w-full bg-white/10 h-1 mt-2 mb-2 rounded-full overflow-hidden">
                            <div className="bg-white/80 h-full rounded-full" style={{ width: `${income > 0 ? Math.min((expense / income) * 100, 100) : 100}%` }} />
                        </div>
                        <div className={cn("text-[10px] font-medium flex items-center gap-1 flex-wrap", expenseChange <= 0 ? "text-white" : "text-white/60")}>
                            {expenseChange <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            <span>{formatCurrency(Math.abs(expenseDiff))}</span>
                            <span className="opacity-70">({Math.abs(expenseChange).toFixed(0)}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

