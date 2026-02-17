
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    TrendingUp, 
    TrendingDown, 
    CalendarClock, 
    AlertTriangle, 
    ArrowRight,
    Target,
    Wallet
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { 
    subMonths, 
    isAfter, 
    isBefore, 
    parseISO, 
    differenceInMonths, 
    addMonths, 
    format 
} from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import type { Debt } from '@/types/models';

interface DebtAnalyticsCardProps {
    debts: Debt[];
}

export const DebtAnalyticsCard = ({ debts }: DebtAnalyticsCardProps) => {
    const analytics = useMemo(() => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const lastYear = subMonths(now, 12);

        // Filter only 'owed' debts (my debts)
        const myDebts = debts.filter(d => d.direction === 'owed');

        // 1. Current Total Debt
        const currentTotal = myDebts
            .filter(d => d.status !== 'settled')
            .reduce((acc, d) => acc + (d.outstandingBalance ?? 0), 0);

        // 2. Historical Calculation Helper
        const calculateHistoricalBalance = (targetDate: Date) => {
            return myDebts.reduce((acc, d) => {
                const startDate = d.startDate ? parseISO(d.startDate) : (d.createdAt ? parseISO(d.createdAt) : new Date(0));
                
                // If debt didn't exist yet, skip
                if (isAfter(startDate, targetDate)) return acc;

                // If debt was settled before target date, skip (balance was 0)
                // Wait, if it was settled, we need to check when it was settled. 
                // We don't have settledAt date easily, but we can assume if outstanding is 0 and last payment was before target...
                // Better approach: Reconstruct from Principal - Payments made before TargetDate
                
                const paymentsUntilTarget = d.payments?.filter(p => {
                    const pDate = p.paymentDate ? parseISO(p.paymentDate) : new Date(0);
                    return !isAfter(pDate, targetDate);
                }) || [];

                const totalPaidUntilTarget = paymentsUntilTarget.reduce((sum, p) => sum + p.amount, 0);
                
                // Estimate balance: Principal - Paid. 
                // Note: This ignores interest added, but it's the best approximation we have.
                // Clamp at 0 to avoid negative balance if data is messy.
                const estimatedBalance = Math.max(0, (d.principal ?? 0) - totalPaidUntilTarget);
                
                return acc + estimatedBalance;
            }, 0);
        };

        const lastMonthTotal = calculateHistoricalBalance(lastMonth);
        const lastYearTotal = calculateHistoricalBalance(lastYear);

        // 3. Trends
        const monthDiff = currentTotal - lastMonthTotal;
        const yearDiff = currentTotal - lastYearTotal;
        const isGrowing = monthDiff > 0;

        // 4. Projection
        // Calculate average monthly payment in last 3 months
        const threeMonthsAgo = subMonths(now, 3);
        const recentPayments = myDebts.flatMap(d => d.payments || [])
            .filter(p => {
                const pDate = p.paymentDate ? parseISO(p.paymentDate) : new Date(0);
                return isAfter(pDate, threeMonthsAgo);
            });
        
        const totalPaidRecent = recentPayments.reduce((sum, p) => sum + p.amount, 0);
        const avgMonthlyPayment = totalPaidRecent / 3;

        let estimatedMonthsToPayoff = 0;
        let payoffDate: Date | null = null;

        if (avgMonthlyPayment > 0 && currentTotal > 0) {
            estimatedMonthsToPayoff = Math.ceil(currentTotal / avgMonthlyPayment);
            payoffDate = addMonths(now, estimatedMonthsToPayoff);
        }

        // 5. Silent Growth Detection (Interest)
        // Check if any active debt has outstanding > principal (simple check)
        // or explicit interest rate
        const highInterestDebts = myDebts.filter(d => 
            (d.status !== 'settled') && 
            ((d.interestRate && d.interestRate > 0) || ((d.outstandingBalance ?? 0) > (d.principal ?? 0)))
        );

        return {
            currentTotal,
            lastMonthTotal,
            lastYearTotal,
            monthDiff,
            yearDiff,
            isGrowing,
            avgMonthlyPayment,
            estimatedMonthsToPayoff,
            payoffDate,
            highInterestDebts,
            hasDebts: myDebts.length > 0
        };
    }, [debts]);

    if (!analytics.hasDebts) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Trend Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Analisis Tren Hutang
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-medium text-foreground">
                            {formatCurrency(analytics.currentTotal)}
                        </span>
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                            analytics.isGrowing 
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" 
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}>
                            {analytics.isGrowing ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {analytics.monthDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(analytics.monthDiff))} vs bulan lalu
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Posisi Tahun Lalu</span>
                            <span className="font-medium">{formatCurrency(analytics.lastYearTotal)}</span>
                        </div>
                        <Progress 
                            value={analytics.currentTotal > analytics.lastYearTotal ? 100 : (analytics.currentTotal / (analytics.lastYearTotal || 1)) * 100} 
                            className="h-1.5"
                            indicatorClassName={analytics.isGrowing ? "bg-rose-500" : "bg-emerald-500"}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            {analytics.currentTotal < analytics.lastYearTotal 
                                ? "Bagus! Hutangmu berkurang dibanding tahun lalu." 
                                : "Waspada, total hutang meningkat dibanding tahun lalu."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Projection & Alerts Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Proyeksi & Insight
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Projection */}
                    <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Estimasi Lunas</p>
                                <p className="text-sm font-medium">
                                    {analytics.payoffDate 
                                        ? format(analytics.payoffDate, 'MMMM yyyy', { locale: dateFnsLocaleId }) 
                                        : "Belum ada pembayaran rutin"}
                                </p>
                            </div>
                        </div>
                        {analytics.avgMonthlyPayment > 0 && (
                            <p className="text-[10px] text-muted-foreground pl-11">
                                Dengan rata-rata pembayaran {formatCurrency(analytics.avgMonthlyPayment)}/bulan
                            </p>
                        )}
                    </div>

                    {/* Interest Warning */}
                    {analytics.highInterestDebts.length > 0 ? (
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-900/30">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-500">Peringatan Bunga</p>
                                    <p className="text-[10px] text-amber-600/90 dark:text-amber-500/90 mt-1">
                                        Ada {analytics.highInterestDebts.length} hutang yang mungkin bertambah "diam-diam" karena bunga atau denda.
                                        Cek: {analytics.highInterestDebts.map(d => d.title).join(', ')}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            Tidak ada indikasi hutang berbunga tinggi.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

