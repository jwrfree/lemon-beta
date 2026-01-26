import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, 
    TrendingUp, 
    AlertCircle, 
    CreditCard,
    CheckCircle2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { analyzeSubscriptions } from '@/lib/subscription-analysis';
import type { Transaction } from '@/types/models';

interface SubscriptionAuditCardProps {
    transactions: Transaction[];
}

export const SubscriptionAuditCard = ({ transactions }: SubscriptionAuditCardProps) => {
    const { totalMonthlyBurn, activeSubscriptions, anomalies } = useMemo(() => 
        analyzeSubscriptions(transactions), 
    [transactions]);

    if (activeSubscriptions === 0 && anomalies.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* 1. Monthly Burn Rate Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-indigo-500" />
                        Audit Langganan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-foreground">
                            {formatCurrency(totalMonthlyBurn)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ bulan</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="bg-background border-indigo-200 dark:border-indigo-800">
                            {activeSubscriptions} Layanan Aktif
                        </Badge>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                        Kamu menghabiskan setara dengan <span className="font-semibold text-foreground">{(totalMonthlyBurn / 25000).toFixed(0)}x kopi</span> sebulan hanya untuk langganan.
                        Pastikan semua terpakai ya!
                    </p>
                </CardContent>
            </Card>

            {/* 2. Silent Inflation Alerts */}
            <Card className="border-none shadow-sm bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Zap className="h-24 w-24 text-yellow-500" />
                </div>
                
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Deteksi Inflasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                    {anomalies.length > 0 ? (
                        <div className="space-y-2">
                            {anomalies.map((anomaly, idx) => (
                                <div 
                                    key={`${anomaly.merchantName}-${idx}`}
                                    className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 flex items-start gap-3"
                                >
                                    <div className="bg-rose-100 dark:bg-rose-800/50 p-1.5 rounded-full shrink-0 mt-0.5">
                                        <TrendingUp className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                                            Tagihan {anomaly.merchantName} naik!
                                        </p>
                                        <p className="text-[11px] text-rose-700 dark:text-rose-300/80 mt-0.5">
                                            Naik <span className="font-bold">{formatCurrency(anomaly.difference)}</span> dibanding bulan lalu. 
                                            (Sekarang: {formatCurrency(anomaly.currentAmount)})
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <p className="text-[10px] text-muted-foreground text-center pt-1">
                                Cek email kamu, mungkin ada pemberitahuan kenaikan harga.
                            </p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold">Aman terkendali</p>
                                    <p className="text-[10px] opacity-90">
                                        Tidak ada kenaikan harga langganan yang mencurigakan bulan ini.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};