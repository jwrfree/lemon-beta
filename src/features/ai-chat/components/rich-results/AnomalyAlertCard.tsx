'use client';

import type { AppAction } from '@/ai/chat-contract';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, CalendarX2, TrendingUp } from 'lucide-react';

type AnomalyAlertCardProps = {
    data?: {
        anomaly_type?: 'spike' | 'missing_recurring' | 'budget_trajectory';
        category?: string;
        description?: string;
        severity?: 'low' | 'medium' | 'high';
        current_value?: number;
        reference_value?: number;
        action?: AppAction | null;
        action_label?: string | null;
    } | null;
    onAction?: (action: AppAction) => void;
};

const severityStyles = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100',
    high: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100',
};

const typeMeta = {
    spike: { label: 'Lonjakan', icon: TrendingUp },
    missing_recurring: { label: 'Recurring hilang', icon: CalendarX2 },
    budget_trajectory: { label: 'Trajektori budget', icon: AlertTriangle },
};

export const AnomalyAlertCard = ({ data, onAction }: AnomalyAlertCardProps) => {
    if (!data?.anomaly_type || !data.description) {
        return (
            <div className="rounded-[24px] border border-border/60 bg-card p-4">
                <div className="text-sm font-semibold text-foreground">Alert anomali</div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Belum ada detail anomali yang cukup untuk ditampilkan.
                </p>
            </div>
        );
    }

    const meta = typeMeta[data.anomaly_type];
    const Icon = meta.icon;
    const severity = data.severity ?? 'low';

    return (
        <div className="rounded-[24px] border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl bg-muted p-2 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            {meta.label} {data.category ? `• ${data.category}` : ''}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {data.description}
                        </p>
                    </div>
                </div>
                <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityStyles[severity]}`}>
                    {severity.toUpperCase()}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-muted/50 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Saat ini</div>
                    <div className="mt-1 font-semibold text-foreground">{formatCurrency(data.current_value ?? 0)}</div>
                </div>
                <div className="rounded-2xl bg-muted/50 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Referensi</div>
                    <div className="mt-1 font-semibold text-foreground">{formatCurrency(data.reference_value ?? 0)}</div>
                </div>
            </div>

            {data.action && onAction && (
                <button
                    type="button"
                    onClick={() => onAction(data.action!)}
                    className="mt-4 inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                    {data.action_label?.trim() || 'Lihat tindak lanjut ->'}
                </button>
            )}
        </div>
    );
};
