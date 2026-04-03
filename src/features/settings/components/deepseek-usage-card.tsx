'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowClockwise, Lightning } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

interface BalanceInfo {
    currency: string;
    total_balance: string;
    granted_balance: string;
    topped_up_balance: string;
}

interface DeepSeekBalance {
    isAvailable: boolean;
    balanceInfos: BalanceInfo[];
}

function MetricBlock({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-muted/45 px-3 py-3">
            <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {label}
            </p>
            <p className="pt-1 text-title-md font-semibold tracking-tight text-foreground">{value}</p>
        </div>
    );
}

export const DeepSeekUsageCard = () => {
    const [balance, setBalance] = useState<DeepSeekBalance | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/deepseek/balance');
            if (!res.ok) {
                throw new Error('Gagal mengambil data saldo');
            }
            const data = await res.json();
            setBalance(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const userBalance = balance?.balanceInfos.find((item) => item.currency === 'CNY' || item.currency === 'USD');
    const totalBalance = userBalance ? parseFloat(userBalance.total_balance) : 0;
    const currency = userBalance?.currency || 'USD';
    const localEstimate = totalBalance * (currency === 'CNY' ? 2250 : 16100);
    const estimatedTokens = Math.floor(totalBalance / 0.0000002);
    const estimatedDays = Math.max(0, Math.floor(estimatedTokens / (5 * 800)));
    const progressWidth = Math.min((totalBalance / 10) * 100, 100);

    const getProgressColor = (amount: number) => {
        if (amount <= 0.5) return 'bg-destructive';
        if (amount <= 2.0) return 'bg-warning';
        return 'bg-accent';
    };

    return (
        <Card
            variant="default"
            className="overflow-hidden rounded-3xl border-border/50 bg-card shadow-elevation-2"
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 text-label-md font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            <Lightning className="h-3.5 w-3.5 text-accent" weight="regular" />
                            DeepSeek Balance
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-display-md font-bold tracking-tight text-foreground tabular-nums">
                                {currency === 'CNY' ? `CNY ${totalBalance.toFixed(2)}` : `$${totalBalance.toFixed(2)}`}
                            </p>
                            <span className="pb-1 text-label-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Tersisa
                            </span>
                        </div>
                        <p className="text-body-sm text-muted-foreground">
                            Perkiraan lokal {formatCurrency(localEstimate)}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchBalance}
                        disabled={isLoading}
                        className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Muat ulang saldo DeepSeek"
                    >
                        <ArrowClockwise
                            className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                            weight="regular"
                        />
                    </Button>
                </div>

                {error ? (
                    <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-body-sm text-destructive">
                        {error}
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-label-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                <span>Estimasi token tersisa</span>
                                <span className="text-foreground">{estimatedTokens.toLocaleString()}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                                <motion.div
                                    className={cn('h-full rounded-full', getProgressColor(totalBalance))}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressWidth}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <MetricBlock label="Rata-rata pemakaian" value="~4.000 token / hari" />
                            <MetricBlock label="Perkiraan habis" value={`~${estimatedDays} hari`} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
