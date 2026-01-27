'use client';

import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/hooks/use-data';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useUI } from '@/components/ui-provider';
import { extractTransaction, refineTransaction } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import { startOfMonth, parseISO } from 'date-fns';

export type PageState = 'IDLE' | 'ANALYZING' | 'CONFIRMING' | 'EDITING' | 'MULTI_CONFIRMING';

export interface SmartTransactionData {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    subCategory: string;
    walletId: string;
    location: string;
    date: string;
    isDebtPayment?: boolean;
    counterparty?: string;
    sourceWallet?: string;
    destinationWallet?: string;
}

export type Message = {
    id: string;
    type: 'user' | 'user-image' | 'ai-thinking' | 'ai-confirmation' | 'ai-multi-confirmation' | 'ai-clarification';
    content: any;
};

export type InsightData = {
    wallet: {
        id: string;
        name: string;
        currentBalance: number;
        newBalance: number;
        isInsufficient: boolean;
    } | null;
    budget: {
        name: string;
        currentRemaining: number;
        newRemaining: number;
        isOverBudget: boolean;
    } | null;
}

export const useSmartAddFlow = () => {
    const { wallets, transactions, incomeCategories, expenseCategories, addTransaction } = useData();
    const { budgets } = useBudgets();
    const { setIsTransferModalOpen, setPreFilledTransfer, showToast } = useUI();

    const [pageState, setPageState] = useState<PageState>('IDLE');
    const [messages, setMessages] = useState<Message[]>([]);
    const [parsedData, setParsedData] = useState<SmartTransactionData | null>(null);
    const [multiParsedData, setMultiParsedData] = useState<SmartTransactionData[]>([]);
    const [insightData, setInsightData] = useState<InsightData | null>(null);

    const removeMultiTransaction = useCallback((index: number) => {
        setMultiParsedData(prev => {
            const newData = prev.filter((_, i) => i !== index);
            if (newData.length === 0) {
                setPageState('IDLE');
            }
            return newData;
        });
    }, []);

    const resetFlow = useCallback((keepInput = false) => {
        setPageState('IDLE');
        setParsedData(null);
        setMultiParsedData([]);
        setInsightData(null);
        setMessages([]);
    }, []);

    const calculateInsights = useCallback((dataToConfirm: any) => {
        const finalWallet = wallets.find(w => w.id === dataToConfirm.walletId);
        let walletInsight = null;
        if (finalWallet) {
            const newBalance = dataToConfirm.type === 'expense' 
                ? finalWallet.balance - dataToConfirm.amount 
                : finalWallet.balance + dataToConfirm.amount;
            
            walletInsight = {
                id: finalWallet.id,
                name: finalWallet.name,
                currentBalance: finalWallet.balance,
                newBalance,
                isInsufficient: dataToConfirm.type === 'expense' && newBalance < 0
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
                const newRemaining = currentRemaining - dataToConfirm.amount;

                budgetInsight = {
                    name: relevantBudget.name,
                    currentRemaining,
                    newRemaining,
                    isOverBudget: newRemaining < 0
                }
            }
        }
        return { walletInsight, budgetInsight };
    }, [wallets, budgets, transactions]);

    const handleAISuccess = useCallback((result: any, isReceipt = false) => {
        // Remove thinking message first
        setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));

        // Handle clarification question if present
        if (result.clarificationQuestion) {
            setMessages(prev => [
                ...prev,
                { 
                    id: `ai-clarify-${Date.now()}`, 
                    type: 'ai-clarification', 
                    content: result.clarificationQuestion 
                }
            ]);
            // If there are no transactions, just stay in confirming/analyzing mode
            if (!result.transactions || result.transactions.length === 0) {
                setPageState('CONFIRMING');
                return;
            }
        }

        const rawTransactions = result.transactions || (result.amount ? [result] : []);
        if (rawTransactions.length === 0 && !result.clarificationQuestion) {
            showToast("AI tidak menemukan data transaksi. Coba input lebih detail ya.", 'info');
            setPageState('IDLE');
            return;
        }

        const processedTransactions = rawTransactions.map((tx: any) => {
            const { category, sourceWallet, destinationWallet, amount, description, type, subCategory, location, merchant, date, isDebtPayment, counterparty } = tx;

            // 1. Wallet resolution with fuzzy matching
            const walletName = (tx.wallet || sourceWallet || '').toLowerCase().trim();
            let matchingWallet = wallets.find(w => w.name.toLowerCase() === walletName);
            
            // If no exact match, try fuzzy matching (e.g., "BCA" matches "Bank BCA")
            if (!matchingWallet && walletName) {
                matchingWallet = wallets.find(w => 
                    w.name.toLowerCase().includes(walletName) || 
                    walletName.includes(w.name.toLowerCase())
                );
            }
            
            const walletId = matchingWallet?.id || wallets.find(w => w.isDefault)?.id || wallets.find(w => w.name.toLowerCase() === 'tunai')?.id || wallets[0]?.id || '';

            // 2. Type & Category resolution
            let transactionType: 'income' | 'expense' = type || 'expense';
            
            // Normalize category from AI
            const normalizedCategory = (category || '').trim();
            const allCategories = [...incomeCategories, ...expenseCategories];
            
            // Try exact match first
            let finalCategory = allCategories.find(c => c.name.toLowerCase() === normalizedCategory.toLowerCase())?.name;
            
            // If no exact match, try fuzzy
            if (!finalCategory && normalizedCategory) {
                finalCategory = allCategories.find(c => 
                    c.name.toLowerCase().includes(normalizedCategory.toLowerCase()) || 
                    normalizedCategory.toLowerCase().includes(c.name.toLowerCase())
                )?.name;
            }

            if (!finalCategory) {
                if (incomeCategories.some(c => c.name === normalizedCategory)) transactionType = 'income';
                else if (expenseCategories.some(c => c.name === normalizedCategory)) transactionType = 'expense';
                finalCategory = normalizedCategory || 'Lain-lain';
            } else {
                // Set type based on the matched category
                if (incomeCategories.some(c => c.name === finalCategory)) transactionType = 'income';
                else transactionType = 'expense';
            }

            return {
                type: transactionType,
                amount: Math.abs(amount || 0),
                description: description || (isReceipt ? 'Transaksi dari struk' : 'Transaksi baru'),
                category: finalCategory,
                subCategory: subCategory || '',
                walletId,
                location: location || merchant || '',
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
                isDebtPayment,
                counterparty,
                sourceWallet,
                destinationWallet
            };
        });

        if (processedTransactions.length > 1) {
            setMultiParsedData(processedTransactions);
            setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
            setPageState('MULTI_CONFIRMING');
        } else {
            const dataToConfirm = processedTransactions[0];

            // Smart transfer detection (only for single transaction for now to keep flow simple)
            if (dataToConfirm.category === 'Transfer' && dataToConfirm.sourceWallet && dataToConfirm.destinationWallet) {
                const from = wallets.find(w => w.name.toLowerCase() === dataToConfirm.sourceWallet.toLowerCase());
                const to = wallets.find(w => w.name.toLowerCase() === dataToConfirm.destinationWallet.toLowerCase());

                if (from && to) {
                    setPreFilledTransfer({
                        fromWalletId: from.id,
                        toWalletId: to.id,
                        amount: dataToConfirm.amount || 0,
                        description: dataToConfirm.description || 'Transfer',
                    });
                    setIsTransferModalOpen(true);
                    resetFlow();
                    return;
                }
            }

            const { walletInsight, budgetInsight } = calculateInsights(dataToConfirm);
            setInsightData({ wallet: walletInsight, budget: budgetInsight });
            setParsedData(dataToConfirm);
            setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
            setPageState('CONFIRMING');
        }
    }, [wallets, incomeCategories, expenseCategories, calculateInsights, setPreFilledTransfer, setIsTransferModalOpen, resetFlow]);

    const processInput = useCallback(async (input: string | { type: 'image', dataUrl: string }) => {
        const isRefinement = (pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING') && typeof input === 'string';
        
        if (typeof input === 'string') {
            if (!input.trim()) return;
            setMessages(prev => [...prev, { id: `user-${Date.now()}`, type: 'user', content: input }]);
        } else {
            setMessages(prev => [...prev, { id: `user-image-${Date.now()}`, type: 'user-image', content: input.dataUrl }]);
        }

        setPageState('ANALYZING');
        setMessages(prev => [...prev, { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: '' }]);

        try {
            const availableCategories = [...expenseCategories.map(c => c.name), ...incomeCategories.map(c => c.name)];
            const availableWallets = wallets.map(w => w.name);

            if (isRefinement && typeof input === 'string') {
                // Prepare current data for refinement
                const currentData = {
                    transactions: multiParsedData.length > 0 ? multiParsedData : (parsedData ? [parsedData] : []),
                };
                
                const result = await refineTransaction(currentData as any, input, {
                    categories: availableCategories,
                    wallets: availableWallets
                });
                handleAISuccess(result);
            } else if (typeof input === 'string') {
                const result = await extractTransaction(input, {
                    categories: availableCategories,
                    wallets: availableWallets
                });
                handleAISuccess(result);
            } else {
                const result = await scanReceipt({ photoDataUri: input.dataUrl, availableCategories });
                handleAISuccess(result, true);
            }
        } catch (error) {
            console.error('AI processing failed:', error);
            showToast('Oops! Gagal menganalisis input. Coba lagi ya.', 'error');
            resetFlow(true);
        }
    }, [wallets, expenseCategories, incomeCategories, handleAISuccess, showToast, resetFlow, pageState, parsedData, multiParsedData]);

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

    const saveMultiTransactions = useCallback(async () => {
        if (multiParsedData.length === 0) return;
        setPageState('ANALYZING');
        try {
            for (const tx of multiParsedData) {
                await addTransaction(tx);
            }
            showToast(`${multiParsedData.length} transaksi berhasil disimpan!`, 'success');
            resetFlow();
            return true;
        } catch (error) {
            console.error("Failed to save multi transactions:", error);
            showToast("Gagal menyimpan beberapa transaksi.", 'error');
            setPageState('MULTI_CONFIRMING');
        }
        return false;
    }, [multiParsedData, addTransaction, showToast, resetFlow]);

    return {
        pageState,
        setPageState,
        messages,
        parsedData,
        setParsedData,
        multiParsedData,
        setMultiParsedData,
        removeMultiTransaction,
        insightData,
        processInput,
        saveTransaction,
        saveMultiTransactions,
        resetFlow,
    };
};
