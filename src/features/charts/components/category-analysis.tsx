'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingDown, TrendingUp, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { groupTransactionsByCategory, groupTransactionsBySubCategory } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

import type { Transaction } from '@/types/models';

const CategoryPieChart = dynamic(() => import('./lazy-charts').then(mod => mod.CategoryPieChart), {
    ssr: false,
    loading: () => <div className="mx-auto h-56 w-full max-w-[260px] animate-pulse rounded-full bg-muted" />
});

import { useIsMobile } from '@/hooks/use-mobile';

export const CategoryAnalysis = ({ type, transactions, isLoading }: { type: 'expense' | 'income', transactions: Transaction[], isLoading?: boolean }) => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (category: string) => {
        if (selectedCategory) {
            // If already in sub-category view, verify if clicking does anything.
            // Maybe nothing for now, or filter transaction list?
        } else {
            setSelectedCategory(category);
        }
    };

    const handleBack = () => {
        setSelectedCategory(null);
    };

    const { chartData, chartConfig, total, isSubCategoryView } = useMemo(() => {
        // Assume transactions are already filtered by date
        // But for sub-category view, we rely on the utility to filter further by category name

        if (selectedCategory) {
            const { chartData, total } = groupTransactionsBySubCategory(transactions, type, selectedCategory);

            // Dynamic config for sub-categories
            const chartConfig = Object.fromEntries(
                chartData.map((item) => [
                    item.name,
                    {
                        label: item.name,
                        color: item.fill,
                        icon: undefined,
                    },
                ])
            ) as ChartConfig;

            return { chartData, chartConfig, total, isSubCategoryView: true };
        } else {
            const relevantTransactions = transactions.filter(t => t.type === type);

            if (relevantTransactions.length === 0) {
                return { chartData: [], chartConfig: {}, total: 0, isSubCategoryView: false };
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

            return { chartData, chartConfig, total, isSubCategoryView: false };
        }
    }, [transactions, type, selectedCategory]);

    if (isLoading) {
        return <div className="h-96 w-full animate-pulse rounded-card-glass bg-muted" />;
    }

    if (chartData.length === 0 && !selectedCategory) {
        return (
            <PlaceholderContent
                label={`Distribusi ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? TrendingDown : TrendingUp}
                text={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini untuk dianalisis.`}
            />
        );
    }

    const sectionLabel = type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
    const title = selectedCategory ? `Detail ${selectedCategory}` : 'Distribusi per Kategori';
    const subTitle = selectedCategory ? 'Breakdown sub-kategori' : `Top 5 ${sectionLabel.toLowerCase()} kamu.`;
    const parentVisuals = selectedCategory ? categoryDetails(selectedCategory) : null;

    return (
        <Card className="shadow-card border-none rounded-md sm:rounded-card overflow-hidden bg-card transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6 space-y-0">
                <div className="flex items-center gap-2">
                    {selectedCategory && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-full" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="space-y-0.5 sm:space-y-1">
                        <CardTitle className="text-base sm:text-lg font-medium tracking-tight flex items-center gap-2">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-xs">
                            {subTitle}
                        </CardDescription>
                    </div>
                </div>
                <Badge variant="secondary" className="border-none bg-primary/10 text-primary font-medium tabular-nums text-xs sm:text-xs px-2 py-0.5">
                    {formatCurrency(total)}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 pt-0">
                <div className="flex flex-col items-center gap-4 relative">
                    {/* Back button overlay on chart center? No, header back button is better. */}
                    <CategoryPieChart chartData={chartData} chartConfig={chartConfig} />
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {chartData.slice(0, 5).map((item) => {
                        const IconComponent = item.icon as React.ElementType | undefined;
                        // Use item color or parent color for sub-cats
                        const itemColor = isSubCategoryView ? item.fill : item.categoryColor;

                        return (
                            <button
                                key={item.name}
                                type="button"
                                className={cn(
                                    "group w-full rounded-md border-none bg-muted/30 p-2.5 sm:p-3 text-left transition hover:bg-muted/50 active:scale-[0.98]",
                                    isSubCategoryView && "cursor-default active:scale-100 hover:bg-muted/30"
                                )}
                                onClick={() => handleCategoryClick(item.name)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-center gap-2 sm:gap-3">
                                        <div
                                            className={cn(
                                                "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                                                !isSubCategoryView && "group-hover:scale-110",
                                                item.categoryBgColor,
                                                item.categoryColor
                                            )}
                                            style={isSubCategoryView ? { backgroundColor: item.fill + '20', color: item.fill } : undefined}
                                        >
                                            {IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs sm:text-sm font-medium leading-tight">{item.name}</p>
                                            <p className="text-xs sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mt-0.5">
                                                {item.percentage.toFixed(1)}% TOTAL
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium tabular-nums">{formatCurrency(item.value)}</div>
                                </div>
                                <Progress
                                    value={item.percentage}
                                    className="mt-2 sm:mt-3 h-1 bg-muted/50"
                                    indicatorClassName={item.categoryColor?.replace(/text-/g, 'bg-')}
                                    style={isSubCategoryView ? { backgroundColor: item.fill } : undefined}
                                />
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

