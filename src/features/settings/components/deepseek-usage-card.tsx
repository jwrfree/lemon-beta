'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowClockwise, Lightning } from '@/lib/icons';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

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

    const userBalance = balance?.balanceInfos.find(b => b.currency === 'CNY' || b.currency === 'USD');
    const totalBalance = userBalance ? parseFloat(userBalance.total_balance) : 0;
    const currency = userBalance?.currency || 'USD';

    // DeepSeek V3 is roughly $0.20 per 1M tokens (mixed input/output)
    const estimatedTokens = Math.floor(totalBalance / 0.0000002);

    const getStatusColor = (amount: number) => {
        if (amount <= 0.5) return 'text-destructive';
        if (amount <= 2.0) return 'text-warning';
        return 'text-accent';
    };

    return (
        <Card className="border border-border/40 shadow-soft bg-card text-foreground overflow-hidden relative group rounded-[32px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] dark:opacity-10 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
                <CardTitle className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <Lightning className="h-3.5 w-3.5 text-accent" weight="fill" />
                    DeepSeek AI Balance
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchBalance}
                    disabled={isLoading}
                    className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full"
                >
                    <ArrowClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="regular" />
                </Button>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
                {error ? (
                    <div className="text-destructive text-xs text-center py-4 bg-destructive/10 rounded-2xl border border-destructive/20">
                        {error}
                        <Button variant="link" size="sm" onClick={fetchBalance} className="text-destructive text-xs h-auto p-0 ml-1 font-bold">Coba Lagi</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl md:text-4xl font-bold tracking-tighter tabular-nums">
                                    {currency === 'CNY' ? '¥' : '$'}
                                    {balance ? totalBalance.toFixed(2) : '...'}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">Tersisa</span>
                            </div>
                            {balance && (
                                <span className="text-xs font-bold text-muted-foreground/40 tracking-tight">
                                    ≈ {formatCurrency(totalBalance * (currency === 'CNY' ? 2250 : 16100))}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                    <span>Estimasi Token</span>
                                    <span className="text-foreground tracking-normal">{balance ? estimatedTokens.toLocaleString() : '...'}</span>
                                </div>
                                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20">
                                    <motion.div
                                        className={`h-full ${getStatusColor(totalBalance).replace('text-', 'bg-')}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((totalBalance / 10) * 100, 100)}%` }}
                                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Penggunaan Rata-rata</span>
                                    <span className="text-[10px] font-bold text-muted-foreground/70 tracking-tight">~4,000 Token / Hari</span>
                                </div>
                                <p className="text-[9px] font-bold text-primary uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                                    Habis dlm ~{Math.floor(estimatedTokens / (5 * 800))} hari
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Neon Decor */}
            <div className="absolute -right-12 -bottom-12 h-32 w-32 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-all duration-700" />
        </Card>
    );
};

