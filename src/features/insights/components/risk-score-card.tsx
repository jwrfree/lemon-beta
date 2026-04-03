import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ArrowClockwise, Sparkle } from '@/lib/icons';
import { cn, formatCurrency } from '@/lib/utils';
import { useInsights } from '../hooks/use-insights';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/help-tooltip';

export const RiskScoreCard = () => {
 const { risk, isLoading, refreshInsights } = useInsights();

 if (isLoading) {
 return (
 <Card variant="elevated"className="flex h-[200px] items-center justify-center bg-card/60 p-6 backdrop-blur-md">
 <ArrowClockwise size={24} weight="regular"className="animate-spin text-muted-foreground"/>
 </Card>
 );
 }

 if (!risk) {
 return (
 <Card variant="elevated"className="flex h-[180px] flex-col items-center justify-center space-y-3 bg-card/35 p-6 text-center border border-border/40">
 <div className="p-3 rounded-full bg-primary/5 text-primary">
 <Sparkle size={24} weight="regular"className="opacity-30"/>
 </div>
 <div className="space-y-1">
 <p className="text-label opacity-40">Lemon Coach lagi belajar nih</p>
 <p className="text-label-md text-muted-foreground max-w-[200px]">Kasih Lemon beberapa transaksi lagi ya, biar kita bisa pantau bareng kesehatan keuanganmu!</p>
 </div>
 </Card>
 );
 }

 const levels = {
 Low: {
 color: 'text-emerald-400',
 bg: 'bg-emerald-900',
 accent: 'bg-emerald-500/20',
 desc: 'Flux Stabil',
 label: 'Aman'
 },
 Moderate: {
 color: 'text-amber-400',
 bg: 'bg-orange-900',
 accent: 'bg-amber-500/20',
 desc: 'Drift Moderat',
 label: 'Waspada'
 },
 Critical: {
 color: 'text-rose-400',
 bg: 'bg-rose-950',
 accent: 'bg-rose-500/20',
 desc: 'Risiko Burn Tinggi',
 label: 'Bahaya'
 }
 };

 const config = levels[risk.level];

 return (
 <Card
 id="widget-risk-score"
 variant="elevated"
 className={cn(
 "relative overflow-hidden text-white transition-all duration-500",
 config.bg
 )}
 >
 <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 translate-x-4 -translate-y-4">
 <Sparkle size={160} weight="regular"/>
 </div>
 <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>

 <div className="p-7 space-y-6 relative z-10">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div>
 <p className="text-label text-white/40">Analisis Risiko</p>
 </div>
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={refreshInsights}
 className="h-10 w-10 rounded-full backdrop-blur-sm hover:bg-white/10"
 >
 <ArrowClockwise size={16} weight="regular"className="text-white/40"/>
 </Button>
 </div>

 <div className="flex items-end justify-between gap-6">
 <div className="space-y-6 flex-1">
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <span className={cn("text-display-lg font-medium tracking-tighter tabular-nums", config.color)}>
 {config.label}
 </span>
 <div className="h-2 w-2 rounded-full bg-white/20 animate-ping"/>
 </div>
 <p className="text-body-md text-white/70 leading-relaxed pr-4">
 {risk.insight}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-card-glass bg-white/6 p-4 backdrop-blur-md border border-border/40">
 <div className="flex items-center gap-1.5 mb-1.5">
 <p className="text-label text-white/40">Laju Pengeluaran</p>
 <HelpTooltip
 content="Laju rata-rata pengeluaran harianmu dalam 14 hari terakhir."
 iconClassName="text-white/20 hover:text-white/40"
 />
 </div>
 <p className="text-body-md tabular-nums text-white">{formatCurrency(risk.burnRate)}/h</p>
 </div>
 <div className="rounded-card-glass bg-white/6 p-4 backdrop-blur-md border border-border/40">
 <div className="flex items-center gap-1.5 mb-1.5">
 <p className="text-label text-white/40">Momentum</p>
 <HelpTooltip
 content="Indikator seberapa stabil arus kasmu saat ini (100% = sangat stabil)."
 iconClassName="text-white/20 hover:text-white/40"
 />
 </div>
 <p className="text-body-md tabular-nums text-white">{(risk.velocity * 100).toFixed(0)}% <span className="text-label-md font-medium opacity-40 ">RASIO</span></p>
 </div>
 </div>
 </div>

 <div className="hidden sm:block shrink-0">
 {/* Vertical Score Bar */}
 <div className="h-32 w-2 relative bg-white/10 rounded-full overflow-hidden">
 <motion.div
 initial={{ height: 0 }}
 animate={{ height:`${risk.score}%` }}
 className={cn("absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000",
 risk.level === 'Low'? 'bg-emerald-400':
 risk.level === 'Moderate'? 'bg-amber-400':
 'bg-rose-400'
 )}
 />
 </div>
 </div>
 </div>
 </div>
 </Card>
 );
};

