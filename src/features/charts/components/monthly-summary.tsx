'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, isSameMonth, getDaysInMonth } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { PlaceholderContent } from './placeholder-content';
import { LoaderCircle, ArrowDownLeft, ArrowUpRight, Calendar, Scale, Sparkles, ArrowRight, RefreshCw, ChevronRight, Lightbulb, BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as UIProgress } from '@/components/ui/progress';
import { generateFinancialInsight, FinancialData } from '@/ai/flows/generate-insight-flow';
import { subMonths, isAfter, differenceInMonths } from 'date-fns';

import type { Transaction } from '@/types/models';

type TabValue = 'expense' | 'income' | 'net';

export const MonthlySummary = ({ type, transactions, isLoading }: { type: TabValue, transactions: Transaction[], isLoading?: boolean }) => {
    const router = useRouter();
    const { wallets } = useWallets();
    const isMobile = useIsMobile();
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const generateInsight = async () => {
        setIsAiLoading(true);
        try {
            const now = new Date();
            const relevantTransactions = transactions.filter((t) => isSameMonth(parseISO(t.date), now));

            const income = relevantTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = relevantTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const totalBalance = (wallets || []).reduce((sum, w) => sum + (w.balance || 0), 0);
            const totalDebt = transactions.filter(t => t.category === 'Hutang').reduce((sum, t) => sum + t.amount, 0);

            // Calculate debt change this month
            const debtTransactionsMonth = relevantTransactions.filter(t => t.category === 'Hutang');
            const debtChangeMonth = debtTransactionsMonth.reduce((sum, t) => sum + t.amount, 0);

            // Analyze for "Silent Growth" (debts increasing)
            const hasSilentGrowth = debtChangeMonth > 0;

            // Simple projection: if they keep paying average monthly amount, how long to clear?
            const averageMonthlyPayment = Math.abs(transactions
                .filter(t => t.category === 'Hutang' && t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0) / 12); // crude 12 month avg

            const projectedPayoffMonths = averageMonthlyPayment > 0 ? Math.ceil(totalDebt / averageMonthlyPayment) : 0;

            const topExpenseCategories = Object.entries(
                relevantTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + t.amount;
                        return acc;
                    }, {} as Record<string, number>)
            )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category, amount]) => ({ category, amount }));

            const data: FinancialData = {
                monthlyIncome: income,
                monthlyExpense: expense,
                totalBalance,
                topExpenseCategories,
                recentTransactionsCount: relevantTransactions.length,
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

        // Filter for current month
        const relevantTransactions = transactions.filter((t) => isSameMonth(parseISO(t.date), now));

        const incomeTransactions = relevantTransactions.filter((t) => t.type === 'income');
        const expenseTransactions = relevantTransactions.filter((t) => t.type === 'expense');

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
            topTransaction: null as null | Transaction,
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
                    icon: getCategoryIcon(details.icon),
                    color: details.color,
                    bgColor: details.bg_color,
                };
            }

            const topTransaction = transactionCount
                ? [...relevantTransactions].sort((a, b) => b.amount - a.amount)[0]
                : null;

            const averagePerTransaction = transactionCount > 0 ? value / transactionCount : 0;
            const averagePerDay = daysElapsed > 0 ? value / daysElapsed : 0;

            const heroGradient =
                type === 'expense'
                    ? 'bg-destructive'
                    : 'bg-primary';

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

    if (isLoading) {
        return <div className="h-40 w-full animate-pulse rounded-3xl bg-muted" />;
    }

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
        <section className="space-y-4 sm:space-y-6">
            <Card className={cn('relative overflow-hidden border-none text-white shadow-xl', summary.heroGradient)}>
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
                    <Icon className="h-24 w-24 sm:h-40 sm:w-40 rotate-12" />
                </div>
                <CardHeader className="space-y-4 sm:space-y-6 relative z-10 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="flex items-center gap-1.5 border-white/20 bg-white/20 text-white px-2 sm:px-3 py-0.5 sm:py-1 font-medium text-[9px] sm:text-[10px]">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {summary.monthLabel}
                        </Badge>
                        <Badge
                            className={cn(
                                'border-none bg-white/30 text-white font-medium text-[10px] sm:text-[11px] px-2 sm:px-3',
                                summary.type === 'net' && summary.isPositive && 'bg-teal-600/60',
                                summary.type === 'net' && !summary.isPositive && 'bg-destructive/60'
                            )}
                        >
                            {summary.badgeLabel}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-[10px] sm:text-[11px] font-medium text-white/70">{summary.title}</CardTitle>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white tabular-nums">
                            <AnimatedCounter value={summary.value} />
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-white/90 max-w-[280px]">{summary.heroDescription}</p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 pt-0 relative z-10 px-4 sm:px-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-white/60">
                            <span>Laju Hari</span>
                            <span className="tabular-nums">
                                {summary.daysElapsed} / {summary.daysInMonth} Hari
                            </span>
                        </div>
                        <UIProgress
                            value={summary.monthProgress}
                            className="h-1 sm:h-1.5 bg-white/20 border-none"
                            indicatorClassName="bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {summary.type === 'net' ? (
                            <>
                                <div className="rounded-lg bg-white/20 p-3 sm:p-4 border border-white/20">
                                    <p className="text-[10px] sm:text-[11px] font-medium text-white/50 mb-1">Pemasukan</p>
                                    <p className="text-sm sm:text-base font-semibold text-white tabular-nums leading-none">
                                        {formatCurrency(summary.netDetails.income)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white/20 p-3 sm:p-4 border border-white/20">
                                    <p className="text-[10px] sm:text-[11px] font-medium text-white/50 mb-1">Pengeluaran</p>
                                    <p className="text-sm sm:text-base font-semibold text-white tabular-nums leading-none">
                                        {formatCurrency(summary.netDetails.expense)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-lg bg-white/20 p-3 sm:p-4 border border-white/20">
                                    <p className="text-[10px] sm:text-[11px] font-medium text-white/50 mb-1">Per Hari</p>
                                    <p className="text-sm sm:text-base font-semibold text-white tabular-nums leading-none">
                                        {formatCurrency(summary.averagePerDay)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white/20 p-3 sm:p-4 border border-white/20">
                                    <p className="text-[10px] sm:text-[11px] font-medium text-white/50 mb-1">Per Transaksi</p>
                                    <p className="text-sm sm:text-base font-semibold text-white tabular-nums leading-none">
                                        {formatCurrency(summary.averagePerTransaction)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {summary.type !== 'net' && summary.topCategory ? (
                <Card className="rounded-2xl sm:rounded-3xl border-none bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-3 sm:pb-4 p-4 sm:p-6">
                        <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 transition-transform group-hover:scale-110", summary.topCategory.bgColor)}>
                            {TopCategoryIcon && <TopCategoryIcon className={cn("h-5 w-5 sm:h-6 sm:w-6", summary.topCategory.color)} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">Kategori Terbesar</CardTitle>
                            <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">{summary.topCategory.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg sm:text-xl font-black text-foreground tabular-nums leading-none">{summary.topCategory.percentage.toFixed(0)}%</p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Kontribusi</p>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span>Total di kategori ini</span>
                                <span className="text-foreground tabular-nums">{formatCurrency(summary.topCategory.value)}</span>
                            </div>
                            <UIProgress value={summary.topCategory.percentage} className="h-1.5 sm:h-2" />
                        </div>

                        {summary.topTransaction && (
                            <div
                                onClick={() => handleTxClick(summary.topTransaction!.id)}
                                className="group/item flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-muted-foreground/10"
                            >
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center border border-muted shadow-sm group-hover/item:rotate-12 transition-transform">
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tighter mb-0.5">Transaksi Terbesar</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{summary.topTransaction.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-extrabold text-foreground tabular-nums">{formatCurrency(summary.topTransaction.amount)}</p>
                                    <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">{format(parseISO(summary.topTransaction.date), 'd MMM')}</p>
                                </div>
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                                <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <p className="text-[11px] sm:text-xs text-primary/80 font-medium leading-relaxed">
                                {summary.tipCopy}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* AI INSIGHT SECTION */}
            <Card className="rounded-2xl sm:rounded-3xl border-none bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 shadow-sm border border-indigo-500/20 dark:border-indigo-500/30 overflow-hidden relative group">
                {/* Decorative background elements */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all duration-500"></div>

                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-2.5 bg-indigo-500 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 text-white animate-pulse">
                                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Financial Insight</CardTitle>
                                <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">Analisis cerdas pola keuanganmu</p>
                            </div>
                        </div>
                        {aiInsight && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={generateInsight}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isAiLoading && "animate-spin")} />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 relative z-10">
                    {!aiInsight ? (
                        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center space-y-3 sm:space-y-4">
                            <div className="p-3 sm:p-4 bg-white/50 dark:bg-zinc-900/50 rounded-full border border-indigo-100 dark:border-indigo-900/30 shadow-inner">
                                <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-semibold text-foreground">Butuh pandangan baru?</p>
                                <p className="text-[10px] sm:text-[11px] text-muted-foreground px-4">AI akan menganalisis transaksimu untuk memberikan rekomendasi yang dipersonalisasi.</p>
                            </div>
                            <Button
                                onClick={generateInsight}
                                disabled={isAiLoading}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-1.5 sm:py-2 h-auto text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                {isAiLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                        Menganalisis...
                                    </>
                                ) : (
                                    'Dapatkan Insight'
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="p-3 sm:p-5 bg-white/60 dark:bg-zinc-900/60 rounded-xl sm:rounded-2xl border border-white dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
                                        {aiInsight}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                                <AlertCircle className="h-3 w-3" />
                                Analisis AI mungkin tidak sepenuhnya akurat. Gunakan sebagai pertimbangan tambahan.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};
