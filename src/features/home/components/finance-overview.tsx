
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/animated-counter';
import { cn, formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FinanceOverviewProps {
    totalBalance: number;
    income: number;
    expense: number;
    net: number;
    prevIncome: number;
    prevExpense: number;
    prevNet: number;
    incomeTrend: { direction: 'up' | 'down' | 'flat'; value: string };
    expenseTrend: { direction: 'up' | 'down' | 'flat'; value: string };
    netTrend: { direction: 'up' | 'down' | 'flat'; value: string };
}

export const FinanceOverview = ({
    totalBalance,
    income,
    expense,
    net,
    prevIncome,
    prevExpense,
    prevNet,
    incomeTrend,
    expenseTrend,
    netTrend
}: FinanceOverviewProps) => {
    
    // Calculate savings rate (Net / Income * 100)
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    const incomeDiff = income - prevIncome;
    const expenseDiff = expense - prevExpense;
    const netDiff = net - prevNet;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance Card */}
            <Card className="border-none shadow-sm bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-10">
                    <Wallet className="w-32 h-32" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <p className="text-sm font-medium text-primary-foreground/80 mb-2">Total Saldo</p>
                    <div className="text-3xl font-medium tracking-tight mb-4">
                        <AnimatedCounter value={totalBalance} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Status Keuangan Sehat
                    </div>
                </CardContent>
            </Card>

            {/* Income Card */}
            <Card className="border-none shadow-sm bg-teal-50/30 dark:bg-teal-950/10 hover:shadow-md transition-all">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className={cn(
                            "flex items-center px-2 py-1 rounded text-[10px] font-medium",
                            incomeTrend.direction === 'up' 
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                                : incomeTrend.direction === 'down'
                                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                            {incomeTrend.direction === 'up' ? '+' : ''}{incomeTrend.value}
                        </div>
                    </div>
                    <div className="text-2xl font-medium text-foreground">
                        <AnimatedCounter value={income} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {incomeDiff >= 0 ? '+' : ''}{formatCurrency(Math.abs(incomeDiff))} vs bulan lalu
                    </p>
                </CardContent>
            </Card>

            {/* Expense Card */}
            <Card className="border-none shadow-sm bg-rose-50/30 dark:bg-rose-950/10 hover:shadow-md transition-all">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                            <ArrowDownLeft className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className={cn(
                            "flex items-center px-2 py-1 rounded text-[10px] font-medium",
                            expenseTrend.direction === 'down' 
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                                : expenseTrend.direction === 'up'
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                            {expenseTrend.direction === 'up' ? '+' : ''}{expenseTrend.value}
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pengeluaran Bulan Ini</p>
                    <div className="text-2xl font-medium text-foreground">
                        <AnimatedCounter value={expense} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {expenseDiff >= 0 ? '+' : ''}{formatCurrency(Math.abs(expenseDiff))} vs bulan lalu
                    </p>
                </CardContent>
            </Card>

            {/* Net / Savings Card */}
            <Card className="border-none shadow-sm bg-blue-50/30 dark:bg-blue-950/10 hover:shadow-md transition-all">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className={cn(
                            "flex items-center px-2 py-1 rounded text-[10px] font-medium",
                            netTrend.direction === 'up' 
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                                : netTrend.direction === 'down'
                                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                            {netTrend.direction === 'up' ? '+' : ''}{netTrend.value}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Arus Kas Bersih</p>
                        <div className={cn(
                            "text-2xl font-medium",
                            net >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                            <AnimatedCounter value={net} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {netDiff >= 0 ? '+' : ''}{formatCurrency(Math.abs(netDiff))} vs bulan lalu
                        </p>
                    </div>
                    {income > 0 && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                                <span>Savings Rate</span>
                                <span>{savingsRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-1" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

