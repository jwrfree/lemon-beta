import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TrendChart } from './TrendChart';
import { GoalProgressCard } from './GoalProgressCard';
import { AnomalyAlertCard } from './AnomalyAlertCard';
import { InsightSummaryCard } from './InsightSummaryCard';

describe('advanced AI chat rich components', () => {
    it('renders TrendChart with valid data and empty state', () => {
        const { rerender } = render(
            <TrendChart
                data={{
                    category: 'Makanan',
                    points: [
                        { month: '2025-11', amount: 250000 },
                        { month: '2025-12', amount: 300000 },
                        { month: '2026-01', amount: 280000 },
                        { month: '2026-02', amount: 340000 },
                        { month: '2026-03', amount: 360000 },
                        { month: '2026-04', amount: 420000 },
                    ],
                }}
            />
        );

        expect(screen.getByText('Tren Makanan')).toBeDefined();
        expect(screen.getByText('6 bulan terakhir')).toBeDefined();

        rerender(<TrendChart data={{ category: 'Makanan', points: [] }} />);
        expect(screen.getByText('Belum ada data tren kategori yang cukup untuk ditampilkan.')).toBeDefined();
    });

    it('renders GoalProgressCard with valid data and empty state', () => {
        const { rerender } = render(
            <GoalProgressCard
                data={{
                    name: 'Dana Darurat',
                    current: 4500000,
                    target: 12000000,
                    percent: 37.5,
                    status: 'behind',
                    projected_completion_date: '2026-12-01',
                    extra_per_month_needed: 500000,
                }}
            />
        );

        expect(screen.getByText('Dana Darurat')).toBeDefined();
        expect(screen.getByText('Perlu dorongan')).toBeDefined();

        rerender(<GoalProgressCard data={null} />);
        expect(screen.getByText('Lengkapi target dan nilai saat ini supaya progres goal bisa divisualisasikan.')).toBeDefined();
    });

    it('renders AnomalyAlertCard with valid data, action callback, and empty state', () => {
        const onAction = vi.fn();
        const { rerender } = render(
            <AnomalyAlertCard
                data={{
                    anomaly_type: 'spike',
                    category: 'Makanan',
                    description: 'Pengeluaran makan naik tajam bulan ini.',
                    severity: 'high',
                    current_value: 420000,
                    reference_value: 260000,
                    action_label: 'Buka dashboard ->',
                    action: { type: 'highlight', target: 'widget-financial-pulse' },
                }}
                onAction={onAction}
            />
        );

        fireEvent.click(screen.getByText('Buka dashboard ->'));
        expect(onAction).toHaveBeenCalledWith({ type: 'highlight', target: 'widget-financial-pulse' });

        rerender(<AnomalyAlertCard data={null} onAction={onAction} />);
        expect(screen.getByText('Belum ada detail anomali yang cukup untuk ditampilkan.')).toBeDefined();
    });

    it('renders InsightSummaryCard with valid data, CTA action, and empty state', () => {
        const onAction = vi.fn();
        const { rerender } = render(
            <InsightSummaryCard
                data={{
                    period_label: 'April 2026',
                    insights: [
                        {
                            icon: '!',
                            title: 'Budget makan menipis',
                            detail: 'Sisa ruang budget makan tinggal tipis untuk 2 minggu ke depan.',
                            action: { type: 'highlight', target: 'widget-budget-status' },
                        },
                    ],
                    cta_label: 'Lihat selengkapnya ->',
                    cta_action: { type: 'navigate', target: '/insights' },
                }}
                onAction={onAction}
            />
        );

        fireEvent.click(screen.getByText('Lihat bagian ini ->'));
        expect(onAction).toHaveBeenCalledWith({ type: 'highlight', target: 'widget-budget-status' });

        fireEvent.click(screen.getByText('Lihat selengkapnya ->'));
        expect(onAction).toHaveBeenCalledWith({ type: 'navigate', target: '/insights' });

        rerender(<InsightSummaryCard data={{ insights: [] }} onAction={onAction} />);
        expect(screen.getByText('Belum ada insight bulanan yang cukup untuk diringkas.')).toBeDefined();
    });
});
