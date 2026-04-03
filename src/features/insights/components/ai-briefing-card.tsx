'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Lightning, Sparkle, WarningCircle } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useInsights } from '../hooks/use-insights';
import { Skeleton } from '@/components/ui/skeleton';
import { useUI } from '@/components/ui-provider';
import { EmptyState } from '@/components/empty-state';

export const AiBriefingCard = () => {
 const { briefing, isLoading } = useInsights();
 const { setIsAIChatOpen } = useUI();

 if (isLoading) {
 return <Skeleton className="h-[120px] w-full rounded-card-premium bg-card/50"/>;
 }

 if (!briefing) {
 return (
 <EmptyState
 title="Briefing belum siap"
 description="Lemon Coach butuh sedikit data tambahan untuk menyusun ringkasan harianmu."
 icon={Sparkle}
 variant="filter"
 className="px-0 pt-0 md:min-h-0"
 />
 );
 }

 const moods = {
 calm: {
 bg: 'bg-emerald-500/10',
 icon: Sparkle,
 iconColor: 'text-emerald-500',
 textColor: 'text-emerald-50'
 },
 warning: {
 bg: 'bg-amber-500/10',
 icon: WarningCircle,
 iconColor: 'text-amber-500',
 textColor: 'text-amber-50'
 },
 celebration: {
 bg: 'bg-indigo-500/10',
 icon: Lightning,
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
 "relative overflow-hidden rounded-card-premium p-5 backdrop-blur-xl shadow-elevation-3 transition-all duration-500",
 mood.bg
 )}>
 {/* Ambient Glow */}
 <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20", mood.iconColor.replace('text-', 'bg-'))}></div>
 
 <div className="flex gap-4 relative z-10">
 <div className={cn("shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-white/8 shadow-elevation-2", mood.iconColor)}>
 <Icon size={24} weight="regular"/>
 </div>
 
 <div className="space-y-3 flex-1">
 <div className="flex items-center justify-between">
 <span className="text-label-sm opacity-50">Lemon Coach</span>
 <div className="flex items-center gap-1.5">
 <span className={cn("h-1 w-1 rounded-full", mood.iconColor.replace('text-', 'bg-'))}></span>
 <span className="text-label-sm opacity-40">Analisis Langsung</span>
 </div>
 </div>
 
 <p className="text-body-md font-medium leading-relaxed tracking-tight text-foreground/90">
 {briefing.briefing}
 </p>
 
 {briefing.suggestion && (
 <motion.button
 whileTap={{ scale: 0.98 }}
 onClick={() => setIsAIChatOpen(true)}
 className="flex items-center gap-2 group pt-1.5"
 >
 <span className="text-label-md text-primary/80 group-hover:text-primary transition-colors">
 {briefing.suggestion}
 </span>
 <ArrowRight size={14} weight="regular"className="text-primary/40 group-hover:translate-x-0.5 transition-transform"/>
 </motion.button>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
};


