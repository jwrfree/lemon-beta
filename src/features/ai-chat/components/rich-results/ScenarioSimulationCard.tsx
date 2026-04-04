'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { ChartBar, Calendar, Target, TrendUp, Warning } from '@/lib/icons';

interface ScenarioSimulationCardProps {
 data: {
 scenario_type: 'goal_achievement'| 'balance_projection'| 'savings_impact';
 goal_name?: string;
 remaining_amount?: number;
 months_to_reach?: number | null;
 is_possible?: boolean;
 current_balance?: number;
 projected_balance?: number;
 projection_months?: number;
 monthly_net?: number;
 total_growth?: number;
 };
}

export const ScenarioSimulationCard = ({ data }: ScenarioSimulationCardProps) => {
 if (data.scenario_type === 'goal_achievement') {
 const isReachable = data.is_possible && data.months_to_reach !== null;
 
 return (
 <Card className="mt-4 bg-background border border-border/15 shadow-sm rounded-card overflow-hidden motion-surface">
 <CardContent className="p-4 space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-label-sm text-muted-foreground/50">Simulasi Target</span>
 <Target size={16} weight="regular"className="text-primary"/>
 </div>

 <div className="space-y-3">
 <div>
 <p className="text-label-sm text-muted-foreground/45 mb-0.5">Nama Target</p>
 <p className="text-body-md ">{data.goal_name}</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-label-sm text-muted-foreground/45 mb-0.5">Sisa Kekurangan</p>
 <p className="text-body-md font-medium">{formatCurrency(data.remaining_amount || 0)}</p>
 </div>
 <div>
 <p className="text-label-sm text-muted-foreground/45 mb-0.5">Estimasi Waktu</p>
 <p className={cn("text-body-md ", isReachable ? "text-success": "text-destructive")}>
 {isReachable ?`${data.months_to_reach} Bulan` : 'Butuh Inflow Lebih'}
 </p>
 </div>
 </div>

 {!isReachable && (
 <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/10">
 <Warning size={14} weight="regular"className="text-destructive shrink-0 mt-0.5"/>
 <p className="text-label-sm leading-snug text-destructive/80 font-medium">
 Berdasarkan arus kas saat ini, target ini sulit tercapai. Coba kurangi pengeluaran atau tambah pemasukan.
 </p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="mt-4 bg-background border border-border/15 shadow-sm rounded-card overflow-hidden motion-surface">
 <CardContent className="p-4 space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-label-sm text-muted-foreground/50">Proyeksi Saldo</span>
 <TrendUp size={16} weight="regular"className="text-success"/>
 </div>

 <div className="space-y-4">
 <div className="flex items-end justify-between gap-4">
 <div className="space-y-1">
 <p className="text-label-sm text-muted-foreground/40 leading-none">Saldo Saat Ini</p>
 <p className="text-body-md font-medium">{formatCurrency(data.current_balance || 0)}</p>
 </div>
 <div className="h-8 w-px bg-border/30 mb-1"/>
 <div className="space-y-1 text-right">
 <p className="text-label-sm text-muted-foreground/40 leading-none">Setelah {data.projection_months} Bulan</p>
 <p className="text-title-lg tracking-tight text-primary">{formatCurrency(data.projected_balance || 0)}</p>
 </div>
 </div>

 <div className="p-3 rounded-2xl bg-muted/30 border border-border/5 space-y-2">
 <div className="flex justify-between items-center text-label-sm">
 <span className="text-muted-foreground/60 ">Pertumbuhan Bulanan</span>
 <span className={cn("", (data.monthly_net || 0) >= 0 ? "text-success": "text-destructive")}>
 {(data.monthly_net || 0) >= 0 ? '+': ''}{formatCurrency(data.monthly_net || 0)}
 </span>
 </div>
 <div className="flex justify-between items-center text-label-sm">
 <span className="text-muted-foreground/60 ">Total Akumulasi</span>
 <span className="text-foreground/80">
 {formatCurrency(data.total_growth || 0)}
 </span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};


