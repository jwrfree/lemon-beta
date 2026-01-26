'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, isSameMonth, getDaysInMonth } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryDetails } from '@/lib/categories';
import { PlaceholderContent } from './placeholder-content';
import { LoaderCircle, ArrowDownLeft, ArrowUpRight, Calendar, Scale, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as UIProgress } from '@/components/ui/progress';
import { generateFinancialInsight, FinancialData } from '@/ai/flows/generate-insight-flow';
import { subMonths, isAfter, differenceInMonths } from 'date-fns';

type TabValue = 'expense' | 'income' | 'net';

export const MonthlySummary = ({ type }: { type: TabValue }) => {
    const { transactions, wallets, debts } = useData();
    const router = useRouter();
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleGenerateInsight = async () => {
        setIsAiLoading(true);
        try {
            const now = new Date();
            const currentMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now));
            
            const monthlyIncome = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const monthlyExpense = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

            // Calculate top categories
            const categoryMap = new Map<string, number>();
            currentMonthTransactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    const current = categoryMap.get(t.category) || 0;
                    categoryMap.set(t.category, current + t.amount);
                });
            
            const topExpenseCategories = Array.from(categoryMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category, amount]) => ({ category, amount }));

            // Debt analytics for AI
            const myDebts = debts?.filter(d => d.direction === 'owed') || [];
            const totalDebt = myDebts.reduce((acc, d) => acc + (d.outstandingBalance ?? 0), 0);
            
            const lastMonth = subMonths(now, 1);
            const calculateHistoricalBalance = (targetDate: Date) => {
                return myDebts.reduce((acc, d) => {
                    const startDate = d.startDate ? parseISO(d.startDate) : (d.createdAt ? parseISO(d.createdAt) : new Date(0));
                    if (isAfter(startDate, targetDate)) return acc;
                    const paymentsUntilTarget = d.payments?.filter(p => {
                        const pDate = p.paymentDate ? parseISO(p.paymentDate) : new Date(0);
                        return !isAfter(pDate, targetDate);
                    }) || [];
                    const totalPaidUntilTarget = paymentsUntilTarget.reduce((sum, p) => sum + p.amount, 0);
                    const estimatedBalance = Math.max(0, (d.principal ?? 0) - totalPaidUntilTarget);
                    return acc + estimatedBalance;
                }, 0);
            };
            
            const lastMonthBalance = calculateHistoricalBalance(lastMonth);
            const debtChangeMonth = totalDebt - lastMonthBalance;
            
            const hasSilentGrowth = myDebts.some(d => (d.outstandingBalance ?? 0) > (d.principal ?? 0) && (d.interestRate ?? 0) > 0);
            
            // Simplified projection
            const threeMonthsAgo = subMonths(now, 3);
            const recentPayments = myDebts.flatMap(d => d.payments || [])
                .filter(p => p.paymentDate && isAfter(parseISO(p.paymentDate), threeMonthsAgo));
            const avgMonthlyPayment = recentPayments.reduce((sum, p) => sum + p.amount, 0) / 3;
            const projectedPayoffMonths = avgMonthlyPayment > 0 ? Math.ceil(totalDebt / avgMonthlyPayment) : undefined;

            const data: FinancialData = {
                monthlyIncome,
                monthlyExpense,
                totalBalance,
                topExpenseCategories,
                recentTransactionsCount: currentMonthTransactions.length,
                debtInfo: totalDebt > 0 ? {
                    totalDebt,
                    debtChangeMonth,
                    hasSilentGrowth,
                    projectedPayoffMonths
                } : undefined
            };

            const focus = type === 'expense' ? 'expense' : type === 'income' ? 'income' : type === 'net' ? 'net' : 'debt';
            const result = await generateFinancialInsight(data, focus);
            setAiInsight(result);
        } catch (error) {
            console.error("Failed to generate insight:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const summary = useMemo(() => {
        const now = new Date();
        const monthLabel = format(now, 'MMMM yyyy', { locale: dateFnsLocaleId });
        const daysInMonth = getDaysInMonth(now);
        const daysElapsed = now.getDate();
        const monthProgress = (daysElapsed / daysInMonth) * 100;

        const monthlyTransactions = transactions.filter((t) => isSameMonth(parseISO(t.date), now));
        const incomeTransactions = monthlyTransactions.filter((t) => t.type === 'income');
        const expenseTransactions = monthlyTransactions.filter((t) => t.type === 'expense');

        const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const expense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;

        const baseSummary = {
            monthLabel,
            monthProgress,
            daysElapsed,
            daysInMonth,
            netDetails: { income, expense, net },
            averagePerDay: 0,
            averagePerTransaction: 0,
            topCategory: null as null | {
                name: string;
                value: number;
                percentage: number;
                icon: React.ElementType;
                color: string;
                bgColor: string;
            },
            topTransaction: null as null | any,
            tipCopy: '',
            badgeLabel: '',
            heroDescription: '',
            heroGradient: '',
            icon: Scale as React.ElementType,
            title: '',
            value: 0,
            isPositive: true,
            type,
        };

        if (type === 'expense' || type === 'income') {
            const relevantTransactions = type === 'expense' ? expenseTransactions : incomeTransactions;
            const value = type === 'expense' ? expense : income;
            const transactionCount = relevantTransactions.length;

            const categoryTotals = relevantTransactions.reduce((acc, transaction) => {
                acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
                return acc;
            }, {} as Record<string, number>);

            let topCategory = null as (typeof baseSummary)['topCategory'];
            const sortedCategories = Object.entries(categoryTotals);
            if (sortedCategories.length > 0) {
                const [name, categoryValue] = sortedCategories.sort((a, b) => (b[1] as number) - (a[1] as number))[0];
                const details = categoryDetails(name as string);
                topCategory = {
                    name: name as string,
                    value: categoryValue as number,
                    percentage: value > 0 ? ((categoryValue as number) / value) * 100 : 0,
                    icon: details.icon,
                    color: details.color,
                    bgColor: details.bgColor,
                };
            }

            const topTransaction = transactionCount
                ? [...relevantTransactions].sort((a, b) => b.amount - a.amount)[0]
                : null;

            const averagePerTransaction = transactionCount > 0 ? value / transactionCount : 0;
            const averagePerDay = daysElapsed > 0 ? value / daysElapsed : 0;

            const heroGradient =
                type === 'expense'
                    ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400'
                    : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500';

            const heroDescription =
                type === 'expense'
                    ? 'Fokus pada kategori terbesar agar anggaran tetap aman.'
                    : 'Kenali sumber pemasukan utama bulan ini.';

            const tipCopy =
                type === 'expense'
                    ? 'Pertimbangkan untuk menyiapkan batas pengeluaran pada kategori terbesar agar tidak melampaui budget.'
                    : 'Salurkan pemasukan tambahan ke tabungan otomatis atau tujuan finansialmu.';

            return {
                ...baseSummary,
                title: type === 'expense' ? 'Total Pengeluaran' : 'Total Pemasukan',
                value,
                icon: type === 'expense' ? ArrowDownLeft : ArrowUpRight,
                heroGradient,
                heroDescription,
                tipCopy,
                topCategory,
                topTransaction,
                averagePerDay,
                averagePerTransaction,
                badgeLabel: transactionCount > 0 ? `${transactionCount} transaksi` : 'Belum ada transaksi',
                isPositive: type === 'income',
            };
        }

        const tipCopy =
            net >= 0
                ? 'Pindahkan surplus ke tabungan otomatis agar uangmu langsung bekerja.'
                : 'Tinjau ulang kategori terbesar dan pertimbangkan penyesuaian budget bulan depan.';

        return {
            ...baseSummary,
            title: 'Arus Kas Bersih',
            value: net,
            icon: Scale,
            heroGradient:
                net >= 0
                    ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500'
                    : 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400',
            heroDescription: 'Selisih antara pemasukan dan pengeluaran bulan ini.',
            badgeLabel: net >= 0 ? 'Surplus' : 'Defisit',
            tipCopy,
            isPositive: net >= 0,
        };
    }, [transactions, type]);

    const handleTxClick = (txId: string) => {
        router.push('/transactions');
    };

    if (type !== 'net' && summary.value === 0) {
        return (
            <PlaceholderContent
                label={`Ringkasan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? ArrowDownLeft : ArrowUpRight}
                text={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini.`}
            />
        );
    }

    const Icon = summary.icon as React.ElementType;
    const TopCategoryIcon = summary.topCategory?.icon as React.ElementType | undefined;

    return (
        <section className="space-y-6">
            <Card className={cn('relative overflow-hidden border-none text-white shadow-xl', summary.heroGradient)}>
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Icon className="h-40 w-40 rotate-12" />
                </div>
                <CardHeader className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="flex items-center gap-1.5 border-white/20 bg-white/15 text-white backdrop-blur px-3 py-1 font-medium text-[10px]">
                            <Calendar className="h-3.5 w-3.5" />
                            {summary.monthLabel}
                        </Badge>
                        <Badge
                            className={cn(
                                'border-none bg-white/20 text-white backdrop-blur font-medium text-[11px] px-3',
                                summary.type === 'net' && summary.isPositive && 'bg-teal-600/40',
                                summary.type === 'net' && !summary.isPositive && 'bg-destructive/40'
                            )}
                        >
                            {summary.badgeLabel}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-[11px] font-medium text-white/70">{summary.title}</CardTitle>
                        <div className="text-4xl md:text-5xl font-bold tracking-tight text-white tabular-nums">
                            <AnimatedCounter value={summary.value} />
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-white/90 max-w-[280px]">{summary.heroDescription}</p>
                </CardHeader>
                <CardContent className="space-y-6 pb-8 pt-0 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
                            <span>Laju Hari</span>
                            <span className="tabular-nums">
                                {summary.daysElapsed} / {summary.daysInMonth} Hari
                            </span>
                        </div>
                        <UIProgress
                            value={summary.monthProgress}
                            className="h-1.5 bg-white/20 border-none"
                            indicatorClassName="bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {summary.type === 'net' ? (
                            <>
                                <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 border border-white/10">
                                    <p className="text-[11px] font-medium text-white/50 mb-1">Pemasukan</p>
                                    <p className="text-base font-bold text-white tabular-nums">
                                        {formatCurrency(summary.netDetails.income)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 border border-white/10">
                                    <p className="text-[11px] font-medium text-white/50 mb-1">Pengeluaran</p>
                                    <p className="text-base font-bold text-white tabular-nums">
                                        {formatCurrency(summary.netDetails.expense)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 border border-white/10">
                                    <p className="text-[11px] font-medium text-white/50 mb-1">Per Hari</p>
                                    <p className="text-base font-bold text-white tabular-nums">
                                        {formatCurrency(summary.averagePerDay)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 border border-white/10">
                                    <p className="text-[11px] font-medium text-white/50 mb-1">Per Transaksi</p>
                                    <p className="text-base font-bold text-white tabular-nums">
                                        {formatCurrency(summary.averagePerTransaction)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {summary.type !== 'net' && summary.topCategory ? (
                <Card className="rounded-3xl border-none bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <div className={cn('rounded-2xl p-3 group-hover:scale-110 transition-transform duration-500', summary.topCategory.bgColor)}>
                            {TopCategoryIcon ? (
                                <TopCategoryIcon className={cn('h-6 w-6', summary.topCategory.color)} />
                            ) : null}
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Kategori Terbesar</CardTitle>
                            <p className="text-lg font-extrabold tracking-tight">{summary.topCategory.name}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-extrabold text-primary">
                                {formatCurrency(summary.topCategory.value)}
                            </p>
                            <Badge variant="outline" className="font-bold text-[11px] border-primary/20 text-primary">
                                {summary.topCategory.percentage.toFixed(1)}% TOTAL
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {summary.topTransaction ? (
                <Card
                    className="rounded-3xl border-none bg-card shadow-sm transition-all hover:shadow-md hover:bg-background cursor-pointer group"
                    onClick={() => handleTxClick(summary.topTransaction.id)}
                >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Transaksi Termahal</CardTitle>
                            <p className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                                {summary.topTransaction.description || 'Tanpa deskripsi'}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-muted/50 text-[11px] font-bold uppercase border-none">
                                    {summary.topTransaction.category}
                                </Badge>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {summary.topTransaction.date ? format(parseISO(summary.topTransaction.date), 'd MMM') : ''}
                                </span>
                            </div>
                            <span className="font-extrabold text-foreground">
                                {formatCurrency(summary.topTransaction.amount)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 shadow-none">
                <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary shadow-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Insight Lemon AI</p>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleGenerateInsight} 
                                disabled={isAiLoading} 
                                className="h-6 w-6 -mr-2 text-primary/60 hover:text-primary hover:bg-primary/10"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5", isAiLoading && "animate-spin")} />
                            </Button>
                        </div>
                        <div className="text-sm font-medium leading-relaxed text-foreground/80 min-h-[3rem] flex items-center">
                            <AnimatePresence mode="wait">
                                {isAiLoading ? (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, filter: "blur(4px)" }}
                                        className="flex items-center gap-2 text-primary/70"
                                    >
                                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                        <span>Sedang menganalisis keuanganmu...</span>
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key={aiInsight || summary.tipCopy}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {aiInsight || summary.tipCopy}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        {!aiInsight && !isAiLoading && (
                            <Button 
                                variant="link" 
                                onClick={handleGenerateInsight} 
                                className="h-auto p-0 text-xs text-primary mt-1 font-semibold"
                            >
                                Analisis dengan AI ✨
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};
