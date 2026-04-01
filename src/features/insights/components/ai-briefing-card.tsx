'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, ArrowRight, Zap, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInsights } from '../hooks/use-insights';
import { Skeleton } from '@/components/ui/skeleton';

export const AiBriefingCard = () => {
    const { briefing, isLoading } = useInsights();

    if (isLoading) {
        return <Skeleton className="h-[120px] w-full rounded-card-premium bg-card/50" />;
    }

    if (!briefing) return null;

    const moods = {
        calm: {
            bg: 'bg-emerald-500/10',
            icon: Sparkles,
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-50'
        },
        warning: {
            bg: 'bg-amber-500/10',
            icon: AlertCircle,
            iconColor: 'text-amber-500',
            textColor: 'text-amber-50'
        },
        celebration: {
            bg: 'bg-indigo-500/10',
            icon: Zap,
            iconColor: 'text-indigo-500',
            textColor: 'text-indigo-50'
        }
    };

    const mood = moods[briefing.mood as keyof typeof moods] || moods.calm;
    const Icon = mood.icon;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className={cn(
                "relative overflow-hidden rounded-card-premium p-5 backdrop-blur-xl shadow-[0_20px_40px_-28px_rgba(15,23,42,0.2)] transition-all duration-500",
                mood.bg
            )}>
                {/* Ambient Glow */}
                <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20", mood.iconColor.replace('text-', 'bg-'))}></div>
                
                <div className="flex gap-4 relative z-10">
                    <div className={cn("shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-white/8 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)]", mood.iconColor)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Financial Co-Pilot</span>
                            <div className="flex items-center gap-1.5">
                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", mood.iconColor.replace('text-', 'bg-'))}></span>
                                <span className="text-[10px] font-medium opacity-40">Live Analysis</span>
                            </div>
                        </div>
                        
                        <p className="text-sm font-medium leading-relaxed tracking-tight text-foreground/90">
                            {briefing.briefing}
                        </p>
                        
                        {briefing.suggestion && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 group pt-1"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shadow-[0_10px_18px_-16px_rgba(13,148,136,0.3)] transition-colors group-hover:bg-primary/20">
                                    <Target className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors">
                                    {briefing.suggestion}
                                </span>
                                <ArrowRight className="h-3 w-3 text-primary/40 group-hover:translate-x-0.5 transition-transform" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
