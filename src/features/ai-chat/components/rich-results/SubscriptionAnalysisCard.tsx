'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CalendarCheck } from '@/lib/icons';

interface SubscriptionAnalysisCardProps {
 data: {
 subscriptions: Array<{
 name: string;
 count: number;
 average_amount: number;
 last_date: string;
 }>;
 };
}

export const SubscriptionAnalysisCard = ({ data }: SubscriptionAnalysisCardProps) => {
 if (!data.subscriptions || data.subscriptions.length === 0) {
 return (
 <div className="mt-4 p-4 rounded-card bg-muted/20 border border-dashed border-border/20 text-center">
 <p className="text-label-md text-muted-foreground">Tidak ditemukan transaksi berulang yang mencurigakan.</p>
 </div>
 );
 }

 return (
 <Card className="mt-4 bg-background border border-border/15 shadow-sm rounded-card overflow-hidden motion-surface">
 <CardContent className="p-4 space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-label text-muted-foreground/60">Deteksi Langganan</span>
 <CalendarCheck size={16} weight="regular"className="text-primary"/>
 </div>

 <div className="space-y-3">
 {data.subscriptions.slice(0, 5).map((sub, idx) => (
 <div key={idx} className="flex items-center justify-between group">
 <div className="flex flex-col min-w-0">
 <span className="text-label-md capitalize truncate text-foreground/80">{sub.name}</span>
 <span className="text-label tracking-tighter text-muted-foreground/40">
 Muncul {sub.count}x • Terakhir {new Date(sub.last_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric'})}
 </span>
 </div>
 <div className="text-right">
 <p className="text-label-md text-foreground">{formatCurrency(sub.average_amount)}</p>
 <p className="text-label text-muted-foreground/30 ">Rata-rata</p>
 </div>
 </div>
 ))}
 </div>

 <p className="text-label pt-1 italic leading-tight text-muted-foreground/40">
 Tip: Periksa pengeluaran ini di mutasi bank untuk memastikan langganan masih aktif dan dibutuhkan.
 </p>
 </CardContent>
 </Card>
 );
};

