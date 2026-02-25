'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    /**
     * Main heading - max 6 words recommended
     */
    title: string;
    
    /**
     * Supporting description - short and actionable
     */
    description: string;
    
    /**
     * CTA button label (optional)
     */
    actionLabel?: string;
    
    /**
     * CTA button click handler (optional)
     */
    onAction?: () => void;
    
    /**
     * Icon to display - defaults based on variant if not provided
     */
    icon?: LucideIcon;
    
    /**
     * Variant affects styling and default icon
     * - default: First-time user state (primary accent)
     * - filter: No results from filtering/search (neutral)
     * - error: Error state (destructive)
     */
    variant?: 'default' | 'filter' | 'error';
    
    /**
     * Additional class names for customization
     */
    className?: string;
}

/**
 * EmptyState Component
 * 
 * Reusable component for displaying empty states across the application.
 * Follows design system guidelines for mobile and desktop layouts.
 * 
 * Design Rules:
 * - Mobile: top-aligned with generous spacing
 * - Desktop: vertically centered in container (min-h-[460px])
 * - Max width readable with constraints on title and description
 * - Consistent spacing tokens
 * - Follows card hierarchy with rounded-card (24px)
 * - Fixed heights prevent layout shift
 * 
 * Tone Guidelines:
 * - Clear, calm, not playful
 * - Action-oriented
 * - No blame language
 * - Short headline (max 6 words)
 * - One primary CTA only
 */
export const EmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
    icon: Icon,
    variant = 'default',
    className
}: EmptyStateProps) => {
    // Variant-specific styling
    const variantStyles = {
        default: {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            buttonVariant: 'default' as const,
        },
        filter: {
            iconBg: 'bg-muted',
            iconColor: 'text-muted-foreground',
            buttonVariant: 'outline' as const,
        },
        error: {
            iconBg: 'bg-destructive/10',
            iconColor: 'text-destructive',
            buttonVariant: 'destructive' as const,
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className={cn(
            // Mobile: top-aligned with padding
            "flex items-start justify-center pt-12 px-6",
            // Desktop: vertically centered with consistent min-height
            "md:items-center md:pt-0 md:min-h-[460px]",
            className
        )}>
            <Card className={cn(
                // Max width for readability
                "max-w-[320px] md:max-w-md w-full",
                // Card hierarchy - align with card token (24px)
                "border-none rounded-card",
                "shadow-card bg-card",
                // Overflow for background decoration
                "relative overflow-hidden"
            )}>
                {/* Background decoration - subtle watermark with fixed height to prevent layout shift */}
                {Icon && (
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 h-[160px] w-[160px] flex items-center justify-center">
                        <Icon className="h-40 w-40" />
                    </div>
                )}

                <CardContent className={cn(
                    // Generous mobile spacing, standard desktop spacing
                    "p-7 md:p-8",
                    // Centered content
                    "flex flex-col items-center text-center",
                    // Relative positioning for z-index
                    "relative z-10"
                )}>
                    {/* Icon - fixed height to prevent layout shift */}
                    {Icon && (
                        <div className={cn(
                            // Icon container with consistent radius and fixed dimensions
                            "p-5 rounded-card-icon mb-6 flex items-center justify-center",
                            "h-[60px] w-[60px]",
                            styles.iconBg
                        )}>
                            <Icon className={cn("h-10 w-10", styles.iconColor)} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Title - short and clear with max-width constraint */}
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-3 md:mb-4 max-w-[280px] md:max-w-[360px]">
                        {title}
                    </h2>

                    {/* Description - action-oriented with improved max-width */}
                    <p className={cn(
                        "text-xs md:text-sm font-medium text-muted-foreground leading-relaxed mb-8 md:mb-10",
                        // Constrain width for readability on large screens
                        "max-w-[280px] md:max-w-[340px]"
                    )}>
                        {description}
                    </p>

                    {/* Filter variant helper hint */}
                    {variant === 'filter' && !actionLabel && (
                        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                            Coba sesuaikan filter
                        </p>
                    )}

                    {/* Action Button - only one primary CTA */}
                    {actionLabel && onAction && (
                        <Button
                            onClick={onAction}
                            variant={styles.buttonVariant}
                            size="lg"
                            className={cn(
                                "w-full md:w-auto md:min-w-[200px]",
                                // Mobile: rounded-full, Desktop: rounded-lg
                                "rounded-full md:rounded-lg",
                                "h-12 md:h-14 px-8 md:px-10",
                                "font-semibold text-xs md:text-sm uppercase tracking-widest",
                                // Add shadow for default variant
                                variant === 'default' && "shadow-lg shadow-primary/20",
                                // Active state
                                "active:scale-95 transition-all"
                            )}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
