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
 <p className="text-label-sm text-muted-foreground">
 {label}
 </p>
 <p className="pt-1 text-title-md tracking-tight text-foreground">{value}</p>
 </div>
 );
}

export const DeepSeekUsageCard = () => {
  const [balance, setBalance] = useState<DeepSeekBalance | null>(null);
  const [usage, setUsage] = useState<{ avgDailyTokens: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [balanceRes, usageRes] = await Promise.all([
        fetch('/api/ai/deepseek/balance'),
        fetch('/api/ai/deepseek/usage')
      ]);

      if (!balanceRes.ok || !usageRes.ok) {
        throw new Error('Gagal mengambil data dari platform');
      }

      const [balanceData, usageData] = await Promise.all([
        balanceRes.json(),
        usageRes.json()
      ]);

      setBalance(balanceData);
      setUsage(usageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userBalance = balance?.balanceInfos?.find((item) => item.currency === 'CNY' || item.currency === 'USD');
  const totalBalance = userBalance ? parseFloat(userBalance.total_balance) : 0;
  const currency = userBalance?.currency || 'USD';

  // Constants
  const IDR_PER_USD = 16100;
  const IDR_PER_CNY = 2250;
  
  // Avg price per 1M tokens (DeepSeek V3 is roughly $0.14 input / $0.28 output)
  // Weighted avg for chat: $0.21 / 1M tokens OR 1.5 CNY / 1M tokens
  const TOKEN_PRICE_PER_M = currency === 'CNY' ? 1.5 : 0.21;
  const PRICE_PER_TOKEN = TOKEN_PRICE_PER_M / 1_000_000;

  const localEstimate = totalBalance * (currency === 'CNY' ? IDR_PER_CNY : IDR_PER_USD);
  const estimatedTokens = Math.floor(totalBalance / PRICE_PER_TOKEN);
  
  // Real platform average
  const avgDailyTokens = usage?.avgDailyTokens ?? 5000;
  const estimatedDays = Math.max(0, Math.floor(estimatedTokens / avgDailyTokens));
  
  // Progress bar logic: standard "full" is $10 or 100 CNY
  const progressMax = currency === 'CNY' ? 100 : 15;
  const progressWidth = Math.min((totalBalance / progressMax) * 100, 100);

  const getProgressColor = (amount: number, curr: string) => {
    const threshold = curr === 'CNY' ? 10 : 2;
    if (amount <= threshold) return 'bg-destructive/80';
    if (amount <= threshold * 3) return 'bg-amber-500/80';
    return 'bg-teal-500/80';
  };

  return (
    <Card
      variant="default"
      className="overflow-hidden border-zinc-200/50 dark:border-zinc-800/50"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-label-sm text-muted-foreground/70">
              <Lightning className="h-3.5 w-3.5 text-teal-500" weight="fill" />
              Sisa Saldo DeepSeek
            </div>
            <div className="flex items-end gap-2">
              <p className="text-display-md tracking-tight text-foreground tabular-nums">
                {currency === 'CNY' ? `CNY ${totalBalance.toFixed(2)}` : `$${totalBalance.toFixed(2)}`}
              </p>
              <span className="pb-1 text-label-sm text-muted-foreground/60">
                Ready
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground/80">
              Setara {formatCurrency(localEstimate)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
            aria-label="Refresh platform data"
          >
            <ArrowClockwise
              className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              weight="bold"
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
              <div className="flex items-center justify-between text-label-sm text-muted-foreground/70">
                <span>Estimasi sisa kapasitas</span>
                <span className="text-foreground font-medium">{estimatedTokens.toLocaleString()} token</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                <motion.div
                  className={cn('h-full rounded-full', getProgressColor(totalBalance, currency))}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 1, ease: 'circOut' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricBlock 
                label="Rata-rata rill" 
                value={`~${(avgDailyTokens / 1000).toFixed(1)}k / hari`} 
              />
              <MetricBlock 
                label="Prediksi habis" 
                value={estimatedDays > 365 ? '>1 tahun' : `~${estimatedDays} hari`} 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
