
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
    durationMs?: number;
    actionLabel?: string;
    onAction?: () => void;
}

interface ToastOptions {
    durationMs?: number;
    actionLabel?: string;
    onAction?: () => void;
}

interface UIContextType {
    isTxSheetOpen: boolean;
    setIsTxSheetOpen: (isOpen: boolean) => void;
    transactionToEdit: Transaction | null;
    setTransactionToEdit: (transaction: Transaction | null) => void;
    txSheetMode: 'smart' | 'manual';
    openTransactionSheet: (transaction?: Transaction | null, mode?: 'smart' | 'manual') => void;
    isTransactionDetailOpen: boolean;
    setIsTransactionDetailOpen: (isOpen: boolean) => void;
    transactionToView: Transaction | null;
    setTransactionToView: (transaction: Transaction | null) => void;
    openTransactionDetail: (transaction: Transaction) => void;

    deferredPrompt: any;
    setDeferredPrompt: (prompt: any) => void;

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

    isSmartAddOpen: boolean;
    setIsSmartAddOpen: (isOpen: boolean) => void;

    isAIChatOpen: boolean;
    setIsAIChatOpen: (isOpen: boolean) => void;


    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (isCollapsed: boolean) => void;

    isAnyModalOpen: boolean;
    toastState: ToastState;
    showToast: (message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) => void;
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
    const [isTxSheetOpen, setIsTxSheetOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [txSheetMode, setTxSheetMode] = useState<'smart' | 'manual'>('smart');
    const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
    const [transactionToView, setTransactionToView] = useState<Transaction | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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
    const [isSmartAddOpen, setIsSmartAddOpen] = useState(false);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [toastState, setToastState] = useState<ToastState>({
        show: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) => {
        setToastState({
            show: true,
            message,
            type,
            durationMs: options?.durationMs,
            actionLabel: options?.actionLabel,
            onAction: options?.onAction,
        });
    };

    const hideToast = () => {
        setToastState(prev => ({ ...prev, show: false, onAction: undefined, actionLabel: undefined }));
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

    const openTransactionSheet = (transaction?: Transaction | null, mode: 'smart' | 'manual' = 'smart') => {
        if (transaction?.category === 'Transfer') {
            showToast("Mengedit transaksi transfer belum didukung.", 'error');
            return;
        }
        setTransactionToEdit(transaction || null);
        setTxSheetMode(mode);
        setIsTxSheetOpen(true);
    };

    const openTransactionDetail = (transaction: Transaction) => {
        setTransactionToView(transaction);
        setIsTransactionDetailOpen(true);
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

    const isAnyModalOpen =
        isTxSheetOpen ||
        isTransactionDetailOpen ||
        isWalletModalOpen ||
        isBudgetModalOpen ||
        isEditBudgetModalOpen ||
        isTransferModalOpen ||
        isDeleteModalOpen ||
        isEditWalletModalOpen ||
        isGoalModalOpen ||
        isReminderModalOpen ||
        isDebtModalOpen ||
        isDebtPaymentModalOpen ||
        isSmartAddOpen ||
        isAIChatOpen;

    const contextValue = useMemo(() => ({
        isTxSheetOpen,
        setIsTxSheetOpen,
        transactionToEdit,
        setTransactionToEdit,
        txSheetMode,
        openTransactionSheet,
        isTransactionDetailOpen,
        setIsTransactionDetailOpen,
        transactionToView,
        setTransactionToView,
        openTransactionDetail,
        deferredPrompt,
        setDeferredPrompt,
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
        isSmartAddOpen,
        setIsSmartAddOpen,
        isAIChatOpen,
        setIsAIChatOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isAnyModalOpen,
        toastState,
        showToast,
        hideToast,
    }), [
        isTxSheetOpen,
        isTransactionDetailOpen,
        deferredPrompt,
        transactionToEdit,
        transactionToView,
        txSheetMode,
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
        isSmartAddOpen,
        isAIChatOpen,
        isSidebarCollapsed,
        isAnyModalOpen,
        toastState
    ]);

    return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
}
