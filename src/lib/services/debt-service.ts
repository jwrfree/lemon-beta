import { createClient } from '@/lib/supabase/client';
import { normalizeDateInput } from '@/lib/utils';
import type { Debt, DebtInput, DebtPaymentInput, DebtRow } from '@/types/models';

const supabase = createClient();

export const mapDebtFromDb = (d: DebtRow): Debt => ({
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

export const debtService = {
    async getDebts(userId: string) {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDebtFromDb);
    },

    async addDebt(userId: string, debtData: DebtInput) {
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
            user_id: userId
        });
        if (error) throw error;
    },

    async updateDebt(debtId: string, debtData: DebtInput) {
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
        if (error) throw error;
    },

    async deleteDebt(debtId: string) {
        const { error } = await supabase.from('debts').delete().eq('id', debtId);
        if (error) throw error;
    },

    async settleDebt(debtId: string) {
        const { error } = await supabase.from('debts').update({
            status: 'settled',
            outstanding_balance: 0,
        }).eq('id', debtId);
        if (error) throw error;
    },

    async payDebt(userId: string, debtId: string, paymentData: DebtPaymentInput) {
        const { error } = await supabase.rpc('pay_debt_v1', {
            p_debt_id: debtId,
            p_payment_amount: paymentData.amount,
            p_payment_date: paymentData.paymentDate,
            p_wallet_id: paymentData.walletId || null,
            p_notes: paymentData.notes || '',
            p_user_id: userId
        });
        if (error) throw error;
    }
};
