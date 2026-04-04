'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, TrendUp, HandCoins, ChartPieSlice, Sparkle } from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { cn } from '@/lib/utils';

// Shared Components
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { AiBriefingCard, RiskScoreCard } from '@/features/insights';

// Feature Dashboards
import { AssetsLiabilitiesDashboard } from '@/features/assets/components/assets-liabilities-dashboard';
import { DebtsDashboard } from '@/features/debts/components/debts-dashboard';
import { AnalyticsDashboard } from '@/features/charts/components/analytics-dashboard';

function WealthContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const tabParam = searchParams.get('tab') as 'overview'| 'assets'| 'debts'| 'charts'| null;
 
 const [activeTab, setActiveTab] = useState<'overview'| 'assets'| 'debts'| 'charts'>(tabParam || 'overview');
 const { setIsCommandPaletteOpen } = useUI();

 // Sync state with URL params
 useEffect(() => {
 if (tabParam && tabParam !== activeTab) {
 setActiveTab(tabParam);
 }
 }, [tabParam, activeTab]);

 const handleTabChange = (id: 'overview'| 'assets'| 'debts'| 'charts') => {
 setActiveTab(id);
 const params = new URLSearchParams(searchParams.toString());
 params.set('tab', id);
 router.replace(`/wealth?${params.toString()}`, { scroll: false });
 };

 const tabs = [
 { id: 'overview', label: 'Iktisar', icon: Sparkle },
 { id: 'assets', label: 'Aset', icon: TrendUp },
 { id: 'debts', label: 'Hutang', icon: HandCoins },
 { id: 'charts', label: 'Analitik', icon: ChartPieSlice },
 ];

 return (
 <AppPageShell>
 <AppPageHeaderChrome>
 <header className="flex items-center justify-between px-4 pt-4 md:px-6">
 <div>
 <p className="text-label-xs text-muted-foreground/40 leading-none mb-1.5 uppercase tracking-wide">Strategi & Kekayaan</p>
 <h1 className="text-title-lg font-semibold tracking-tight text-foreground">Wawasan</h1>
 </div>
 <div className="flex items-center gap-2">
 <button 
 onClick={() => setIsCommandPaletteOpen(true)}
 aria-label="Cari wawasan atau aset"
 className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm border border-border/40 active:scale-95 transition-all"
 >
 <Compass size={16} />
 </button>
 </div>
 </header>

 {/* Tab Navigation (Segmented Control) */}
 <div className="mb-2 flex overflow-x-auto scrollbar-hide rounded-full bg-muted/50 p-1 px-4 md:px-6">
 {tabs.map((tab) => {
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => handleTabChange(tab.id as any)}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-label-md transition-all relative min-w-[90px]",
 isActive ? "text-primary": "text-muted-foreground hover:text-foreground"
 )}
 >
 {isActive && (
 <motion.div
 layoutId="active-wealth-tab-bg"
 className="absolute inset-0 bg-card rounded-full"
 transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
 />
 )}
 <tab.icon className={cn("h-3.5 w-3.5 relative z-10", isActive && "text-primary")} />
 <span className={cn("relative z-10 truncate", isActive && "text-primary")}>{tab.label}</span>
 </button>
 );
 })}
 </div>
 </AppPageHeaderChrome>

 {/* Content Area */}
 <AppPageBody className="pt-4">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="min-h-[400px]"
 >
 {activeTab === 'overview'&& (
 <div className="space-y-6">
 <section>
 <h2 className="text-label-lg font-semibold text-muted-foreground/70 mb-4 px-1">Kesehatan Finansial</h2>
 <RiskScoreCard />
 </section>
 <section>
 <h2 className="text-label-lg font-semibold text-muted-foreground/70 mb-4 px-1">Briefing Terkini</h2>
 <AiBriefingCard />
 </section>
 </div>
 )}
 {activeTab === 'assets'&& <AssetsLiabilitiesDashboard />}
 {activeTab === 'debts'&& <DebtsDashboard />}
 {activeTab === 'charts'&& <AnalyticsDashboard />}
 </motion.div>
 </AnimatePresence>
 </AppPageBody>
 </AppPageShell>
 );
}

export default function WealthPage() {
 return (
 <Suspense fallback={<div className="p-6">Memuat Wawasan...</div>}>
 <WealthContent />
 </Suspense>
 );
}
