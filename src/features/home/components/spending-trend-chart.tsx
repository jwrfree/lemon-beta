'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { TrendUp } from '@/lib/icons';
import { Transaction } from '@/types/models';
import { formatCurrency, triggerHaptic } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  days?: number;
}

const chartConfig = {
  amount: {
    label: "Pengeluaran",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

const formatShortValue = (value: number) => {
  if (value === 0) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.0', '')}jt`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
  return value.toString();
};

export const SpendingTrendChart = ({ transactions, days = 14 }: SpendingTrendChartProps) => {
  const data = useMemo(() => {
    const today = new Date('2026-03-28');
    const startDate = subDays(today, days - 1);

    // Generate all dates in range
    const dates = eachDayOfInterval({ start: startDate, end: today });

    return dates.map(date => {
      const dayTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        isSameDay(parseISO(t.date), date)
      );

      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(date, 'd MMM', { locale: id }),
        fullDate: format(date, 'yyyy-MM-dd'),
        amount: total
      };
    });
  }, [transactions, days]);

  // Safety check: if no transactions at all, we still show the empty grid
  if (!transactions) {
    return <Skeleton className="h-[240px] w-full rounded-card" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground/70 tracking-tight">
          Tren Pengeluaran
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-1 rounded-full">
          {days} Hari Terakhir
        </span>
      </div>
      
      <Card className="overflow-hidden rounded-3xl border border-border/15 bg-card">
        <CardContent className="p-4 pb-2">
          {transactions.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-border/20 rounded-xl bg-muted/5">
              <EmptyState 
                title="Belum Ada Tren"
                description="Catat pengeluaran untuk melihat grafik pertumbuhan."
                icon={TrendUp}
                variant="filter"
                className="md:min-h-0 pt-0"
              />
            </div>
          ) : (
            <ChartContainer 
              config={chartConfig} 
              className="h-[200px] w-full"
              onTouchStart={() => triggerHaptic('light')}
            >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                left: -15,
                right: 10,
                top: 10,
                bottom: 0
              }}
            >
              <CartesianGrid 
                vertical={false} 
                stroke="currentColor" 
                className="text-muted-foreground/[0.03]"
                strokeWidth={0.2}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={2}
                tickFormatter={(value) => value}
                fontSize={10}
                tick={{ fill: 'var(--muted-foreground)', opacity: 0.4 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={9}
                tickFormatter={formatShortValue}
                tick={{ fill: 'var(--muted-foreground)', opacity: 0.4 }}
                width={35}
                allowDecimals={false}
              />
                <ChartTooltip
                  cursor={{ fill: 'var(--destructive)', opacity: 0.05 }}
                  content={<ChartTooltipContent hideLabel indicator="dashed" formatter={(value) => formatCurrency(Number(value))} />}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                  activeBar={{ opacity: 1, fill: 'var(--destructive)' }}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
