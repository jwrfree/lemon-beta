
'use client';
import { BudgetingPage } from '@/components/budgeting-page';
import { useApp } from '@/components/app-provider';

export default function Budgeting() {
    const { setIsBudgetModalOpen } = useApp();
    return <BudgetingPage onAddBudget={() => setIsBudgetModalOpen(true)} />;
}
