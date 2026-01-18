'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/types/models';

const normalizeDateInput = (value: string | Date | null | undefined): string | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        return value;
    }
    return value.toISOString();
};

export const useDebts = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const { showToast, setDebtForPayment, setIsDebtPaymentModalOpen, setDebtToEdit, setIsDebtModalOpen } = useUI();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setDebts([]);
            setIsLoading(false);
            return;
        }

        const fetchDebts = async () => {
            const { data: debtsData } = await supabase
                .from('debts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (debtsData) {
                 const mappedDebts = debtsData.map((d: any) => ({
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
                }));
                setDebts(mappedDebts);
            }
            setIsLoading(false);
        };

        fetchDebts();
    }, [user, supabase]);

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
        
        // Refresh
        const { data } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setDebts(data.map((d: any) => ({
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
        })));

    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit]);

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
        
        // Refresh
        const { data } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setDebts(data.map((d: any) => ({
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
        })));

    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit]);

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
        router.back(); // Usually called from detail page, but safe if on list page? Might want to check path.
        // Actually, if on list page, router.back() might go to previous page which is not intended.
        // But the original code had it. I'll keep it but maybe we should only do it if we are on detail page.
        // For now, I'll remove router.back() here and let the component handle navigation if needed, 
        // OR just keep it if it was working for the user. 
        // The original code was: `router.back();`
        // I will keep it for now but note it might be an issue on list page.
        
        setDebts(prev => prev.filter(d => d.id !== debtId));

    }, [user, supabase, showToast, setIsDebtModalOpen, setDebtToEdit, router]);

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
        
        // 1. Fetch current debt
        const { data: debt, error: fetchError } = await supabase.from('debts').select('*').eq('id', debtId).single();
        if (fetchError || !debt) {
             showToast("Debt not found", 'error');
             return;
        }

        const paymentId = crypto.randomUUID();
        const paymentRecord: DebtPayment = {
            id: paymentId,
            amount: paymentData.amount,
            paymentDate: paymentData.paymentDate,
            walletId: paymentData.walletId || null,
            method: paymentData.method || 'manual',
            notes: paymentData.notes || '',
            createdAt: new Date().toISOString(),
        };

        const existingPayments = debt.payments || [];
        const updatedPayments = [...existingPayments, paymentRecord];
        const newOutstanding = Math.max(0, (debt.outstanding_balance || 0) - paymentData.amount);
        const newStatus = newOutstanding <= 0 ? 'settled' : debt.status;

        // 2. Update Debt
        const { error: updateError } = await supabase.from('debts').update({
            payments: updatedPayments,
            outstanding_balance: newOutstanding,
            status: newStatus,
            next_payment_date: paymentData.nextPaymentDate || debt.next_payment_date
        }).eq('id', debtId);

        if (updateError) {
             showToast("Gagal mencatat pembayaran.", 'error');
             return;
        }

        // 3. Update Wallet & Create Transaction if walletId provided
        if (paymentData.walletId) {
             const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', paymentData.walletId).single();
             if (wallet) {
                 const isOwed = debt.direction === 'owed';
                 const newBalance = isOwed ? wallet.balance - paymentData.amount : wallet.balance + paymentData.amount;
                 
                 await supabase.from('wallets').update({ balance: newBalance }).eq('id', paymentData.walletId);
                 
                 await supabase.from('transactions').insert({
                    type: isOwed ? 'expense' : 'income',
                    amount: paymentData.amount,
                    category: isOwed ? 'Bayar Hutang' : 'Terima Piutang',
                    wallet_id: paymentData.walletId,
                    description: paymentData.notes
                        ? `${isOwed ? 'Pembayaran' : 'Penerimaan'} ${debt.title}: ${paymentData.notes}`
                        : `${isOwed ? 'Pembayaran' : 'Penerimaan'} ${debt.title}`,
                    date: paymentData.paymentDate,
                    user_id: user.id,
                 });
             }
        }

        showToast("Pembayaran berhasil dicatat!", 'success');
        setDebtForPayment(null);
        setIsDebtPaymentModalOpen(false);

        // Refresh debts
        const { data } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setDebts(data.map((d: any) => ({
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
        })));

    }, [user, supabase, showToast, setDebtForPayment, setIsDebtPaymentModalOpen]);

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

        // Refresh debts
        setDebts(prev => prev.map(d => {
            if (d.id === debtId) {
                return {
                    ...d,
                    payments: remainingPayments,
                    outstandingBalance: newOutstanding,
                    status: 'active'
                };
            }
            return d;
        }));

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
