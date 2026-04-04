'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Heartbeat, SealCheck, WarningCircle, ShieldCheck } from '@/lib/icons';

interface FinancialHealthCardProps {
 data: {
 score: number; // 0-100
 labels: {
 savings_rate: string;
 emergency_fund: string;
 debt_ratio: string;
 };
 recommendations: string[];
 };
}

export const FinancialHealthCard = ({ data }: FinancialHealthCardProps) => {
 const getScoreColor = (score: number) => {
 if (score >= 80) return 'text-success';
 if (score >= 50) return 'text-warning';
 return 'text-destructive';
 };

 const getStatusLabel = (score: number) => {
 if (score >= 80) return 'Sehat';
 if (score >= 50) return 'Waspada';
 return 'Kritis';
 };

 return (
 <Card className="mt-4 bg-background border border-border/15 shadow-sm rounded-card overflow-hidden motion-surface">
 <CardContent className="p-4 space-y-5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Heartbeat size={18} weight="regular"className={getScoreColor(data.score)} />
 <span className="text-label text-muted-foreground/60">Kesehatan Finansial</span>
 </div>
 <div className={cn("px-2 py-0.5 rounded-full text-label-sm ", 
 data.score >= 80 ? "bg-success/10 text-success": 
 data.score >= 50 ? "bg-warning/10 text-warning": "bg-destructive/10 text-destructive")}>
 {getStatusLabel(data.score)}
 </div>
 </div>

 <div className="flex flex-col items-center justify-center py-2">
 <p className={cn("text-display-lg tracking-tighter", getScoreColor(data.score))}>{data.score}</p>
 <p className="text-label-sm text-muted-foreground/40 mt-1">Health Score</p>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <div className="text-center">
 <p className="text-label-sm text-muted-foreground/30 mb-1">Savings</p>
 <p className="text-label-sm truncate">{data.labels.savings_rate}</p>
 </div>
 <div className="text-center border-x border-border/10 px-1">
 <p className="text-label-sm text-muted-foreground/30 mb-1">Resilience</p>
 <p className="text-label-sm truncate">{data.labels.emergency_fund}</p>
 </div>
 <div className="text-center">
 <p className="text-label-sm text-muted-foreground/30 mb-1">Debt</p>
 <p className="text-label-sm truncate">{data.labels.debt_ratio}</p>
 </div>
 </div>

 <div className="space-y-2 pt-1 border-t border-border/10">
 <p className="text-label-sm text-muted-foreground/50 ">Saran Utama:</p>
 {data.recommendations.map((rec, idx) => (
 <div key={idx} className="flex gap-2 items-start">
 <ShieldCheck size={12} weight="regular"className="text-primary shrink-0 mt-0.5"/>
 <p className="text-label-sm leading-relaxed text-foreground/70">{rec}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
};


