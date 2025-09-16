"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { transactions, categories as allCategories } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const processData = () => {
    const expenseCategories: { [key: string]: number } = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expenseCategories[t.category]) {
                expenseCategories[t.category] = 0;
            }
            expenseCategories[t.category] += t.amount;
        });

    return Object.keys(expenseCategories).map(name => ({
        name,
        value: expenseCategories[name],
    }));
};

const chartData = processData();

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function CategorySpendChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Category Spending</CardTitle>
        <CardDescription>Breakdown of expenses by category this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
            </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
