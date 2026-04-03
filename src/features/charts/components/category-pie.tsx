'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, Sector, Label } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface MetricData {
    name: string;
    value: number;
}

interface CategoryPieProps {
    data: MetricData[];
    total: number;
    type: 'income' | 'expense';
}

const COLORS = [
    'hsl(var(--rose-500))',
    'hsl(var(--orange-500))',
    'hsl(var(--yellow-500))',
    'hsl(var(--emerald-500))',
    'hsl(var(--teal-500))',
    'hsl(var(--cyan-500))',
    'hsl(var(--blue-500))',
    'hsl(var(--indigo-500))',
    'hsl(var(--violet-500))',
    'hsl(var(--fuchsia-500))',
];

const INCOME_COLORS = [
    'hsl(var(--emerald-600))',
    'hsl(var(--emerald-500))',
    'hsl(var(--emerald-500) / 0.6)',
    'hsl(var(--emerald-500) / 0.3)',
];

// Config is required for ChartContainer, even if simple
const chartConfig = {
    amount: {
        label: "Jumlah",
    },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            {/* Center Labels with improved spacing */}
            <text 
                x={cx} 
                y={cy} 
                dy={-8} 
                textAnchor="middle" 
                fill={fill} 
                className="text-label"
            >
                {payload.name.length > 20 ? payload.name.slice(0, 18) + '...' : payload.name}
            </text>
            <text 
                x={cx} 
                y={cy} 
                dy={16} 
                textAnchor="middle" 
                fill="currentColor" 
                className="text-base font-semibold tabular-nums text-foreground/80"
            >
                {formatCurrency(value)}
            </text>

            {/* Main Active Sector */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={6}
            />
            
            {/* Subtle Inner Highlight Ring - Adjusted to be less intrusive */}
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 6}
                outerRadius={innerRadius - 2}
                fill={fill}
                fillOpacity={0.15}
                cornerRadius={2}
            />
        </g>
    );
};

export function CategoryPie({ data, total, type }: CategoryPieProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const palette = type === 'expense' ? COLORS : INCOME_COLORS;

    // Filter out very small values (less than 1%) to avoid clutter, unless list is short
    const chartData = data.length > 10 ? data.filter(d => (d.value / total) > 0.01) : data;

    if (total === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg bg-muted/20">
                Visual kategori akan muncul setelah ada transaksi
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[300px] w-full relative"
        >
            <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </motion.div>
    );
}

