'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, TrendingUp } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { DashboardCashflow } from '@/features/home/components/dashboard-cashflow';
import { DashboardExpensePie } from '@/features/home/components/dashboard-expense-pie';
import { ErrorBoundary } from '@/components/error-boundary';

export const InsightsPage = () => {
    const { transactions } = useData();
    const [chartRange, setChartRange] = useState<'30' | '90' | 'month'>('month');

    return (
        <div className="w-full h-full flex flex-col">
            <PageHeader 
                title="Insights & Analisis" 
                description="Pahami pola keuanganmu dengan bantuan AI"
                showBackButton={false}
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
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

                <Tabs defaultValue="cashflow" className="w-full">
                    <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full grid grid-cols-3">
                        <TabsTrigger value="cashflow" className="h-full rounded-xl font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Arus Kas</TabsTrigger>
                        <TabsTrigger value="spending" className="h-full rounded-xl font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="trends" className="h-full rounded-xl font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Tren Kategori</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="cashflow" className="mt-4">
                        <ErrorBoundary>
                            <DashboardCashflow 
                                transactions={transactions} 
                                chartRange={chartRange} 
                                setChartRange={setChartRange} 
                            />
                        </ErrorBoundary>
                    </TabsContent>
                    
                    <TabsContent value="spending" className="mt-4">
                        <DashboardExpensePie transactions={transactions} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};