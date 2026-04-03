'use client';

import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';
import { Target } from '@/lib/icons';

type GoalProgressCardProps = {
    data?: {
        name?: string;
        current?: number;
        target?: number;
        percent?: number;
        status?: 'on_track' | 'behind' | 'at_risk';
        projected_completion_date?: string | null;
        extra_per_month_needed?: number | null;
    } | null;
};

const statusStyles = {
    on_track: 'bg-emerald-500 text-white',
    behind: 'bg-amber-500 text-white',
    at_risk: 'bg-rose-500 text-white',
};

const statusCopy = {
    on_track: 'On track',
    behind: 'Perlu dorongan',
    at_risk: 'Berisiko',
};

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export const GoalProgressCard = ({ data }: GoalProgressCardProps) => {
    if (!data?.name || !data.target) {
        return (
            <EmptyState
                title="Goal belum lengkap"
                description="Lengkapi target dan nilai saat ini supaya progres goal bisa divisualisasikan."
                icon={Target}
                variant="filter"
                className="px-0 pt-0 md:min-h-0"
            />
        );
    }

    const percent = Math.max(0, Math.min(data.percent ?? ((data.current ?? 0) / data.target) * 100, 100));
    const status = data.status ?? 'on_track';

    return (
        <div className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-foreground">{data.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(data.current ?? 0)} dari {formatCurrency(data.target)}
                    </p>
                </div>
                <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-md font-semibold ${statusStyles[status]}`}>
                    {statusCopy[status]}
                </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{Math.round(percent)}%</span>
                <span className="text-muted-foreground">
                    {data.projected_completion_date
                        ? `Estimasi selesai ${formatDate(data.projected_completion_date)}`
                        : 'Estimasi selesai belum tersedia'}
                </span>
            </div>

            {status !== 'on_track' && (data.extra_per_month_needed ?? 0) > 0 && (
                <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    Perlu tambahan sekitar <strong>{formatCurrency(data.extra_per_month_needed ?? 0)}</strong> per bulan agar kembali sesuai target.
                </div>
            )}
        </div>
    );
};

