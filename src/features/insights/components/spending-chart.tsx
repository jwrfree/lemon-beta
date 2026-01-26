"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { categoryDetails } from "@/lib/categories"
import type { Transaction } from "@/types/models"

interface SpendingChartProps {
    transactions: Transaction[]
}

const chartConfig = {
    value: {
        label: "Pengeluaran",
    },
    // We can add semantic labels for specific categories if we had a fixed list,
    // but for dynamic categories, the payload name is sufficient.
} satisfies ChartConfig

export function SpendingChart({ transactions }: SpendingChartProps) {
    const data = useMemo(() => {
        // Filter hanya pengeluaran (abaikan Income, Transfer, dll)
        const expenses = transactions.filter(t => 
            !['Income', 'Pemasukan', 'Transfer', 'Top Up'].includes(t.category) && t.type === 'expense'
        )
        
        // Group by Category
        const grouped = expenses.reduce((acc, curr) => {
            const cat = curr.category
            if (!acc[cat]) acc[cat] = 0
            acc[cat] += curr.amount
            return acc
        }, {} as Record<string, number>)

        // Format untuk Recharts & Sort Top 5 & Assign Colors
        return Object.entries(grouped)
            .map(([name, value]) => {
                const category = categoryDetails(name)
                // Extract color name from class like "text-yellow-600"
                const colorMatch = category.color.match(/text-([a-z]+)-/)
                const colorName = colorMatch ? colorMatch[1] : 'gray'

                return { 
                    name, 
                    value,
                    fill: `hsl(var(--${colorName}-500))`
                }
            })
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
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        layout="vertical"
                        margin={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                        }}
                    >
                        <XAxis type="number" hide dataKey="value" />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={100}
                            className="text-xs font-medium text-muted-foreground"
                        />
                        <ChartTooltip 
                            cursor={false} 
                            content={<ChartTooltipContent hideLabel />} 
                        />
                        <Bar dataKey="value" radius={5} layout="vertical" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}