'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { CalendarClock, ArrowRight } from '@phosphor-icons/react';

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
            <div className="mt-4 p-4 rounded-card bg-muted/20 border border-dashed border-border/50 text-center">
                <p className="text-xs text-muted-foreground">Tidak ditemukan transaksi berulang yang mencurigakan.</p>
            </div>
        );
    }

    return (
        <Card className="mt-4 bg-background border border-border/40 shadow-soft rounded-card overflow-hidden motion-surface">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-label font-semibold uppercase tracking-widest text-muted-foreground/60">Deteksi Langganan</span>
                    <CalendarClock size={16} weight="regular" className="text-primary" />
                </div>

                <div className="space-y-3">
                    {data.subscriptions.slice(0, 5).map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold capitalize truncate text-foreground/80">{sub.name}</span>
                                <span className="text-[9px] uppercase font-bold tracking-tighter text-muted-foreground/40">
                                    Muncul {sub.count}x • Terakhir {new Date(sub.last_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-foreground">{formatCurrency(sub.average_amount)}</p>
                                <p className="text-[8px] uppercase text-muted-foreground/30 font-bold">Rata-rata</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-[9px] text-muted-foreground/40 italic leading-tight pt-1">
                    Tip: Periksa pengeluaran ini di mutasi bank untuk memastikan langganan masih aktif dan dibutuhkan.
                </p>
            </CardContent>
        </Card>
    );
};
