'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandCoins, Target, FileText, Bell } from '@/lib/icons';
import { cn } from '@/lib/utils';

// Feature Dashboards
import { BudgetingDashboard } from '@/features/budgets/components/budgeting-dashboard';
import { GoalsDashboard } from '@/features/goals/components/goals-dashboard';
import { DebtsDashboard } from '@/features/debts/components/debts-dashboard';
import { RemindersDashboard } from '@/features/reminders/components/reminders-dashboard';
import { SubscriptionAuditCard } from '@/features/insights/components/subscription-audit-card';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';

export default function PlanPage() {
    const [activeTab, setActiveTab] = useState<'budget' | 'goals' | 'debts' | 'bills'>('budget');
    const { transactions } = useTransactions();

    const tabs = [
        { id: 'budget', label: 'Anggaran', icon: HandCoins },
        { id: 'goals', label: 'Target', icon: Target },
        { id: 'debts', label: 'Hutang', icon: FileText },
        { id: 'bills', label: 'Tagihan', icon: Bell },
    ];

    return (
        <AppPageShell>
            <AppPageHeaderChrome>
                <header className="mb-4 mt-1 flex items-center justify-between px-1 px-4 pt-3 md:px-6">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">Rencana</h1>
                    </div>
                </header>

                {/* Tab Navigation (Segmented Control) */}
                <div className="mb-2 flex overflow-x-auto scrollbar-hide rounded-full bg-muted/50 p-1 px-4 md:px-6">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all relative min-w-[90px]",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                        {activeTab === 'bills' && (
                            <>
                                <SubscriptionAuditCard transactions={transactions} />
                                <RemindersDashboard />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </AppPageBody>
        </AppPageShell>
    );
}


