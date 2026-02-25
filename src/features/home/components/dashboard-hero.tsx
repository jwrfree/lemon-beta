
import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Shield, Clock, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/animated-counter';
import { cn } from '@/lib/utils';
import type { Wallet } from '@/types/models';

interface DashboardHeroProps {
    totalBalance: number;
    selectedWalletId: string;
    visibleWallets: Wallet[];
    lastRefreshed: Date;
    incomeTrend: { direction: 'up' | 'down' | 'flat'; value: string };
    expenseTrend: { direction: 'up' | 'down' | 'flat'; value: string };
    chartRange: '30' | '90' | 'month';
    setChartRange: (range: '30' | '90' | 'month') => void;
}

export const DashboardHero = ({
    totalBalance,
    selectedWalletId,
    visibleWallets,
    lastRefreshed,
    incomeTrend,
    expenseTrend,
    chartRange,
    setChartRange
}: DashboardHeroProps) => {
    return (
        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
            <Card className="col-span-2 border-none shadow-card bg-primary text-primary-foreground overflow-hidden relative rounded-lg">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Shield className="h-32 w-32" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xs font-medium text-primary-foreground/80 tracking-tight">Saldo Total</CardTitle>
                        <div className="text-3xl font-medium tracking-tight">
                            <AnimatedCounter value={totalBalance} />
                        </div>
                        <div className="mt-1 text-xs text-primary-foreground/70 font-medium max-w-[300px]">
                            <TrendingDown className="h-3 w-3 inline mr-1 opacity-70" />
                            Potensi menabungmu bulan ini meningkat 15%.
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs">
                        <span className="px-2 py-1 rounded-md bg-primary-foreground/15 text-primary-foreground/90 border border-primary-foreground/20">
                            {selectedWalletId === 'all' ? 'Semua dompet' : (visibleWallets[0]?.name || 'Dompet')}
                        </span>
                        <span className="text-primary-foreground/70 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Diperbarui {format(lastRefreshed, 'HH:mm')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center px-2 py-1 rounded-md text-xs font-medium tracking-tight",
                            incomeTrend.direction === 'flat' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-teal-600/20 text-teal-600'
                        )}>
                            {incomeTrend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                            {incomeTrend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                            {incomeTrend.value} vs bulan lalu
                        </div>
                        <div className={cn(
                            "flex items-center px-2 py-1 rounded-md text-xs font-medium tracking-tight",
                            expenseTrend.direction === 'flat' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-foreground/10 text-foreground'
                        )}>
                            {expenseTrend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                            {expenseTrend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                            {expenseTrend.value} pengeluaran
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" className="gap-1" asChild>
                        <Link href="/charts" aria-label="Lihat laporan grafik dan statistik">
                            Lihat Laporan <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="border-none shadow-card bg-card rounded-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rentang Data</CardTitle>
                    <CardDescription className="text-xs">Atur cakupan statistik & grafik</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Select value={chartRange} onValueChange={(v) => setChartRange(v as '30' | '90' | 'month')}>
                        <SelectTrigger aria-label="Pilih rentang data">
                            <SelectValue placeholder="Rentang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Bulan ini</SelectItem>
                            <SelectItem value="30">30 hari</SelectItem>
                            <SelectItem value="90">3 bulan</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                        Rentang ini mempengaruhi kartu ringkasan, grafik, dan daftar transaksi.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

