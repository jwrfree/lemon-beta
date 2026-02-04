'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { groupTransactionsByCategory, getMonthlyTransactions } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

import type { Transaction } from '@/types/models';

const CategoryPieChart = dynamic(() => import('./lazy-charts').then(mod => mod.CategoryPieChart), {
    ssr: false,
    loading: () => <div className="mx-auto h-56 w-full max-w-[260px] animate-pulse rounded-full bg-muted" />
});

import { useIsMobile } from '@/hooks/use-mobile';

export const CategoryAnalysis = ({ type, transactions: manualTransactions }: { type: 'expense' | 'income', transactions?: Transaction[] }) => {
    const { transactions: hookTransactions } = useTransactions();
    const transactions = manualTransactions || hookTransactions;
    const router = useRouter();
    const isMobile = useIsMobile();

    const handleCategoryClick = (category: string) => {
        router.push(`/transactions?category=${encodeURIComponent(category)}`);
    };

    const { chartData, chartConfig, total } = useMemo(() => {
        // If manualTransactions provided, assume they are already filtered by date
        const relevantTransactions = manualTransactions 
            ? manualTransactions.filter(t => t.type === type)
            : getMonthlyTransactions(hookTransactions, type);

        if (relevantTransactions.length === 0) {
            return { chartData: [], chartConfig: {}, total: 0 };
        }

        const { chartData, total } = groupTransactionsByCategory(relevantTransactions, type);

        const chartConfig = Object.fromEntries(
            chartData.map((item) => [
                item.name,
                {
                    label: item.name,
                    color: item.fill,
                    icon: item.icon,
                },
            ])
        ) as ChartConfig;

        return { chartData, chartConfig, total };
    }, [hookTransactions, manualTransactions, type]);

    if (chartData.length === 0) {
        return (
            <PlaceholderContent
                label={`Distribusi ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? TrendingDown : TrendingUp}
                text={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini untuk dianalisis.`}
            />
        );
    }

    const sectionLabel = type === 'expense' ? 'Pengeluaran' : 'Pemasukan';

    return (
        <Card className="shadow-sm border-none rounded-xl sm:rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <div className="space-y-0.5 sm:space-y-1">
                    <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Distribusi per Kategori</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                        {`Top 5 ${sectionLabel.toLowerCase()} kamu.`}
                    </CardDescription>
                </div>
                <Badge variant="secondary" className="border-none bg-primary/10 text-primary font-bold tabular-nums text-[10px] sm:text-xs px-2 py-0.5">
                    {formatCurrency(total)}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 pt-0">
                <div className="flex flex-col items-center gap-4">
                    <CategoryPieChart chartData={chartData} chartConfig={chartConfig} />
                </div>
                <div className="space-y-2 sm:space-y-3">
                    {chartData.slice(0, 5).map((item) => {
                        const IconComponent = item.icon as React.ElementType | undefined;
                        return (
                            <button
                                key={item.name}
                                type="button"
                                className="group w-full rounded-xl border-none bg-muted/30 p-2.5 sm:p-3 text-left transition hover:bg-muted/50 active:scale-[0.98]"
                                onClick={() => handleCategoryClick(item.name)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-center gap-2 sm:gap-3">
                                        <div
                                            className={cn(
                                                "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg shadow-sm transition-all duration-300 group-hover:scale-110",
                                                item.categoryBgColor,
                                                item.categoryColor
                                            )}
                                        >
                                            {IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : null}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs sm:text-sm font-bold leading-tight">{item.name}</p>
                                            <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mt-0.5">
                                                {item.percentage.toFixed(1)}% TOTAL
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold tabular-nums">{formatCurrency(item.value)}</div>
                                </div>
                                <Progress
                                    value={item.percentage}
                                    className="mt-2 sm:mt-3 h-1 bg-muted/50"
                                    indicatorClassName={item.categoryColor.replace(/text-/g, 'bg-')}
                                />
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
