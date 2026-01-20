
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/animated-counter';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    color: string;
    href?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, href }: StatCardProps) => {
    const Content = (
        <Card className="hover:shadow-md transition-all duration-300 h-full border-none bg-card/50 backdrop-blur-sm group rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-1.5 rounded-xl bg-muted group-hover:scale-110 transition-transform", color.replace('text-', 'bg-') + '/10')}>
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-extrabold tracking-tight">
                    <AnimatedCounter value={value} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={cn(
                            "flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            trend === 'up' ? "bg-success/15 text-success" :
                            trend === 'down' ? "bg-destructive/15 text-destructive" :
                            "bg-muted text-foreground/70"
                        )}>
                            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {trendValue}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">vs bulan lalu</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
                {Content}
            </Link>
        );
    }

    return Content;
};
