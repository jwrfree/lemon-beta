
'use client';

import React, { useState, createContext, useContext, useMemo } from 'react';
import type { Transaction, Wallet, Budget, Reminder, Debt, Goal } from '@/types/models';

interface PreFilledTransfer {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    description: string;
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface UIContextType {
    isTxModalOpen: boolean;
    setIsTxModalOpen: (isOpen: boolean) => void;
    transactionToEdit: Transaction | null;
    setTransactionToEdit: (transaction: Transaction | null) => void;
    openEditTransactionModal: (transaction: Transaction) => void;

    isWalletModalOpen: boolean;
    setIsWalletModalOpen: (isOpen: boolean) => void;
    isBudgetModalOpen: boolean;
    setIsBudgetModalOpen: (isOpen: boolean) => void;
    isEditBudgetModalOpen: boolean;
    setIsEditBudgetModalOpen: (isOpen: boolean) => void;
    budgetToEdit: Budget | null;
    openEditBudgetModal: (budget: Budget) => void;
    isTransferModalOpen: boolean;
    setIsTransferModalOpen: (isOpen: boolean) => void;
    preFilledTransfer: PreFilledTransfer | null;
    setPreFilledTransfer: (transfer: PreFilledTransfer | null) => void;
    isDeleteModalOpen: boolean;
    transactionToDelete: Transaction | null;
    openDeleteModal: (transaction: Transaction) => void;
    closeDeleteModal: () => void;
    isEditWalletModalOpen: boolean;
    setIsEditWalletModalOpen: (isOpen: boolean) => void;
    walletToEdit: Wallet | null;
    openEditWalletModal: (wallet: Wallet) => void;

    isGoalModalOpen: boolean;
    setIsGoalModalOpen: (isOpen: boolean) => void;
    goalToEdit: Goal | null;
    setGoalToEdit: (goal: Goal | null) => void;
    openEditGoalModal: (goal: Goal) => void;

    isReminderModalOpen: boolean;
    setIsReminderModalOpen: (isOpen: boolean) => void;
    reminderToEdit: Reminder | null;
    setReminderToEdit: (reminder: Reminder | null) => void;
    openEditReminderModal: (reminder: Reminder) => void;

    isDebtModalOpen: boolean;
    setIsDebtModalOpen: (isOpen: boolean) => void;
    debtToEdit: Debt | null;
    setDebtToEdit: (debt: Debt | null) => void;
    openEditDebtModal: (debt: Debt) => void;

    isDebtPaymentModalOpen: boolean;
    setIsDebtPaymentModalOpen: (isOpen: boolean) => void;
    debtForPayment: Debt | null;
    setDebtForPayment: (debt: Debt | null) => void;
    openDebtPaymentModal: (debt: Debt) => void;

    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (isCollapsed: boolean) => void;

    toastState: ToastState;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
    const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
    const [preFilledTransfer, setPreFilledTransfer] = useState<PreFilledTransfer | null>(null);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);
    const [isDebtPaymentModalOpen, setIsDebtPaymentModalOpen] = useState(false);
    const [debtForPayment, setDebtForPayment] = useState<Debt | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    const [toastState, setToastState] = useState<ToastState>({
        show: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToastState({ show: true, message, type });
    };

    const hideToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };
    
    const openDeleteModal = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
    };

    const openEditWalletModal = (wallet: Wallet) => {
        setWalletToEdit(wallet);
        setIsEditWalletModalOpen(true);
    };

    const openEditBudgetModal = (budget: Budget) => {
        setBudgetToEdit(budget);
        setIsEditBudgetModalOpen(true);
    };

    const openEditTransactionModal = (transaction: Transaction) => {
        if (transaction.category === 'Transfer') {
            showToast("Mengedit transaksi transfer belum didukung.", 'error');
            return;
        }
        setTransactionToEdit(transaction);
        setIsTxModalOpen(true);
    };

    const openEditGoalModal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
    };

    const openEditReminderModal = (reminder: Reminder) => {
        setReminderToEdit(reminder);
        setIsReminderModalOpen(true);
    };

    const openEditDebtModal = (debt: Debt) => {
        setDebtToEdit(debt);
        setIsDebtModalOpen(true);
    };

    const openDebtPaymentModal = (debt: Debt) => {
        setDebtForPayment(debt);
        setIsDebtPaymentModalOpen(true);
    };

    const contextValue = useMemo(() => ({
        isTxModalOpen,
        setIsTxModalOpen,
        transactionToEdit,
        setTransactionToEdit,
        openEditTransactionModal,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isEditBudgetModalOpen,
        setIsEditBudgetModalOpen,
        budgetToEdit,
        openEditBudgetModal,
        isTransferModalOpen,
        setIsTransferModalOpen,
        preFilledTransfer,
        setPreFilledTransfer,
        isDeleteModalOpen,
        transactionToDelete,
        openDeleteModal,
        closeDeleteModal,
        isEditWalletModalOpen,
        setIsEditWalletModalOpen,
        walletToEdit,
        openEditWalletModal,
        isGoalModalOpen,
        setIsGoalModalOpen,
        goalToEdit,
        setGoalToEdit,
        openEditGoalModal,
        isReminderModalOpen,
        setIsReminderModalOpen,
        reminderToEdit,
        setReminderToEdit,
        openEditReminderModal,
        isDebtModalOpen,
        setIsDebtModalOpen,
        debtToEdit,
        setDebtToEdit,
        openEditDebtModal,
        isDebtPaymentModalOpen,
        setIsDebtPaymentModalOpen,
        debtForPayment,
        setDebtForPayment,
        openDebtPaymentModal,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toastState,
        showToast,
        hideToast,
    }), [
        isTxModalOpen,
        transactionToEdit,
        isWalletModalOpen,
        isBudgetModalOpen,
        isEditBudgetModalOpen,
        budgetToEdit,
        isTransferModalOpen,
        preFilledTransfer,
        isDeleteModalOpen,
        transactionToDelete,
        isEditWalletModalOpen,
        walletToEdit,
        isGoalModalOpen,
        goalToEdit,
        isReminderModalOpen,
        reminderToEdit,
        isDebtModalOpen,
        debtToEdit,
        isDebtPaymentModalOpen,
        debtForPayment,
        isSidebarCollapsed,
        toastState
    ]);
    
    return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
}
