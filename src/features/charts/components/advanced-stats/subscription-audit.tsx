'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Bell, AlertCircle, TrendingUp, CheckCircle2 } from '@/lib/icons';
import { formatCurrency, cn } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';

interface SubscriptionItem {
 id: string;
 name: string;
 amount: number;
 category: string;
 isDueSoon?: boolean;
}

interface SubscriptionAuditProps {
 items: SubscriptionItem[];
 totalMonthly: number;
}

export function SubscriptionAudit({ items, totalMonthly }: SubscriptionAuditProps) {
 return (
 <Card className="p-7 border-none rounded-card-glass bg-card shadow-none border border-border/15 relative overflow-hidden group">
 {/* Ambient Background Ornament */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 rounded-full blur-2xl -z-0"/>

 <div className="flex justify-between items-start mb-10 relative z-10">
 <div className="space-y-1">
 <h3 className="text-label text-muted-foreground/40 flex items-center gap-2">
 <RefreshCcw className="w-3.5 h-3.5"/>
 Audit biaya rutin
 </h3>
 <p className="text-display-sm tracking-tight text-foreground/90">Beban Tetap Bulanan</p>
 </div>
 <div className="text-right">
 <p className="text-display-md tracking-tighter tabular-nums text-foreground/90">
 {formatCurrency(totalMonthly)}
 </p>
 <p className="text-label text-muted-foreground/30">Per siklus tagihan</p>
 </div>
 </div>

 <div className="space-y-4 relative z-10">
 {items.length > 0 ? (
 items.map((item) => (
 <div
 key={item.id}
 className={cn(
 "group/item flex items-center justify-between p-4 rounded-card-glass border transition-all duration-300",
 item.isDueSoon
 ? "bg-error/5 border-error/20"
 : "bg-secondary/40 border-border/10 hover:bg-secondary/60 hover:border-border/30"
 )}
 >
 <div className="flex items-center gap-4">
 <div className={cn(
 "h-11 w-11 rounded-xl flex items-center justify-center transition-colors duration-300",
 item.isDueSoon ? "bg-error/10": "bg-muted group-hover/item:bg-muted/80"
 )}>
 <Bell className={cn("h-5 w-5", item.isDueSoon ? "text-error": "text-muted-foreground/60")} />
 </div>
 <div>
 <p className="text-body-md tracking-tight text-foreground/80">{item.name}</p>
 <p className="text-label text-muted-foreground/40">{item.category}</p>
 </div>
 </div>
 <div className="text-right space-y-1">
 <p className="text-body-md tabular-nums text-foreground/90">{formatCurrency(item.amount)}</p>
 {item.isDueSoon && (
 <Badge className="text-label px-1.5 py-0.5 border-none bg-error/10 text-error rounded-full">
 Segera
 </Badge>
 )}
 </div>
 </div>
 ))
 ) : (
 <EmptyState
 title="Audit Bersih"
 description="Tidak ada item rutin terdeteksi. Keuangan kamu aman dari pengeluaran berulang!"
 icon={CheckCircle2}
 variant="default"
 className="py-12 border-dashed bg-muted/5 group-hover:bg-muted/10 transition-colors"
 />
 )}
 </div>

 {totalMonthly > 0 && (
 <div className="mt-8 p-5 rounded-card-glass bg-success/5 border border-success/10 flex items-center gap-4 group/tip hover:bg-success/10 transition-colors cursor-default animate-in fade-in slide-in-from-top-4 duration-500">
 <TrendingUp className="h-5 w-5 text-success group-hover/tip:scale-110 transition-transform"/>
 <p className="text-label-md text-success/60 leading-relaxed">
 Tips efisiensi: Batalkan satu langganan tak terpakai untuk berhemat <span className="text-success">{formatCurrency(totalMonthly * 12)}</span> per tahun.
 </p>
 </div>
 )}
 </Card>
 );
}




