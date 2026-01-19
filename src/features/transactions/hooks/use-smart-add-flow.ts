'use client';

import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/hooks/use-data';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useUI } from '@/components/ui-provider';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import { startOfMonth, parseISO } from 'date-fns';

export type PageState = 'IDLE' | 'ANALYZING' | 'CONFIRMING' | 'EDITING';

export type Message = {
    id: string;
    type: 'user' | 'user-image' | 'ai-thinking' | 'ai-confirmation';
    content: any;
};

export type InsightData = {
    wallet: {
        currentBalance: number;
        newBalance: number;
    } | null;
    budget: {
        name: string;
        currentRemaining: number;
        newRemaining: number;
    } | null;
}

export const useSmartAddFlow = () => {
    const { wallets, transactions, incomeCategories, expenseCategories, addTransaction } = useData();
    const { budgets } = useBudgets();
    const { setIsTransferModalOpen, setPreFilledTransfer, showToast } = useUI();

    const [pageState, setPageState] = useState<PageState>('IDLE');
    const [messages, setMessages] = useState<Message[]>([]);
    const [parsedData, setParsedData] = useState<any | null>(null);
    const [insightData, setInsightData] = useState<InsightData | null>(null);

    const resetFlow = useCallback((keepInput = false) => {
        setPageState('IDLE');
        setParsedData(null);
        setInsightData(null);
        setMessages([]);
    }, []);

    const calculateInsights = useCallback((dataToConfirm: any) => {
        const finalWallet = wallets.find(w => w.id === dataToConfirm.walletId);
        let walletInsight = null;
        if (finalWallet) {
            walletInsight = {
                currentBalance: finalWallet.balance,
                newBalance: dataToConfirm.type === 'expense' ? finalWallet.balance - dataToConfirm.amount : finalWallet.balance + dataToConfirm.amount
            };
        }

        let budgetInsight = null;
        if (dataToConfirm.type === 'expense') {
            const relevantBudget = budgets.find(b => b.categories.includes(dataToConfirm.category));
            if (relevantBudget) {
                const now = new Date();
                const start = startOfMonth(now);
                const budgetTransactions = transactions.filter(t =>
                    t.type === 'expense' &&
                    relevantBudget.categories.includes(t.category) &&
                    parseISO(t.date) >= start
                );
                const spent = budgetTransactions.reduce((acc, t) => acc + t.amount, 0);
                const currentRemaining = relevantBudget.targetAmount - spent;

                budgetInsight = {
                    name: relevantBudget.name,
                    currentRemaining,
                    newRemaining: currentRemaining - dataToConfirm.amount,
                }
            }
        }
        return { walletInsight, budgetInsight };
    }, [wallets, budgets, transactions]);

    const handleAISuccess = useCallback((result: any, isReceipt = false) => {
        const { category, sourceWallet, destinationWallet, amount, description, type, subCategory, location, merchant, date } = result;

        // 1. Smart transfer detection
        if (category === 'Transfer' && sourceWallet && destinationWallet) {
            const from = wallets.find(w => w.name.toLowerCase() === sourceWallet.toLowerCase());
            const to = wallets.find(w => w.name.toLowerCase() === destinationWallet.toLowerCase());

            if (from && to) {
                setPreFilledTransfer({
                    fromWalletId: from.id,
                    toWalletId: to.id,
                    amount: amount || 0,
                    description: description || 'Transfer',
                });
                setIsTransferModalOpen(true);
                resetFlow();
                return;
            }
        }

        // 2. Wallet resolution
        const walletName = (result.wallet || sourceWallet || '').toLowerCase();
        const matchingWallet = wallets.find(w => w.name.toLowerCase() === walletName);
        const walletId = matchingWallet?.id || wallets.find(w => w.isDefault)?.id || wallets.find(w => w.name.toLowerCase() === 'tunai')?.id || '';

        // 3. Type & Category resolution
        let transactionType: 'income' | 'expense' = type || 'expense';
        if (incomeCategories.some(c => c.name === category)) transactionType = 'income';
        else if (expenseCategories.some(c => c.name === category)) transactionType = 'expense';

        const dataToConfirm = {
            type: transactionType,
            amount: Math.abs(amount || 0),
            description: description || (isReceipt ? 'Transaksi dari struk' : 'Transaksi baru'),
            category: category || 'Lain-lain',
            subCategory: subCategory || '',
            walletId,
            location: location || merchant || '',
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
        };

        const { walletInsight, budgetInsight } = calculateInsights(dataToConfirm);
        setInsightData({ wallet: walletInsight, budget: budgetInsight });
        setParsedData(dataToConfirm);
        setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
        setPageState('CONFIRMING');
    }, [wallets, incomeCategories, expenseCategories, calculateInsights, setPreFilledTransfer, setIsTransferModalOpen, resetFlow]);

    const processInput = useCallback(async (input: string | { type: 'image', dataUrl: string }) => {
        if (typeof input === 'string') {
            if (!input.trim()) return;
            setMessages([{ id: `user-${Date.now()}`, type: 'user', content: input }]);
        } else {
            setMessages([{ id: `user-image-${Date.now()}`, type: 'user-image', content: input.dataUrl }]);
        }

        setPageState('ANALYZING');
        setMessages(prev => [...prev, { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: '' }]);

        try {
            if (typeof input === 'string') {
                const result = await extractTransaction(input);
                handleAISuccess(result);
            } else {
                const availableCategories = [...expenseCategories.map(c => c.name), ...incomeCategories.map(c => c.name)];
                const result = await scanReceipt({ photoDataUri: input.dataUrl, availableCategories });
                handleAISuccess(result, true);
            }
        } catch (error) {
            console.error('AI processing failed:', error);
            showToast('Oops! Gagal menganalisis input. Coba lagi ya.', 'error');
            resetFlow(true);
        }
    }, [expenseCategories, incomeCategories, handleAISuccess, showToast, resetFlow]);

    const saveTransaction = useCallback(async (andAddAnother = false) => {
        if (!parsedData) return;
        setPageState('ANALYZING');
        try {
            await addTransaction(parsedData);
            showToast("Transaksi berhasil disimpan!", 'success');
            if (andAddAnother) {
                resetFlow();
            } else {
                return true; // signal success to component to redirect
            }
        } catch (error) {
            console.error("Failed to save transaction:", error);
            showToast("Gagal menyimpan transaksi.", 'error');
            setPageState('CONFIRMING');
        }
        return false;
    }, [parsedData, addTransaction, showToast, resetFlow]);

    return {
        pageState,
        setPageState,
        messages,
        parsedData,
        setParsedData,
        insightData,
        processInput,
        saveTransaction,
        resetFlow,
    };
};
