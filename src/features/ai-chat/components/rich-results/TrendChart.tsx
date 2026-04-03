'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from '@/lib/icons';

type TrendPoint = {
    month: string;
    amount: number;
};

type TrendChartProps = {
    data?: {
        category?: string;
        points?: TrendPoint[];
    } | null;
};

const monthLabel = (value: string) => {
    if (!value) return '-';
    const parsed = new Date(`${value}-01T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('id-ID', { month: 'short' });
};

const buildSparklinePath = (points: TrendPoint[], width: number, height: number) => {
    if (points.length === 0) return '';

    const amounts = points.map((point) => point.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const range = Math.max(max - min, 1);

    return points
        .map((point, index) => {
            const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
            const normalizedY = (point.amount - min) / range;
            const y = height - normalizedY * height;
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
};

const resolveTrend = (points: TrendPoint[]) => {
    if (points.length < 2) {
        return { label: 'Belum cukup data', icon: Minus };
    }

    const previous = points[points.length - 2]?.amount ?? 0;
    const current = points[points.length - 1]?.amount ?? 0;
    const delta = current - previous;

    if (Math.abs(delta) < Math.max(previous * 0.05, 1000)) {
        return { label: 'Stabil vs bulan lalu', icon: Minus };
    }

    if (delta > 0) {
        return { label: 'Naik vs bulan lalu', icon: TrendingUp };
    }

    return { label: 'Turun vs bulan lalu', icon: TrendingDown };
};

export const TrendChart = ({ data }: TrendChartProps) => {
    const points = data?.points ?? [];
    const path = buildSparklinePath(points, 240, 72);
    const trend = resolveTrend(points);
    const TrendIcon = trend.icon;

    if (points.length === 0) {
        return (
            <div className="rounded-3xl border border-border/60 bg-card p-4">
                <div className="text-sm font-semibold text-foreground">Trend pengeluaran</div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Belum ada data tren kategori yang cukup untuk ditampilkan.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-foreground">
                        Tren {data?.category ?? 'kategori'}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        6 bulan terakhir
                    </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-label-md font-semibold text-muted-foreground">
                    <TrendIcon className="h-3.5 w-3.5" />
                    {trend.label}
                </div>
            </div>

            <div className="mt-4 rounded-2xl bg-muted/40 p-3">
                <svg viewBox="0 0 240 72" className="h-[72px] w-full overflow-visible">
                    <path
                        d={path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-primary"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="mt-2 grid grid-cols-3 gap-2 text-label-md text-muted-foreground sm:grid-cols-6">
                    {points.map((point) => (
                        <div key={point.month} className="rounded-xl bg-background/80 px-2 py-1.5">
                            <div className="font-semibold text-foreground">{monthLabel(point.month)}</div>
                            <div>{formatCurrency(point.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


