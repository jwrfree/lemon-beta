
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { TransactionForm } from '@/components/transaction-form';
import { AppProvider, useApp } from '@/components/app-provider';
import { AddWalletModal } from '@/components/add-wallet-modal';
import { AddBudgetModal } from '@/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { useEffect } from 'react';
import { AddTransferModal } from '@/components/add-transfer-modal';
import { EditWalletModal } from '@/components/edit-wallet-modal';
import { EditBudgetModal } from '@/components/edit-budget-modal';
import { CustomToast } from '@/components/custom-toast';

const slideVariants = {
    initial: {
        x: '100%',
        opacity: 0,
    },
    enter: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
};

function MainAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { 
        user,
        isLoading,
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
        handleConfirmDelete,
        closeDeleteModal,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isEditWalletModalOpen,
        setIsEditWalletModalOpen,
        walletToEdit,
        transactionToEdit,
        setTransactionToEdit,
    } = useApp();

    useEffect(() => {
        if (!isLoading && user === null) {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return null; 
    }

    const handleCloseTxModal = () => {
        setIsTxModalOpen(false);
        setTransactionToEdit(null);
    }

    // Hide bottom nav on specific pages for a more focused experience
    const mainPagesForNav = ['/home', '/charts', '/transactions', '/settings'];
    const showBottomNav = mainPagesForNav.includes(pathname) || pathname.startsWith('/budgeting') || pathname.startsWith('/wallets');


    return (
        <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    variants={slideVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    className="flex-1 flex flex-col overflow-y-auto"
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

export default function MainAppLayoutExport({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <MainAppLayout>{children}</MainAppLayout>
        </AppProvider>
    );
}
