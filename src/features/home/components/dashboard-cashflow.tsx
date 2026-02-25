
'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { format, eachDayOfInterval, subDays, differenceInCalendarDays, startOfDay, startOfMonth, subMonths, eachMonthOfInterval, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Transaction } from '@/types/models';

// Dynamically import DashboardChart to reduce initial bundle size
const DashboardChart = dynamic(() => import('./dashboard-chart'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-card" />
});

interface DashboardCashflowProps {
    transactions: Transaction[];
    chartRange: '30' | '90' | 'month';
    setChartRange: (range: '30' | '90' | 'month') => void;
}

export const DashboardCashflow = ({ transactions, chartRange, setChartRange }: DashboardCashflowProps) => {
    const now = useMemo(() => new Date(), []);

    const chartRangeDays = useMemo(() => {
        if (chartRange === '90') return 89;
        if (chartRange === 'month') return differenceInCalendarDays(now, startOfDay(startOfMonth(now)));
        return 29;
    }, [chartRange, now]);

    const chartData = useMemo(() => {
        // Handle monthly aggregation for '90' days (3 months) view
        if (chartRange === '90') {
            const months = eachMonthOfInterval({
                start: subMonths(now, 2), // Current month + 2 previous months
                end: now
            });

            return months.map(month => {
                const monthStr = format(month, 'MMM', { locale: dateFnsLocaleId });
                const monthTx = transactions.filter(t => isSameMonth(parseISO(t.date), month));
                
                const income = monthTx
                    .filter(t => t.type === 'income')
                    .reduce((acc, t) => acc + t.amount, 0);
                    
                const expense = monthTx
                    .filter(t => t.type === 'expense')
                    .reduce((acc, t) => acc + t.amount, 0);

                return {
                    label: monthStr,
                    date: format(month, 'yyyy-MM'), // Keep for uniqueness if needed
                    income,
                    expense
                };
            });
        }

        // Daily aggregation for 'month' and '30' days view
        const days = eachDayOfInterval({
            start: subDays(now, chartRangeDays),
            end: now
        });

        // Optimization: Create a lookup map for O(1) access
        const txMap: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(t => {
            const dateKey = t.date.split('T')[0]; // Extract YYYY-MM-DD
            if (!txMap[dateKey]) {
                txMap[dateKey] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                txMap[dateKey].income += t.amount;
            } else {
                txMap[dateKey].expense += t.amount;
            }
        });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const data = txMap[dateStr] || { income: 0, expense: 0 };
            return {
                label: format(day, 'd MMM', { locale: dateFnsLocaleId }),
                date: dateStr,
                income: data.income,
                expense: data.expense,
            };
        });
    }, [transactions, chartRange, chartRangeDays, now]);

    return (
        <Card className="border-none shadow-card bg-card rounded-card">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-medium">Arus Kas</CardTitle>
                        <CardDescription className="text-xs">
                            Pemasukan vs Pengeluaran
                        </CardDescription>
                    </div>
                    <Tabs value={chartRange} onValueChange={(v) => setChartRange(v as '30' | '90' | 'month')} className="w-auto">
                        <TabsList className="grid w-full grid-cols-3 h-9 p-1 bg-muted rounded-md">
                            <TabsTrigger value="month" className="h-full rounded-lg text-xs px-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">Bulan Ini</TabsTrigger>
                            <TabsTrigger value="30" className="h-full rounded-lg text-xs px-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">30 Hari</TabsTrigger>
                            <TabsTrigger value="90" className="h-full rounded-lg text-xs px-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">3 Bulan</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <DashboardChart data={chartData} />
            </CardContent>
        </Card>
    );
};

