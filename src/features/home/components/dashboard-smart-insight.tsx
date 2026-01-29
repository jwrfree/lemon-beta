'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface DashboardSmartInsightProps {
    income: number;
    expense: number;
    net: number;
    hasTransactions: boolean;
}

export const DashboardSmartInsight = ({ 
    income, 
    expense, 
    net, 
    hasTransactions 
}: DashboardSmartInsightProps) => {
    if (!hasTransactions) {
        return (
            <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-4 w-4" />
                        AI Insight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Mulai catat transaksi kamu untuk mendapatkan analisis keuangan pintar dari AI.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    
    let insightMessage = "";
    let statusColor = "text-indigo-600 dark:text-indigo-400";
    let Icon = Sparkles;

    if (savingsRate > 20) {
        insightMessage = "Luar biasa! Kamu berhasil menyisihkan lebih dari 20% pendapatanmu bulan ini. Pertahankan kebiasaan menabung ini!";
        statusColor = "text-emerald-600 dark:text-emerald-400";
        Icon = TrendingUp;
    } else if (savingsRate > 0) {
        insightMessage = "Bagus! Arus kas kamu positif. Coba targetkan untuk menabung setidaknya 20% dari pendapatanmu.";
        statusColor = "text-blue-600 dark:text-blue-400";
        Icon = TrendingUp;
    } else if (savingsRate < 0) {
        insightMessage = "Waspada! Pengeluaranmu melebihi pendapatan. Periksa kembali kategori pengeluaran terbesarmu untuk penghematan.";
        statusColor = "text-rose-600 dark:text-rose-400";
        Icon = TrendingDown;
    } else {
        insightMessage = "Pendapatan dan pengeluaranmu seimbang. Coba cari peluang untuk meningkatkan tabunganmu.";
        statusColor = "text-amber-600 dark:text-amber-400";
        Icon = Minus;
    }

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm font-medium flex items-center gap-2", statusColor)}>
                    <Icon className="h-4 w-4" />
                    AI Smart Insight
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {insightMessage}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-indigo-500/10">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Savings Rate</span>
                    <span className={cn("text-xs font-bold", statusColor)}>
                        {savingsRate > 0 ? '+' : ''}{savingsRate.toFixed(1)}%
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
