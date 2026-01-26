"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "@/types/models"

interface SpendingChartProps {
    transactions: Transaction[]
}

export function SpendingChart({ transactions }: SpendingChartProps) {
    const data = useMemo(() => {
        // Filter hanya pengeluaran (abaikan Income, Transfer, dll)
        const expenses = transactions.filter(t => 
            !['Income', 'Pemasukan', 'Transfer', 'Top Up'].includes(t.category)
        )
        
        // Group by Category
        const grouped = expenses.reduce((acc, curr) => {
            const cat = curr.category
            if (!acc[cat]) acc[cat] = 0
            acc[cat] += curr.amount
            return acc
        }, {} as Record<string, number>)

        // Format untuk Recharts & Sort Top 5
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [transactions])

    if (data.length === 0) return null

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Top Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                width={100}
                                className="text-xs font-medium text-muted-foreground"
                            />
                            <Tooltip 
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                                <span className="font-medium text-muted-foreground block mb-1">
                                                    {payload[0].payload.name}
                                                </span>
                                                <span className="font-bold text-foreground text-sm">
                                                    {formatCurrency(payload[0].value as number)}
                                                </span>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0D9488' : '#cbd5e1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}