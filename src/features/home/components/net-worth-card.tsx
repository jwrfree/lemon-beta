'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from '@/lib/icons';
import { AnimatedCounter } from '@/components/animated-counter';
import { HelpTooltip } from '@/components/help-tooltip';

interface NetWorthCardProps {
    totalAssets: number;
    totalLiabilities: number;
}

export const NetWorthCard = ({ totalAssets, totalLiabilities }: NetWorthCardProps) => {
    const netWorth = totalAssets - totalLiabilities;
    const isPositive = netWorth >= 0;
    const debtRatio = totalAssets > 0
        ? (totalLiabilities / totalAssets) * 100
        : (totalLiabilities > 0 ? 100 : 0);
    const [progress, setProgress] = useState(0);
    const [displayNetWorth, setDisplayNetWorth] = useState(0);

    const getStatusColor = (ratio: number) => {
        if (ratio <= 30) return { text: "text-success", bar: "bg-gradient-to-r from-success to-success/80" };
        if (ratio <= 60) return { text: "text-warning", bar: "bg-gradient-to-r from-warning to-warning/80" };
        return { text: "text-destructive", bar: "bg-gradient-to-r from-destructive to-destructive/80" };
    };

    const { text: textColor, bar: barColor } = getStatusColor(debtRatio);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(debtRatio), 500);
        setDisplayNetWorth(netWorth);
        return () => clearTimeout(timer);
    }, [debtRatio, netWorth]);

    return (
        <Card id="widget-net-worth" className="rounded-card bg-card/98 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Kekayaan Bersih (Net Worth)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-medium mb-4">
                    <AnimatedCounter value={displayNetWorth} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> Aset
                        </p>
                        <p className="text-sm font-medium text-success">
                            {formatCurrency(totalAssets)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Kewajiban
                        </p>
                        <p className="text-sm font-medium text-destructive">
                            {formatCurrency(totalLiabilities)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Rasio Hutang</span>
                            <HelpTooltip content="Persentase aset yang dibiayai oleh hutang." />
                        </div>
                        <span className={cn("font-medium", textColor)}>
                            {debtRatio.toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


