
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { useApp, AppProvider } from '@/components/app-provider';
import { AddWalletModal } from '@/components/add-wallet-modal';
import { AddBudgetModal } from '@/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { useEffect, useState }from 'react';
import { AddTransferModal } from '@/components/add-transfer-modal';
import { EditWalletModal } from '@/components/edit-wallet-modal';
import { EditTransactionForm } from '@/components/edit-transaction-form';

const AppSkeleton = () => (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);


const MainLayoutContent = ({ children }: { children: React.ReactNode }) => {
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
        isDeleteModalOpen,
        transactionToDelete,
        handleConfirmDelete,
        closeDeleteModal,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isEditWalletModalOpen,
        setIsEditWalletModalOpen,
        walletToEdit,
        isEditTxModalOpen,
        setIsEditTxModalOpen,
        transactionToEdit,
    } = useApp();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !isLoading && !user) {
            router.replace('/');
        }
    }, [user, isLoading, router, isHydrated]);

    if (!isHydrated || isLoading || !user) {
        return <AppSkeleton />;
    }

    return (
        <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-y-auto"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

             <AnimatePresence>
                {isTxModalOpen && <AddTransactionForm onClose={() => setIsTxModalOpen(false)} />}
                {isEditTxModalOpen && transactionToEdit && <EditTransactionForm transaction={transactionToEdit} onClose={() => setIsEditTxModalOpen(false)} />}
                {isWalletModalOpen && <AddWalletModal onClose={() => setIsWalletModalOpen(false)} />}
                {isBudgetModalOpen && <AddBudgetModal onClose={() => setIsBudgetModalOpen(false)} />}
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
            
            <BottomNavigation />
        </div>
    );
};


export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
        </AppProvider>
    )
}
