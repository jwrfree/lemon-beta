
'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNavigation } from '@/components/bottom-navigation';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { useApp } from '@/components/app-provider';
import { AddWalletModal } from '@/components/add-wallet-modal';
import { AddBudgetModal } from '@/components/add-budget-modal';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';


export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { 
        isTxModalOpen, 
        setIsTxModalOpen, 
        isWalletModalOpen,
        setIsWalletModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isDeleteModalOpen,
        transactionToDelete,
        handleConfirmDelete,
        closeDeleteModal
    } = useApp();

    const showBottomNav = !isTxModalOpen && !isWalletModalOpen && !isBudgetModalOpen && !isDeleteModalOpen;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-gray-50 flex flex-col items-center p-0 md:p-8 font-sans">
            <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background border-border md:border md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>

                 <AnimatePresence>
                    {isTxModalOpen && <AddTransactionForm onClose={() => setIsTxModalOpen(false)} />}
                    {isWalletModalOpen && <AddWalletModal onClose={() => setIsWalletModalOpen(false)} />}
                    {isBudgetModalOpen && <AddBudgetModal onClose={() => setIsBudgetModalOpen(false)} />}
                    {isDeleteModalOpen && transactionToDelete && (
                        <ConfirmDeleteModal
                            transaction={transactionToDelete}
                            onClose={closeDeleteModal}
                            onConfirm={handleConfirmDelete}
                        />
                    )}
                </AnimatePresence>

            </div>
             <AnimatePresence>
                {showBottomNav && <BottomNavigation />}
            </AnimatePresence>
        </div>
    );
}
