'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HandCoins, Target, FileText, Bell, MagnifyingGlass } from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

// Feature Dashboards
import { BudgetingDashboard } from '@/features/budgets/components/budgeting-dashboard';
import { GoalsDashboard } from '@/features/goals/components/goals-dashboard';
import { DebtsDashboard } from '@/features/debts/components/debts-dashboard';
import { RemindersDashboard } from '@/features/reminders/components/reminders-dashboard';
import { SubscriptionAuditCard } from '@/features/insights/components/subscription-audit-card';
import { PlanSummaryCard } from '@/features/insights/components/plan-summary-card';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';

function PlanContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const tabParam = searchParams.get('tab') as 'budget'| 'goals'| 'bills'| null;
 
 const [activeTab, setActiveTab] = useState<'budget'| 'goals'| 'bills'>(tabParam || 'budget');
 const { transactions } = useTransactions();
 const { setIsCommandPaletteOpen } = useUI();


 // Sync state with URL params
 useEffect(() => {
 if (tabParam && tabParam !== activeTab) {
 setActiveTab(tabParam);
 }
 }, [tabParam, activeTab]);

 const handleTabChange = (id: 'budget'| 'goals'| 'bills') => {
 setActiveTab(id);
 const params = new URLSearchParams(searchParams.toString());
 params.set('tab', id);
 router.replace(`/plan?${params.toString()}`, { scroll: false });
 };

 const tabs = [
 { id: 'budget', label: 'Anggaran', icon: HandCoins },
 { id: 'goals', label: 'Target', icon: Target },
 { id: 'bills', label: 'Tagihan', icon: Bell },
 ];

 return (
 <AppPageShell>
 <AppPageHeaderChrome>
      <header className="flex h-16 items-center justify-between px-4 md:px-6">
        <div>
          <p className="text-label-xs text-muted-foreground/50 leading-none mb-1.5 uppercase tracking-widest">Rencana Keuangan</p>
          <h1 className="text-title-lg font-semibold tracking-tight text-foreground">Kelola Anggaran & Tagihan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Cari rencana"
            className="h-9 w-9 rounded-full bg-card text-muted-foreground shadow-elevation-2 active:scale-95 transition-all"
          >
            <MagnifyingGlass size={16} weight="regular"/>
          </Button>
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
 "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-label-sm transition-all relative min-w-[90px]",
 isActive ? "text-primary": "text-muted-foreground hover:text-foreground"
 )}
 >
 {isActive && (
 <motion.div
 layoutId="active-tab-bg"
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
 <PlanSummaryCard />

 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="min-h-[300px]"
 >
 {activeTab === 'budget'&& <BudgetingDashboard />}
 {activeTab === 'goals'&& <GoalsDashboard />}
 {activeTab === 'bills' && <RemindersDashboard transactions={transactions} />}
 </motion.div>
 </AnimatePresence>
 </AppPageBody>
 </AppPageShell>
 );
}

export default function PlanPage() {
 return (
 <Suspense fallback={<div className="p-6">Memuat Rencana...</div>}>
 <PlanContent />
 </Suspense>
 );
}
