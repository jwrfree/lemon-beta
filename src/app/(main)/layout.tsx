'use client';
import { Suspense, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Sidebar } from '@/components/sidebar';
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
import { UnifiedTransactionSheet } from '@/features/transactions/components/unified-transaction-sheet';
import { TransactionDetailSheet } from '@/features/transactions/components/transaction-detail-sheet';
import { AIChatDrawer } from '@/features/ai-chat/components/ai-chat-drawer';
import { UniversalAddSheet } from '@/components/universal-add-sheet';
import { CommandPalette } from '@/components/command-palette';
import { PageTransition } from '@/components/layout/page-transition';
import { useUI } from '@/components/ui-provider';
import { useActions } from '@/providers/action-provider';
import { cn } from '@/lib/utils';
import { isTopLevelMobileRoute } from '@/lib/sidebar-config';



export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        isTxSheetOpen,
        setIsTxSheetOpen,
        txSheetMode,
        isTransactionDetailOpen,
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
        transactionToView,
        setTransactionToEdit,
        setTransactionToView,
        setIsTransactionDetailOpen,
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
        isSmartAddOpen,
        setIsSmartAddOpen,
        isAIChatOpen,
        setIsAIChatOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
    } = useUI();

    const { deleteTransaction } = useActions();

    useEffect(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });

        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [pathname, setIsCommandPaletteOpen]);

    const handleCloseTxModal = () => {
        setIsTxSheetOpen(false);
        setTransactionToEdit(null);
    };

    const handleCloseTransactionDetail = () => {
        setIsTransactionDetailOpen(false);
        setTransactionToView(null);
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


    const showBottomNav = isTopLevelMobileRoute(pathname);

    return (
        <div className="w-full h-dvh bg-background relative flex flex-col md:flex-row overflow-hidden">
            <Sidebar />
            <div className={cn(
                "relative flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300",
                isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
            )}>
                <div
                    ref={containerRef}
                    className="main-content-scroll"
                    data-nav={showBottomNav ? "true" : "false"}
                >
                    <PageTransition className="relative flex min-h-full w-full flex-1 flex-col">
                        {children}
                    </PageTransition>
                </div>

                <CustomToast />

                <AnimatePresence mode="wait">
                    {isTxSheetOpen && (
                        <UnifiedTransactionSheet 
                            key="unified-tx-sheet"
                            isOpen={isTxSheetOpen}
                            initialMode={txSheetMode}
                            onClose={handleCloseTxModal}
                            transaction={transactionToEdit}
                        />
                    )}
                    {isTransactionDetailOpen && transactionToView && (
                        <TransactionDetailSheet
                            key={`tx-detail-${transactionToView.id}`}
                            isOpen={isTransactionDetailOpen}
                            onClose={handleCloseTransactionDetail}
                            transaction={transactionToView}
                        />
                    )}
                    {isWalletModalOpen && <AddWalletModal key="add-wallet-modal" onClose={() => setIsWalletModalOpen(false)} />}
                    {isBudgetModalOpen && <AddBudgetModal key="add-budget-modal" onClose={() => setIsBudgetModalOpen(false)} />}
                    {isEditBudgetModalOpen && budgetToEdit && <EditBudgetModal key="edit-budget-modal" budget={budgetToEdit} onClose={() => setIsEditBudgetModalOpen(false)} />}
                    {isTransferModalOpen && (
                        <UnifiedTransactionSheet 
                            key="transfer-sheet" 
                            isOpen={isTransferModalOpen} 
                            initialType="transfer"
                            onClose={() => setIsTransferModalOpen(false)} 
                        />
                    )}
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
                    
                    <Suspense fallback={null}>
                        <UniversalAddSheet key="universal-add-sheet" />
                    </Suspense>
                    <CommandPalette key="command-palette" />

                    <AIChatDrawer 
                        key="ai-chat-drawer"
                        isOpen={isAIChatOpen} 
                        onClose={() => setIsAIChatOpen(false)} 
                    />
                </AnimatePresence>

                <div className="md:hidden">
                    <AnimatePresence>
                        {showBottomNav && <BottomNavigation key="bottom-nav" />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
