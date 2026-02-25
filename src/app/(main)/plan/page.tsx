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
import { SubscriptionAuditCard } from '@/features/insights/components/subscription-audit-card';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';

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
        <main className="pb-40 bg-background min-h-screen">
            {/* Header Area */}
            <div className="pt-safe-top px-6 pb-2 sticky top-0 bg-background/80 backdrop-blur-xl z-30 border-b border-border/50">
                <header className="flex items-center justify-between mb-4 mt-4 px-1">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Rencana Keuangan</h1>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Masa Depan Finansial</p>
                    </div>
                </header>

                {/* Tab Navigation (Segmented Control) */}
                <div className="flex p-1 bg-muted/50 rounded-full overflow-x-auto scrollbar-hide mb-2">
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
            </div>

            {/* Content Area */}
            <div className="px-6 pt-4">
                {/* AI Subscription Audit Section */}
                <SubscriptionAuditCard transactions={transactions} />

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

