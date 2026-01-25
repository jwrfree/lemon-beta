'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/help-tooltip';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';

interface StatusBadgeProps {
    variant?: StatusBadgeVariant;
    children: React.ReactNode;
    tooltip?: React.ReactNode;
    className?: string;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
    default: "bg-primary/10 text-primary hover:bg-primary/20 border-transparent",
    success: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent",
    warning: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-transparent",
    error: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent",
    neutral: "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent",
    outline: "text-foreground border-border",
};

export const StatusBadge = ({ 
    variant = 'default', 
    children, 
    tooltip, 
    className 
}: StatusBadgeProps) => {
    return (
        <Badge 
            variant="outline" 
            className={cn("gap-1.5 pr-2.5 font-medium transition-colors", variantStyles[variant], className)}
        >
            {children}
            {tooltip && (
                <HelpTooltip 
                    content={tooltip} 
                    iconClassName={cn(
                        "h-3 w-3 transition-opacity", 
                        variant === 'outline' ? "text-muted-foreground" : "text-current opacity-60 hover:opacity-100"
                    )} 
                />
            )}
        </Badge>
    );
};