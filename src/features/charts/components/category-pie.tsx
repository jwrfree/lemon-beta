'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    '#f43f5e', // rose-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6'  // blue-500
];

const INCOME_COLORS = [
    '#10b981', // emerald-500
    '#34d399', // emerald-400
    '#6ee7b7', // emerald-300
    '#a7f3d0', // emerald-200
];

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-xs font-medium uppercase tracking-wider">
                {payload.name}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#999" className="text-sm font-medium">
                {formatCurrency(value)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={4}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 8}
                outerRadius={innerRadius - 4}
                fill={fill}
                fillOpacity={0.2}
                cornerRadius={4}
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
            <div className="h-[250px] flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50">
                Belum ada data visual
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[300px] w-full relative"
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
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
            </ResponsiveContainer>
        </motion.div>
    );
}

