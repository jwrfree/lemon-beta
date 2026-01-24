
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import type { Transaction } from '@/types/models';

interface DashboardExpensePieProps {
    transactions: Transaction[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export const DashboardExpensePie = ({ transactions }: DashboardExpensePieProps) => {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryMap: Record<string, number> = {};
        
        expenses.forEach(t => {
            const cat = t.category || 'Lainnya';
            categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 categories
    }, [transactions]);

    const totalExpense = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className="border-none shadow-sm bg-card rounded-lg flex flex-col h-full">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-semibold">Distribusi Pengeluaran</CardTitle>
                <CardDescription className="text-xs">Top 5 kategori pengeluaran</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[250px] relative">
                {data.length === 0 ? (
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Belum ada data pengeluaran.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                            />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                <tspan x="50%" dy="-0.5em" fontSize="18" fontWeight="bold" fill="currentColor">
                                    {((data[0]?.value / totalExpense) * 100).toFixed(0)}%
                                </tspan>
                                <tspan x="50%" dy="1.5em" fontSize="10" fill="#888">
                                    Terbesar
                                </tspan>
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};
