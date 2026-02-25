'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Zap, TrendingUp, DollarSign } from 'lucide-react';
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
    // So $1.00 is ~5,000,000 tokens
    const estimatedTokens = Math.floor(totalBalance / 0.0000002);

    const getStatusColor = (amount: number) => {
        if (amount <= 0.5) return 'text-error';
        if (amount <= 2.0) return 'text-amber-500';
        return 'text-emerald-500';
    };

    return (
        <Card className="border-none shadow-card bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white overflow-hidden relative group rounded-lg">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-indigo-200/70 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
                    DeepSeek AI Balance
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchBalance}
                    disabled={isLoading}
                    className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="relative z-10">
                {error ? (
                    <div className="text-error text-xs text-center py-4 bg-error-surface rounded-lg">
                        {error}
                        <Button variant="link" size="sm" onClick={fetchBalance} className="text-error text-xs h-auto p-0 ml-1">Coba Lagi</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-medium tracking-tighter">
                                    {currency === 'CNY' ? '¥' : '$'}
                                    {balance ? totalBalance.toFixed(2) : '...'}
                                </span>
                                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-widest opacity-60">tersisa</span>
                            </div>
                            {balance && (
                                <span className="text-sm font-semibold text-indigo-200/50 tracking-tight">
                                    ≈ {formatCurrency(totalBalance * (currency === 'CNY' ? 2250 : 16100))}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-indigo-300/80">
                                <span>Estimasi Token</span>
                                <span>{balance ? estimatedTokens.toLocaleString() : '...'}</span>
                            </div>
                            <div className="flex justify-between text-xs text-indigo-400/50 font-semibold uppercase tracking-widest">
                                <span>Penggunaan Harian</span>
                                <span>~4,000 Token</span>
                            </div>
                            {/* Simple Progress Bar (assuming $10 is "full" just for visual) */}
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${getStatusColor(totalBalance).replace('text-', 'bg-')}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((totalBalance / 10) * 100, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-xs text-indigo-400/60 text-right pt-1 font-semibold uppercase tracking-widest">
                                Estimasi habis dlm ~{Math.floor(estimatedTokens / (5 * 800))} hari lagi (5 tx/hari)
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Decor */}
            <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
        </Card>
    );
};
