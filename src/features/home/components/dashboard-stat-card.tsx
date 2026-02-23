
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
    iconColor?: string;
    href?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, iconColor, href }: StatCardProps) => {
    const getBgColor = (colorClass: string) => {
        if (colorClass.includes('teal')) return 'bg-teal-100';
        if (colorClass.includes('destructive')) return 'bg-pink-100';
        return colorClass.replace('text-', 'bg-') + '/10';
    };

    const Content = (
        <Card className="hover:shadow-md transition-all duration-300 h-full border-none bg-card group rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium tracking-tight text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-1.5 rounded-md bg-muted group-hover:scale-110 transition-transform", getBgColor(color))}>
                    <Icon className={cn("h-3.5 w-3.5", iconColor || color)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-medium tracking-tight">
                    <AnimatedCounter value={value} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={cn(
                            "flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium tracking-tight",
                            trend === 'up' ? "bg-teal-50 text-teal-600" :
                            trend === 'down' ? "bg-pink-50 text-destructive" :
                            "bg-muted text-foreground/70"
                        )}>
                            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {trendValue}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium tracking-tight">vs bulan lalu</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                {Content}
            </Link>
        );
    }

    return Content;
};

