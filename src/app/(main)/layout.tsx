
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { useApp } from '@/components/app-provider';
import { AddWalletModal } from '@/components/add-wallet-modal';
import { AddBudgetModal } from '@/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { useEffect }from 'react';
import { AddTransferModal } from '@/components/add-transfer-modal';
import { EditWalletModal } from '@/components/edit-wallet-modal';
import { EditTransactionForm } from '@/components/edit-transaction-form';
import { Skeleton } from '@/components/ui/skeleton';


const AppSkeleton = () => (
    <div className="flex flex-col h-full">
        <header className="h-16 flex items-center px-4 shrink-0 border-b">
            <Skeleton className="h-8 w-24" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="flex-1 p-4 space-y-6">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        </main>
        <footer className="h-16 w-full border-t flex justify-around items-center">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
        </footer>
    </div>
);


export default function MainAppLayout({ children }: { children: React.ReactNode }) {
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

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const isSmartAddPage = pathname === '/add-smart';

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-muted text-zinc-900 dark:text-gray-50 flex flex-col items-center p-0 md:p-8 font-sans">
                <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
                    <AppSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted text-zinc-900 dark:text-gray-50 flex flex-col items-center p-0 md:p-8 font-sans">
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
                
                {!isSmartAddPage && <BottomNavigation />}
            </div>
        </div>
    );
}
