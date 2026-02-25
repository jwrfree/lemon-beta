'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import type { Transaction } from '@/types/models';

interface DashboardExpensePieProps {
    transactions: Transaction[];
}

const chartConfig = {
    value: {
        label: "Pengeluaran",
    },
    // We can add semantic labels for chart colors if needed, but for dynamic categories
    // we will assign colors directly in the data payload.
} satisfies ChartConfig;

export const DashboardExpensePie = ({ transactions }: DashboardExpensePieProps) => {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryMap: Record<string, number> = {};
        
        expenses.forEach(t => {
            const cat = t.category || 'Lainnya';
            categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => {
                const category = categoryDetails(name);
                // Extract color name from class like "text-yellow-600"
                const colorMatch = category.color.match(/text-([a-z]+)-/);
                const colorName = colorMatch ? colorMatch[1] : 'gray';
                
                return { 
                    name, 
                    value,
                    fill: `hsl(var(--${colorName}-500))` 
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [transactions]);

    const totalExpense = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    const topCategoryPercentage = data.length > 0 && totalExpense > 0
        ? ((data[0].value / totalExpense) * 100).toFixed(0)
        : 0;

    return (
        <Card className="border-none shadow-card bg-card rounded-lg flex flex-col h-full">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">Distribusi Pengeluaran</CardTitle>
                <CardDescription className="text-xs">Top 5 kategori pengeluaran</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[250px] relative pb-0">
                {data.length === 0 ? (
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Belum ada data pengeluaran.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip 
                                cursor={false} 
                                content={<ChartTooltipContent hideLabel />} 
                            />
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-medium"
                                                    >
                                                        {topCategoryPercentage}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Terbesar
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};

