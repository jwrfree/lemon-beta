'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, TrendingUp } from 'lucide-react';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { startOfMonth, subDays, endOfDay, startOfDay } from 'date-fns';
import { DashboardCashflow } from '@/features/home/components/dashboard-cashflow';
import { DashboardExpensePie } from '@/features/home/components/dashboard-expense-pie';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoaderCircle } from 'lucide-react';

export const InsightsPage = () => {
    const [chartRange, setChartRange] = useState<'30' | '90' | 'month'>('month');
    
    const { startDate, endDate } = React.useMemo(() => {
        const now = new Date();
        const end = endOfDay(now);
        let start = startOfDay(startOfMonth(now));

        if (chartRange === '30') {
            start = startOfDay(subDays(now, 29));
        } else if (chartRange === '90') {
            start = startOfDay(subDays(now, 89));
        }

        return { startDate: start, endDate: end };
    }, [chartRange]);

    const { transactions, isLoading } = useRangeTransactions(startDate, endDate);

    return (
        <div className="w-full h-full flex flex-col">
            <PageHeader 
                title="Insights & Analisis" 
                description="Pahami pola keuanganmu dengan bantuan AI"
                showBackButton={false}
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {isLoading ? (
                    <div className="flex h-64 w-full items-center justify-center">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* AI Summary Section */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                                    <BrainCircuit className="h-5 w-5" />
                                    Analisis Mingguan AI
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Pengeluaranmu untuk kategori <strong>Makanan</strong> naik 15% minggu ini dibandingkan rata-rata bulan lalu. 
                                    Saran: Coba kurangi frekuensi makan di luar untuk 3 hari ke depan agar tetap sesuai budget.
                                </p>
                            </CardContent>
                        </Card>

                        <Tabs value={chartRange} onValueChange={(v) => setChartRange(v as '30' | '90' | 'month')} className="w-full">
                            <TabsList className="bg-muted p-1 rounded-card h-14 w-full grid grid-cols-3">
                                <TabsTrigger value="month" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">Bulan Ini</TabsTrigger>
                                <TabsTrigger value="30" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">30 Hari</TabsTrigger>
                                <TabsTrigger value="90" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950">90 Hari</TabsTrigger>
                            </TabsList>
                            
                            <div className="mt-6 space-y-6">
                                <ErrorBoundary>
                                    <DashboardCashflow 
                                        transactions={transactions} 
                                        chartRange={chartRange} 
                                        setChartRange={setChartRange} 
                                    />
                                </ErrorBoundary>
                                
                                <DashboardExpensePie transactions={transactions} />
                            </div>
                        </Tabs>
                    </>
                )}
            </div>
        </div>
    );
};
