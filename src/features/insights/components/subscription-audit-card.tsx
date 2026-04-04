import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
 CheckCircle,
 CircleNotch,
 CreditCard,
 Sparkle,
 TrendUp,
 WarningCircle,
} from '@/lib/icons';
import { formatCurrency } from '@/lib/utils';
import { analyzeSubscriptions } from '@/lib/subscription-analysis';
import type { Transaction } from '@/types/models';
import { auditSubscriptionsFlow } from '@/ai/flows/audit-subscriptions-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionAuditCardProps {
 transactions: Transaction[];
}

export const SubscriptionAuditCard = ({ transactions }: SubscriptionAuditCardProps) => {
  // Hydration Stability
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stable "now" for hydration consistency
  const now = useMemo(() => {
    if (!isMounted) return new Date(2026, 3, 5); // Fixed date for SSR/Hydration
    return new Date();
  }, [isMounted]);

  const summary = useMemo(() => analyzeSubscriptions(transactions, now), [transactions, now]);
  const { totalMonthlyBurn, activeSubscriptions, anomalies } = summary;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchAiInsight = async () => {
      if (isMounted && activeSubscriptions > 0 && !aiInsight && !isAiLoading) {
        setIsAiLoading(true);
        try {
          const text = await auditSubscriptionsFlow(summary);
          setAiInsight(text);
        } catch (error) {
          console.error('Failed to fetch AI subscription audit:', error);
          // Gracefully hide the AI section on failure
        } finally {
          setIsAiLoading(false);
        }
      }
    };

    fetchAiInsight();
  }, [isMounted, activeSubscriptions, summary, aiInsight, isAiLoading]);

 if (activeSubscriptions === 0 && anomalies.length === 0) {
 return (
 <div className="mb-8 flex items-center gap-5 rounded-card-premium bg-emerald-500/6 p-6 shadow-none border-none transition-all">
 <div className="bg-emerald-500/10 p-3 rounded-full shrink-0">
 <CheckCircle size={24} weight="regular" className="text-emerald-600"/>
 </div>
 <div className="flex-1">
 <h3 className="text-body-lg text-emerald-800 dark:text-emerald-200">Status Langganan Aman</h3>
 <p className="text-label-md text-emerald-600/70 font-medium leading-relaxed mt-0.5">
 Kami tidak mendeteksi adanya tagihan langganan aktif dari riwayat transaksi kamu. Semua aman!
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-4 mb-8">
 {/* AI Auditor Insight Pill */}
 {(aiInsight || isAiLoading) && (
 <div className="flex items-start gap-4 rounded-card-premium bg-primary/6 p-4 shadow-none border-none transition-all">
 <div className="bg-primary/10 p-2 rounded-card shrink-0">
 {isAiLoading ? (
 <CircleNotch size={16} weight="regular"className="text-primary animate-spin"/>
 ) : (
 <Sparkle size={16} weight="regular"className="text-primary"/>
 )}
 </div>
 <div className="flex-1">
 <p className="text-label text-primary mb-1">
 AI Subscription Auditor
 </p>
 {isAiLoading ? (
 <Skeleton className="mt-1 h-3 w-3/4 bg-primary/10"/>
 ) : (
 <p className="text-label-md text-foreground/80 leading-relaxed ">
 {aiInsight}
 </p>
 )}
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* 1. Monthly Burn Rate Card */}
 <Card className="rounded-card-premium bg-card overflow-hidden shadow-none border-none">
 <CardHeader className="pb-2 px-6 pt-6">
 <CardTitle className="text-label text-muted-foreground/60 flex items-center gap-2">
 <CreditCard size={14} weight="regular"className="text-indigo-500"/>
 Biaya Langganan
 </CardTitle>
 </CardHeader>
 <CardContent className="px-6 pb-6">
 <div className="flex items-baseline gap-2 mb-1">
 <span className="text-display-lg tracking-tighter text-foreground tabular-nums">
 {formatCurrency(totalMonthlyBurn)}
 </span>
 <span className="text-label text-muted-foreground/40">/ bln</span>
 </div>

 <div className="flex items-center gap-2 mt-3">
 <Badge variant="secondary"className="bg-muted/50 text-muted-foreground border-none text-label px-2 py-0.5 rounded-full">
 {activeSubscriptions} Layanan
 </Badge>
 </div>
 </CardContent>
 </Card>

 {/* 2. Silent Inflation Alerts */}
 <Card className="relative overflow-hidden rounded-card-premium bg-card shadow-none border-none">
 <CardHeader className="pb-2 px-6 pt-6">
 <CardTitle className="text-label text-muted-foreground/60 flex items-center gap-2">
 <WarningCircle size={14} weight="regular"className="text-amber-500"/>
 Status Harga
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 relative z-10 px-6 pb-6">
 {anomalies.length > 0 ? (
 <div className="space-y-2">
 {anomalies.map((anomaly, idx) => (
 <div
 key={`${anomaly.merchantName}-${idx}`}
 className="flex items-start gap-3 rounded-2xl bg-rose-500/6 p-3 shadow-none border-none"
 >
 <div className="bg-rose-500/10 p-1.5 rounded-full shrink-0 mt-0.5">
 <TrendUp size={12} weight="regular"className="text-rose-600 dark:text-rose-400"/>
 </div>
 <div>
 <p className="text-label text-rose-600 dark:text-rose-200 leading-tight">
 {anomaly.merchantName} naik!
 </p>
 <p className="text-label-md text-rose-500/80 mt-0.5 tracking-tighter tabular-nums">
 +{formatCurrency(anomaly.difference)} <span className="opacity-50 text-label tracking-normal">vs bulan lalu</span>
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="h-full flex flex-col justify-center py-2">
 <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/6 p-4 text-emerald-600 shadow-none border-none">
 <CheckCircle size={20} weight="regular"className="shrink-0 opacity-80"/>
 <div>
 <p className="text-label">Normal</p>
 <p className="text-label-md font-medium opacity-70">
 Biaya bulanan stabil.
 </p>
 </div>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
};
