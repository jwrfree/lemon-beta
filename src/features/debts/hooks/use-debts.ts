import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/providers/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/types/models';
import { debtService } from '@/lib/services/debt-service';

export const useDebts = () => {
    const { user } = useApp();
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
        try {
            await debtService.addDebt(user.id, debtData);
            showToast("Catatan hutang/piutang dibuat!", 'success');
            setDebtToEdit(null);
            setIsDebtModalOpen(false);
            fetchDebts();
        } catch (err) {
            showToast("Gagal membuat catatan hutang/piutang.", 'error');
        }
    }, [user, showToast, setIsDebtModalOpen, setDebtToEdit, fetchDebts]);

    const updateDebt = useCallback(async (debtId: string, debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await debtService.updateDebt(debtId, debtData);
            showToast("Catatan hutang/piutang diperbarui.", 'success');
            setDebtToEdit(null);
            setIsDebtModalOpen(false);
            fetchDebts();
        } catch (err) {
            showToast("Gagal memperbarui catatan.", 'error');
        }
    }, [user, showToast, setIsDebtModalOpen, setDebtToEdit, fetchDebts]);

    const deleteDebt = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await debtService.deleteDebt(debtId);
            showToast("Catatan hutang/piutang dihapus.", 'info');
            setDebtToEdit(null);
            setIsDebtModalOpen(false);
            setDebts(prev => prev.filter(d => d.id !== debtId));
        } catch (err) {
            showToast("Gagal menghapus catatan.", 'error');
        }
    }, [user, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const markDebtSettled = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await debtService.settleDebt(debtId);
            showToast("Hutang/piutang ditandai lunas.", 'success');
            setDebts(prev => prev.map(d => d.id === debtId ? { ...d, status: 'settled', outstandingBalance: 0 } : d));
        } catch (err) {
            showToast("Gagal update status.", 'error');
        }
    }, [user, showToast]);

    const logDebtPayment = useCallback(async (debtId: string, paymentData: DebtPaymentInput) => {
        if (!user) throw new Error("User not authenticated.");
        try {
            await debtService.payDebt(user.id, debtId, paymentData);
            showToast("Pembayaran berhasil dicatat!", 'success');
            setDebtForPayment(null);
            setIsDebtPaymentModalOpen(false);
            fetchDebts();
        } catch (err) {
            showToast("Gagal mencatat pembayaran.", 'error');
        }
    }, [user, showToast, setDebtForPayment, setIsDebtPaymentModalOpen, fetchDebts]);

    const deleteDebtPayment = useCallback(async (debtId: string, paymentId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { data: debt, error: fetchError } = await supabase.from('debts').select('*').eq('id', debtId).single();
        if (fetchError || !debt) {
            showToast("Gagal mengambil data hutang.", 'error');
            return;
        }

        const payments = (debt.payments || []) as DebtPayment[];
        const paymentToRemove = payments.find(p => p.id === paymentId);
        if (!paymentToRemove) {
            showToast("Pembayaran tidak ditemukan.", 'error');
            return;
        }

        const remainingPayments = payments.filter(p => p.id !== paymentId);
        const newOutstanding = (debt.outstanding_balance || 0) + paymentToRemove.amount;

        const { error: updateError } = await supabase.from('debts').update({
            payments: remainingPayments,
            outstanding_balance: newOutstanding,
            status: 'active'
        }).eq('id', debtId);

        if (updateError) {
            showToast("Gagal menghapus pembayaran.", 'error');
            return;
        }

        showToast("Pencatatan pembayaran dihapus.", 'info');
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, payments: remainingPayments, outstandingBalance: newOutstanding, status: 'active' } : d));
    }, [user, supabase, showToast]);

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