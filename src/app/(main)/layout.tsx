
'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { TransactionForm } from '@/components/transaction-form';
import { AddWalletModal } from '@/components/add-wallet-modal';
import { AddBudgetModal } from '@/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { AddTransferModal } from '@/components/add-transfer-modal';
import { EditWalletModal } from '@/components/edit-wallet-modal';
import { EditBudgetModal } from '@/components/edit-budget-modal';
import { CustomToast } from '@/components/custom-toast';
import { GoalForm } from '@/components/goal-form';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/components/app-provider';
import { cn } from '@/lib/utils';

const zoomVariants = {
    initial: {
        scale: 0.95,
        opacity: 0,
    },
    enter: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeIn' },
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
    } = useUI();

    const { deleteTransaction } = useApp();

    useEffect(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    const handleCloseTxModal = () => {
        setIsTxModalOpen(false);
        setTransactionToEdit(null);
    }

    const handleCloseGoalModal = () => {
        setIsGoalModalOpen(false);
        setGoalToEdit(null);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        await deleteTransaction(transactionToDelete);
        closeDeleteModal();
    };


    const mainPagesForNav = ['/home', '/charts', '/transactions', '/settings', '/budgeting'];
    const showBottomNav = mainPagesForNav.includes(pathname);

    return (
        <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background pt-[env(safe-area-inset-top)] md:pt-0 md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
            <AnimatePresence initial={false}>
                <motion.div
                    key={pathname}
                    variants={zoomVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    ref={containerRef}
                    className={cn(
                        'flex-1 flex flex-col overflow-y-auto',
                        showBottomNav && 'pb-[calc(4rem+env(safe-area-inset-bottom))]'
                    )}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <CustomToast />

            <AnimatePresence>
                {isTxModalOpen && <TransactionForm initialData={transactionToEdit} onClose={handleCloseTxModal} />}
                {isWalletModalOpen && <AddWalletModal onClose={() => setIsWalletModalOpen(false)} />}
                {isBudgetModalOpen && <AddBudgetModal onClose={() => setIsBudgetModalOpen(false)} />}
                {isEditBudgetModalOpen && budgetToEdit && <EditBudgetModal budget={budgetToEdit} onClose={() => setIsEditBudgetModalOpen(false)} />}
                {isTransferModalOpen && <AddTransferModal onClose={() => setIsTransferModalOpen(false)} />}
                {isEditWalletModalOpen && walletToEdit && <EditWalletModal wallet={walletToEdit} onClose={() => setIsEditWalletModalOpen(false)} />}
                {isGoalModalOpen && <GoalForm initialData={goalToEdit} onClose={handleCloseGoalModal} />}
                {isDeleteModalOpen && transactionToDelete && (
                    <ConfirmDeleteModal
                        transaction={transactionToDelete}
                        onClose={closeDeleteModal}
                        onConfirm={handleConfirmDelete}
                    />
                )}
            </AnimatePresence>
            
            {showBottomNav && <BottomNavigation />}
        </div>
    );
};
