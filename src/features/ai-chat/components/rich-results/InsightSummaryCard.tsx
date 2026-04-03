'use client';

import type { AppAction } from '@/ai/chat-contract';

type InsightItem = {
    icon?: string;
    title?: string;
    detail?: string;
    action?: AppAction | null;
};

type InsightSummaryCardProps = {
    data?: {
        period_label?: string;
        insights?: InsightItem[];
        cta_label?: string | null;
        cta_action?: AppAction | null;
    } | null;
    onAction?: (action: AppAction) => void;
};

export const InsightSummaryCard = ({ data, onAction }: InsightSummaryCardProps) => {
    const insights = data?.insights ?? [];

    if (insights.length === 0) {
        return (
            <div className="rounded-3xl border border-border/60 bg-card p-4">
                <div className="text-sm font-semibold text-foreground">Ringkasan insight</div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Belum ada insight bulanan yang cukup untuk diringkas.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-foreground">Ringkasan insight</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {data?.period_label?.trim() || 'Bulan ini'}
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                    <div key={`${insight.title ?? 'insight'}-${index}`} className="rounded-2xl bg-muted/40 px-3 py-2.5">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 text-base leading-none">{insight.icon || '•'}</div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground">
                                    {insight.title || 'Insight'}
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {insight.detail || 'Detail insight belum tersedia.'}
                                </p>
                                {insight.action && onAction && (
                                    <button
                                        type="button"
                                        onClick={() => onAction(insight.action!)}
                                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                                    >
                                        {'Lihat bagian ini ->'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data?.cta_action && onAction && (
                <button
                    type="button"
                    onClick={() => onAction(data.cta_action!)}
                    className="mt-4 inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                    {data.cta_label?.trim() || 'Lihat selengkapnya ->'}
                </button>
            )}
        </div>
    );
};
