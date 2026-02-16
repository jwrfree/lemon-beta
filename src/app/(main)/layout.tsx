'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Sidebar } from '@/components/sidebar';
import { TransactionComposer } from '@/features/transactions/components/transaction-composer';
import { AddWalletModal } from '@/features/wallets/components/add-wallet-modal';
import { AddBudgetModal } from '@/features/budgets/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/features/transactions/components/confirm-delete-modal';

import { EditWalletModal } from '@/features/wallets/components/edit-wallet-modal';
import { EditBudgetModal } from '@/features/budgets/components/edit-budget-modal';
import { CustomToast } from '@/components/custom-toast';
import { GoalForm } from '@/features/goals/components/goal-form';
import { ReminderForm } from '@/features/reminders/components/reminder-form';
import { DebtForm } from '@/features/debts/components/debt-form';
import { DebtPaymentForm } from '@/features/debts/components/debt-payment-form';
import { useUI } from '@/components/ui-provider';
import { useActions } from '@/providers/action-provider';
import { cn } from '@/lib/utils';

const pageVariants = {
    initial: {
        opacity: 0,
    },
    enter: {
        opacity: 1,
        transition: { duration: 0.24, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        isTxModalOpen,
        setIsTxModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isEditBudgetModalOpen,
        setIsEditBudgetModalOpen,
        budgetToEdit,
        isDeleteModalOpen,
        transactionToDelete,
        closeDeleteModal,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isEditWalletModalOpen,
        setIsEditWalletModalOpen,
        walletToEdit,
        transactionToEdit,
        setTransactionToEdit,
        isGoalModalOpen,
        setIsGoalModalOpen,
        goalToEdit,
        setGoalToEdit,
        isReminderModalOpen,
        setIsReminderModalOpen,
        reminderToEdit,
        setReminderToEdit,
        isDebtModalOpen,
        setIsDebtModalOpen,
        debtToEdit,
        setDebtToEdit,
        isDebtPaymentModalOpen,
        setIsDebtPaymentModalOpen,
        debtForPayment,
        setDebtForPayment,
        isSidebarCollapsed,
    } = useUI();

    const { deleteTransaction } = useActions();

    useEffect(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    const handleCloseTxModal = () => {
        setIsTxModalOpen(false);
        setTransactionToEdit(null);
    };

    const handleCloseGoalModal = () => {
        setIsGoalModalOpen(false);
        setGoalToEdit(null);
    };

    const handleCloseReminderModal = () => {
        setIsReminderModalOpen(false);
        setReminderToEdit(null);
    };

    const handleCloseDebtModal = () => {
        setIsDebtModalOpen(false);
        setDebtToEdit(null);
    };

    const handleCloseDebtPaymentModal = () => {
        setIsDebtPaymentModalOpen(false);
        setDebtForPayment(null);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        await deleteTransaction(transactionToDelete);
        closeDeleteModal();
    };


    const mainPagesForNav = ['/home', '/charts', '/transactions', '/settings', '/budgeting', '/plan'];
    const showBottomNav = mainPagesForNav.includes(pathname);

    return (
        <div className="w-full h-dvh bg-slate-100 dark:bg-slate-950 relative flex flex-col md:flex-row overflow-hidden">
            <Sidebar />
            <div className={cn(
                "flex-1 flex flex-col relative w-full h-full max-w-md md:max-w-none mx-auto overflow-hidden transition-all duration-300",
                isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
            )}>
                <div
                    ref={containerRef}
                    className={cn(
                        'flex-1 flex flex-col overflow-y-auto overflow-x-hidden h-full scroll-smooth',
                        showBottomNav && 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'
                    )}
                >
                    <div className="flex-1 flex flex-col min-h-full">
                        {children}
                    </div>
                </div>

                <CustomToast />

                <AnimatePresence mode="wait">
                    {isTxModalOpen && <TransactionComposer key="transaction-composer" initialData={transactionToEdit} onClose={handleCloseTxModal} />}
                    {isWalletModalOpen && <AddWalletModal key="add-wallet-modal" onClose={() => setIsWalletModalOpen(false)} />}
                    {isBudgetModalOpen && <AddBudgetModal key="add-budget-modal" onClose={() => setIsBudgetModalOpen(false)} />}
                    {isEditBudgetModalOpen && budgetToEdit && <EditBudgetModal key="edit-budget-modal" budget={budgetToEdit} onClose={() => setIsEditBudgetModalOpen(false)} />}
                    {isTransferModalOpen && <TransactionComposer key="transfer-composer" initialData={{ type: 'transfer' }} onClose={() => setIsTransferModalOpen(false)} />}
                    {isEditWalletModalOpen && walletToEdit && <EditWalletModal key="edit-wallet-modal" wallet={walletToEdit} onClose={() => setIsEditWalletModalOpen(false)} />}
                    {isGoalModalOpen && <GoalForm key="goal-form" initialData={goalToEdit} onClose={handleCloseGoalModal} />}
                    {isReminderModalOpen && <ReminderForm key="reminder-form" initialData={reminderToEdit} onClose={handleCloseReminderModal} />}
                    {isDebtModalOpen && <DebtForm key="debt-form" initialData={debtToEdit} onClose={handleCloseDebtModal} />}
                    {isDebtPaymentModalOpen && debtForPayment && (
                        <DebtPaymentForm key="debt-payment-form" debt={debtForPayment} onClose={handleCloseDebtPaymentModal} />
                    )}
                    {isDeleteModalOpen && transactionToDelete && (
                        <ConfirmDeleteModal
                            key="confirm-delete-modal"
                            transaction={transactionToDelete}
                            onClose={closeDeleteModal}
                            onConfirm={handleConfirmDelete}
                        />
                    )}
                </AnimatePresence>

                <div className="md:hidden">
                    {showBottomNav && <BottomNavigation />}
                </div>
            </div>
        </div>
    );
};
