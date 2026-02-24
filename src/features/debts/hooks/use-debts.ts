'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput, Transaction } from '@/types/models';
import { debtService } from '@/lib/services/debt-service';
import { transactionEvents } from '@/lib/transaction-events';

export const useDebts = () => {
    const { user, isLoading: appLoading } = useAuth();
    const router = useNextRouter();
    const { showToast, setDebtForPayment, setIsDebtPaymentModalOpen, setDebtToEdit, setIsDebtModalOpen } = useUI();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchDebts = useCallback(async () => {
        if (!user) return;
        try {
            const data = await debtService.getDebts(user.id);
            setDebts(data);
        } catch (err) {
            console.error("Error fetching debts:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setDebts([]);
            setIsLoading(false);
            return;
        }
        fetchDebts();

        const channel = supabase
            .channel('debts-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'debts',
                    filter: `user_id=eq.${user.id}`,
                },
                () => fetchDebts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchDebts, supabase]);

    const addDebt = useCallback(async (debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Add
        const tempId = `temp-${Date.now()}`;
        const newDebt: Debt = {
            id: tempId,
            userId: user.id,
            ...debtData,
            status: 'active', // Default
            payments: [],
            createdAt: new Date().toISOString()
        } as Debt;

        setDebts(prev => [newDebt, ...prev]);
        setIsDebtModalOpen(false);

        try {
            await debtService.addDebt(user.id, debtData);
            showToast("Catatan hutang/piutang dibuat!", 'success');
            setDebtToEdit(null);
            // fetchDebts handled by subscription
        } catch (err) {
            setDebts(prev => prev.filter(d => d.id !== tempId)); // Revert
            setIsDebtModalOpen(true); // Re-open modal so user can retry
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
            showToast(`Gagal membuat catatan: ${message}`, 'error');
            throw err; // Re-throw so the form can react
        }
    }, [user, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const updateDebt = useCallback(async (debtId: string, debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Update
        const previousDebts = [...debts];
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, ...debtData } : d));
        setIsDebtModalOpen(false);

        try {
            await debtService.updateDebt(debtId, debtData);
            showToast("Catatan hutang/piutang diperbarui.", 'success');
            setDebtToEdit(null);
            // fetchDebts handled by subscription
        } catch (err) {
            setDebts(previousDebts); // Revert
            setIsDebtModalOpen(true); // Re-open modal so user can retry
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
            showToast(`Gagal memperbarui catatan: ${message}`, 'error');
            throw err; // Re-throw so the form can react
        }
    }, [user, debts, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const deleteDebt = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Delete
        const previousDebts = [...debts];
        setDebts(prev => prev.filter(d => d.id !== debtId));
        setIsDebtModalOpen(false);

        try {
            await debtService.deleteDebt(debtId);
            showToast("Catatan hutang/piutang dihapus.", 'info');
            setDebtToEdit(null);
        } catch (err) {
            setDebts(previousDebts); // Revert
            showToast("Gagal menghapus catatan.", 'error');
        }
    }, [user, debts, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const markDebtSettled = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Settle
        const previousDebts = [...debts];
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, status: 'settled', outstandingBalance: 0 } : d));

        try {
            await debtService.settleDebt(debtId);
            showToast("Hutang/piutang ditandai lunas.", 'success');
        } catch (err) {
            setDebts(previousDebts); // Revert
            showToast("Gagal update status.", 'error');
        }
    }, [user, debts, showToast]);

    const logDebtPayment = useCallback(async (debtId: string, paymentData: DebtPaymentInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        // 1. Optimistic Debt Update
        const targetDebt = debts.find(d => d.id === debtId);
        if (!targetDebt) return;

        const paymentAmount = paymentData.amount;
        const newOutstanding = Math.max(0, targetDebt.outstandingBalance - paymentAmount);
        const newStatus = newOutstanding <= 0 ? 'settled' : targetDebt.status;
        
        const previousDebts = [...debts];
        setDebts(prev => prev.map(d => {
            if (d.id === debtId) {
                return {
                    ...d,
                    outstandingBalance: newOutstanding,
                    status: newStatus
                };
            }
            return d;
        }));

        setIsDebtPaymentModalOpen(false);

        try {
            await debtService.payDebt(user.id, debtId, paymentData);
            showToast("Pembayaran berhasil dicatat!", 'success');
            setDebtForPayment(null);
            
            // 2. Emit Transaction Event (because payDebt creates a transaction!)
            // We construct a fake transaction to update the UI immediately
            if (paymentData.walletId) {
                // direction 'owed'  (Saya Berhutang  = I owe someone) -> I pay  -> Expense
                // direction 'owing' (Orang Lain Berhutang = Someone owes me) -> I receive -> Income
                const txType = targetDebt.direction === 'owed' ? 'expense' : 'income';
                
                const optimisticTx: Transaction = {
                    id: `temp-pay-${Date.now()}`,
                    amount: paymentAmount,
                    category: targetDebt.direction === 'owed' ? 'Bayar Hutang' : 'Terima Piutang',
                    date: paymentData.paymentDate ? new Date(paymentData.paymentDate).toISOString() : new Date().toISOString(),
                    description: `Pembayaran ${targetDebt.title}`,
                    type: txType,
                    walletId: paymentData.walletId,
                    userId: user.id
                };
                
                transactionEvents.emit('transaction.created', optimisticTx);
            }

        } catch (err) {
            setDebts(previousDebts); // Revert
            showToast("Gagal mencatat pembayaran.", 'error');
        }
    }, [user, debts, showToast, setDebtForPayment, setIsDebtPaymentModalOpen]);

    const deleteDebtPayment = useCallback(async (debtId: string, paymentId: string) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await debtService.deleteDebtPayment(user.id, debtId, paymentId);
            showToast("Pencatatan pembayaran dihapus.", 'info');
            fetchDebts(); // Re-fetch is safer here as calculating revert amount needs lookup
        } catch (err) {
            showToast("Gagal menghapus pembayaran.", 'error');
        }
    }, [user, showToast, fetchDebts]);

    return {
        debts,
        isLoading,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtSettled,
        logDebtPayment,
        deleteDebtPayment
    };
};
