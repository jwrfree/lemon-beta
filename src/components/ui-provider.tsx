
'use client';

import React, { useState, createContext, useContext, useCallback } from 'react';

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
    transactionToEdit: any | null;
    setTransactionToEdit: (transaction: any | null) => void;
    openEditTransactionModal: (transaction: any) => void;

    isWalletModalOpen: boolean;
    setIsWalletModalOpen: (isOpen: boolean) => void;
    isBudgetModalOpen: boolean;
    setIsBudgetModalOpen: (isOpen: boolean) => void;
    isEditBudgetModalOpen: boolean;
    setIsEditBudgetModalOpen: (isOpen: boolean) => void;
    budgetToEdit: any | null;
    openEditBudgetModal: (budget: any) => void;
    isTransferModalOpen: boolean;
    setIsTransferModalOpen: (isOpen: boolean) => void;
    preFilledTransfer: PreFilledTransfer | null;
    setPreFilledTransfer: (transfer: PreFilledTransfer | null) => void;
    isDeleteModalOpen: boolean;
    transactionToDelete: any | null;
    openDeleteModal: (transaction: any) => void;
    closeDeleteModal: () => void;
    isEditWalletModalOpen: boolean;
    setIsEditWalletModalOpen: (isOpen: boolean) => void;
    walletToEdit: any | null;
    openEditWalletModal: (wallet: any) => void;

    isGoalModalOpen: boolean;
    setIsGoalModalOpen: (isOpen: boolean) => void;
    goalToEdit: any | null;
    setGoalToEdit: (goal: any | null) => void;
    openEditGoalModal: (goal: any) => void;

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
    const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<any | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
    const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
    const [walletToEdit, setWalletToEdit] = useState<any | null>(null);
    const [preFilledTransfer, setPreFilledTransfer] = useState<PreFilledTransfer | null>(null);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<any | null>(null);

    const [toastState, setToastState] = useState<ToastState>({ show: false, message: '', type: 'info' });
    
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToastState({ show: true, message, type });
    };

    const hideToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };
    
    const openDeleteModal = (transaction: any) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
    };

    const openEditWalletModal = (wallet: any) => {
        setWalletToEdit(wallet);
        setIsEditWalletModalOpen(true);
    };
    
    const openEditBudgetModal = (budget: any) => {
        setBudgetToEdit(budget);
        setIsEditBudgetModalOpen(true);
    };

    const openEditTransactionModal = (transaction: any) => {
        if (transaction.category === 'Transfer') {
            showToast("Mengedit transaksi transfer belum didukung.", 'error');
            return;
        }
        setTransactionToEdit(transaction);
        setIsTxModalOpen(true);
    };

    const openEditGoalModal = (goal: any) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
    };

    const contextValue = {
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
        toastState,
        showToast,
        hideToast,
    };
    
    return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
}
