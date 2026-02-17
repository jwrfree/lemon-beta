'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandCoins, Target, FileText, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// Feature Dashboards
import { BudgetingDashboard } from '@/features/budgets/components/budgeting-dashboard';
import { GoalsDashboard } from '@/features/goals/components/goals-dashboard';
import { DebtsDashboard } from '@/features/debts/components/debts-dashboard';
import { RemindersDashboard } from '@/features/reminders/components/reminders-dashboard';

export default function PlanPage() {
    const [activeTab, setActiveTab] = useState<'budget' | 'goals' | 'debts' | 'bills'>('budget');

    const tabs = [
        { id: 'budget', label: 'Anggaran', icon: HandCoins },
        { id: 'goals', label: 'Target', icon: Target },
        { id: 'debts', label: 'Hutang', icon: FileText },
        { id: 'bills', label: 'Tagihan', icon: Bell },
    ];

    return (
        <main className="pb-40 bg-background min-h-screen">
            {/* Header Area */}
            <div className="pt-safe-top px-6 pb-2 sticky top-0 bg-background/90 backdrop-blur-md z-30 transition-all border-b border-transparent data-[scrolled=true]:border-border/50">
                <header className="flex items-center justify-between mb-4 mt-4">
                    <div>
                        <h1 className="text-2xl font-medium tracking-tight">Rencana Keuangan</h1>
                        <p className="text-sm text-muted-foreground">Kelola masa depan finansialmu.</p>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-muted/50 rounded-2xl overflow-x-auto scrollbar-hide mb-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all relative min-w-[90px]",
                                    isActive ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-tab-bg"
                                        className="absolute inset-0 bg-primary rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary-foreground")} />
                                <span className={cn("relative z-10 truncate hidden sm:inline", isActive && "text-primary-foreground")}>{tab.label}</span>
                                {/* Mobile Label specific handling to save space if needed, using hidden sm:inline for now but let's just truncate */}
                                <span className={cn("relative z-10 truncate sm:hidden", isActive && "text-primary-foreground")}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[300px]"
                    >
                        {activeTab === 'budget' && <BudgetingDashboard />}
                        {activeTab === 'goals' && <GoalsDashboard />}
                        {activeTab === 'debts' && <DebtsDashboard />}
                        {activeTab === 'bills' && <RemindersDashboard />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}

