'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { formatCurrency, cn } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { groupTransactionsByCategory, getMonthlyTransactions } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

const CategoryPieChart = dynamic(() => import('./lazy-charts').then(mod => mod.CategoryPieChart), {
    ssr: false,
    loading: () => <div className="mx-auto h-56 w-full max-w-[260px] animate-pulse rounded-full bg-muted" />
});

export const CategoryAnalysis = ({ type }: { type: 'expense' | 'income' }) => {
    const { transactions } = useData();
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/transactions?category=${encodeURIComponent(category)}`);
    };

    const { chartData, chartConfig, total } = useMemo(() => {
        const monthlyTransactions = getMonthlyTransactions(transactions, type);

        if (monthlyTransactions.length === 0) {
            return { chartData: [], chartConfig: {}, total: 0 };
        }

        const { chartData, total } = groupTransactionsByCategory(monthlyTransactions, type);

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
    }, [transactions, type]);

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
        <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distribusi per Kategori</CardTitle>
                <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-sm font-medium text-foreground">
                        {`Top 5 ${sectionLabel.toLowerCase()} kamu.`}
                    </CardDescription>
                    <Badge variant="secondary" className="border-none bg-primary/10 text-primary font-extrabold">
                        {formatCurrency(total)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <CategoryPieChart chartData={chartData} chartConfig={chartConfig} />
                </div>
                <div className="space-y-3">
                    {chartData.slice(0, 5).map((item) => {
                        const IconComponent = item.icon as React.ElementType | undefined;
                        return (
                            <button
                                key={item.name}
                                type="button"
                                className="group w-full rounded-2xl border-none bg-background/40 p-3 text-left transition hover:bg-background/80 active:scale-[0.98]"
                                onClick={() => handleCategoryClick(item.name)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110",
                                                item.categoryBgColor,
                                                item.categoryColor
                                            )}
                                        >
                                            {IconComponent ? <IconComponent className="h-5 w-5" /> : null}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold">{item.name}</p>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                                {item.percentage.toFixed(1)}% TOTAL
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                                </div>
                                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${Math.min(100, item.percentage)}%`,
                                            background: item.fill,
                                        }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
