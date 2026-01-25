'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    iconClassName?: string;
}

export const HelpTooltip = ({ 
    content, 
    side = 'top', 
    className,
    iconClassName 
}: HelpTooltipProps) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div 
                        className={cn("inline-flex items-center justify-center cursor-help", className)}
                        role="button"
                        tabIndex={0}
                        aria-label="Info"
                    >
                        <Info className={cn("h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors", iconClassName)} />
                    </div>
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-[260px] text-xs font-normal">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};