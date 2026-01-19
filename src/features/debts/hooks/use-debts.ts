'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/providers/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import { normalizeDateInput } from '@/lib/utils';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/types/models';

const mapDebtFromDb = (d: any): Debt => ({
    id: d.id,
    title: d.title,
    counterparty: d.counterparty,
    principal: d.principal,
    outstandingBalance: d.outstanding_balance,
    status: d.status,
    dueDate: d.due_date,
    startDate: d.start_date,
    notes: d.notes,
    direction: d.direction,
    category: d.category,
    interestRate: d.interest_rate,
    paymentFrequency: d.payment_frequency,
    customInterval: d.custom_interval,
    nextPaymentDate: d.next_payment_date,
    payments: d.payments || [],
    userId: d.user_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at
});

export const useDebts = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const { showToast, setDebtForPayment, setIsDebtPaymentModalOpen, setDebtToEdit, setIsDebtModalOpen } = useUI();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchDebts = useCallback(async () => {
        if (!user) return;
        const { data: debtsData } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (debtsData) {
            setDebts(debtsData.map(mapDebtFromDb));
        }
        setIsLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        if (!user) {
            setDebts([]);
            setIsLoading(false);
            return;
        }
        fetchDebts();
    }, [user, fetchDebts]);

    const addDebt = useCallback(async (debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('debts').insert({
            title: debtData.title,
            counterparty: debtData.counterparty,
            principal: debtData.principal ?? 0,
            outstanding_balance: debtData.outstandingBalance ?? debtData.principal ?? 0,
            direction: debtData.direction || 'owed',
            category: debtData.category || 'personal',
            interest_rate: debtData.interestRate ?? null,
            payment_frequency: debtData.paymentFrequency || 'monthly',
            custom_interval: debtData.customInterval || null,
            start_date: normalizeDateInput(debtData.startDate),
            due_date: normalizeDateInput(debtData.dueDate),
            next_payment_date: normalizeDateInput(debtData.nextPaymentDate),
            notes: debtData.notes || '',
            status: debtData.status || 'active',
            payments: debtData.payments || [],
            user_id: user.id
        });

        if (error) {
            console.error("Error adding debt:", error);
            showToast("Gagal membuat catatan hutang/piutang.", 'error');
            return;
        }

        showToast("Catatan hutang/piutang dibuat!", 'success');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
        fetchDebts();
    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit, fetchDebts]);

    const updateDebt = useCallback(async (debtId: string, debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");

        const { error } = await supabase.from('debts').update({
            title: debtData.title,
            counterparty: debtData.counterparty,
            principal: debtData.principal,
            outstanding_balance: debtData.outstandingBalance,
            start_date: normalizeDateInput(debtData.startDate),
            due_date: normalizeDateInput(debtData.dueDate),
            next_payment_date: normalizeDateInput(debtData.nextPaymentDate),
            notes: debtData.notes,
            status: debtData.status,
        }).eq('id', debtId);

        if (error) {
             showToast("Gagal memperbarui catatan.", 'error');
             return;
        }

        showToast("Catatan hutang/piutang diperbarui.", 'success');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
        fetchDebts();
    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit, fetchDebts]);

    const deleteDebt = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('debts').delete().eq('id', debtId);
        if (error) {
             showToast("Gagal menghapus catatan.", 'error');
             return;
        }

        showToast("Catatan hutang/piutang dihapus.", 'info');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
        setDebts(prev => prev.filter(d => d.id !== debtId));
    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const markDebtSettled = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('debts').update({
            status: 'settled',
            outstanding_balance: 0,
        }).eq('id', debtId);

        if (error) {
             showToast("Gagal update status.", 'error');
             return;
        }

        showToast("Hutang/piutang ditandai lunas.", 'success');
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, status: 'settled', outstandingBalance: 0 } : d));
    }, [user, supabase, showToast]);

    const logDebtPayment = useCallback(async (debtId: string, paymentData: DebtPaymentInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.rpc('pay_debt_v1', {
            p_debt_id: debtId,
            p_payment_amount: paymentData.amount,
            p_payment_date: paymentData.paymentDate,
            p_wallet_id: paymentData.walletId || null,
            p_notes: paymentData.notes || '',
            p_user_id: user.id
        });

        if (error) {
             console.error("Error logging debt payment:", error);
             showToast("Gagal mencatat pembayaran.", 'error');
             return;
        }

        showToast("Pembayaran berhasil dicatat!", 'success');
        setDebtForPayment(null);
        setIsDebtPaymentModalOpen(false);
        fetchDebts();
    }, [user, supabase, showToast, setDebtForPayment, setIsDebtPaymentModalOpen, fetchDebts]);

    const deleteDebtPayment = useCallback(async (debtId: string, paymentId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { data: debt } = await supabase.from('debts').select('*').eq('id', debtId).single();
        if (!debt) return;

        const payments = (debt.payments || []) as DebtPayment[];
        const paymentToRemove = payments.find(p => p.id === paymentId);
        if (!paymentToRemove) return;

        const remainingPayments = payments.filter(p => p.id !== paymentId);
        const newOutstanding = (debt.outstanding_balance || 0) + paymentToRemove.amount;

        const { error } = await supabase.from('debts').update({
            payments: remainingPayments,
            outstanding_balance: newOutstanding,
            status: 'active'
        }).eq('id', debtId);

        if (error) {
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
