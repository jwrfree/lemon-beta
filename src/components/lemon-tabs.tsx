'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface LemonTabsProps {
    value: string;
    onValueChange: (value: string) => void;
    tabs: {
        value: string;
        label: string;
        icon?: React.ReactNode;
    }[];
    className?: string;
    variant?: 'default' | 'sticky';
}

export const LemonTabs = ({
    value,
    onValueChange,
    tabs,
    className,
    variant = 'default'
}: LemonTabsProps) => {
    const content = (
        <div className={cn("w-full", variant === 'default' && className)}>
            <Tabs
                value={value}
                onValueChange={onValueChange}
                className="w-full max-w-md mx-auto"
            >
                <TabsList className="grid w-full bg-muted p-1 rounded-2xl h-14" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-full rounded-lg font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
                        >
                            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );

    if (variant === 'sticky') {
        return (
            <div className={cn("sticky top-0 z-20 border-b bg-background p-4 md:py-3", className)}>
                <div className="max-w-6xl mx-auto w-full">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

