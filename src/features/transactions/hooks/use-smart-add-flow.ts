
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useMonthTransactions } from '@/features/transactions/hooks/use-month-transactions';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { useActions } from '@/providers/action-provider';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useUI } from '@/components/ui-provider';
import { extractTransaction, refineTransaction } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import { startOfMonth, parseISO } from 'date-fns';
import type { TransactionExtractionOutput, SingleTransactionOutput } from '@/ai/flows/extract-transaction-flow';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt-flow';
import { resolveSubCategory, quickParseTransaction } from '@/features/transactions/utils/smart-add-utils';

// Unified type for AI processing results
type AIResult = TransactionExtractionOutput | ScanReceiptOutput;

// Helper type that covers fields from both extraction and receipt scanning
type AIProcessedTransaction = Partial<SingleTransactionOutput> & Partial<ScanReceiptOutput> & {
    // Standardize fields that might have different names
    type?: 'income' | 'expense';
    date?: string;
    wallet?: string;
    isNeed?: boolean;
    merchant?: string | null;
};

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
    isNeed?: boolean;
}

export type Message = {
    id: string;
    type: 'user' | 'user-image' | 'ai-thinking' | 'ai-confirmation' | 'ai-multi-confirmation' | 'ai-clarification';
    content: string | SmartTransactionData | SmartTransactionData[];
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

export type SuggestionMeta = {
    source: 'quick-parse' | 'ai' | 'refined';
    confidence: 'low' | 'medium' | 'high';
    reason?: string;
};

export const useSmartAddFlow = () => {
    const { wallets } = useWallets();
    const { transactions } = useMonthTransactions();
    const { incomeCategories, expenseCategories } = useCategories();
    const { addTransaction, addTransfer } = useActions();
    const { budgets } = useBudgets();
    const { setPreFilledTransfer, setIsTransferModalOpen, showToast } = useUI();

    const [pageState, setPageState] = useState<PageState>('IDLE');
    const [messages, setMessages] = useState<Message[]>([]);
    const [parsedData, setParsedData] = useState<SmartTransactionData | null>(null);
    const [multiParsedData, setMultiParsedData] = useState<SmartTransactionData[]>([]);
    const [insightData, setInsightData] = useState<InsightData | null>(null);
    const [suggestionMeta, setSuggestionMeta] = useState<SuggestionMeta | null>(null);
    const [aiStage, setAiStage] = useState<'idle' | 'parsing' | 'predicting' | 'refining'>('idle');
    const [isSaving, setIsSaving] = useState(false);

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
        setSuggestionMeta(null);
        setAiStage('idle');
        setMessages([]);
    }, []);

    const calculateInsights = useCallback((dataToConfirm: SmartTransactionData) => {
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

    const handleAISuccess = useCallback((result: AIResult, isReceipt = false, source: 'ai' | 'refined' = 'ai') => {
        // Remove thinking message first
        setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));

        // Handle clarification question if present (only in ExtractionOutput)
        if ('clarificationQuestion' in result && result.clarificationQuestion) {
            setMessages(prev => [
                ...prev,
                {
                    id: `ai-clarify-${Date.now()}`,
                    type: 'ai-clarification',
                    content: result.clarificationQuestion!
                }
            ]);
            // If there are no transactions, just stay in confirming/analyzing mode
            if (!result.transactions || result.transactions.length === 0) {
                setPageState('CONFIRMING');
                return;
            }
        }

        let rawTransactions: AIProcessedTransaction[] = [];
        if ('transactions' in result && result.transactions) {
            rawTransactions = result.transactions as any;
        } else if ('amount' in result && result.amount) {
            rawTransactions = [result as any];
        }

        if (rawTransactions.length === 0 && !('clarificationQuestion' in result && result.clarificationQuestion)) {
            showToast("AI tidak menemukan data transaksi. Coba input lebih detail ya.", 'info');
            setPageState('IDLE');
            return;
        }

        const processedTransactions = rawTransactions.map((tx) => {
            const { category, sourceWallet, destinationWallet, amount, description, type, subCategory, location, merchant, date, isDebtPayment, counterparty, transactionDate, isNeed } = tx;

            const txDate = date || transactionDate;

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

            // If we found a matching wallet, use its ID. 
            // ONLY use default/tunai if walletName was actually empty or no match found.
            const walletId = matchingWallet?.id || (walletName ? wallets.find(w => w.isDefault)?.id : (wallets.find(w => w.name.toLowerCase() === 'tunai')?.id || wallets[0]?.id)) || wallets[0]?.id;

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
                finalCategory = normalizedCategory || 'Lain-lain';
            } else {
                // Set type based on the matched category
                if (incomeCategories.some(c => c.name === finalCategory)) transactionType = 'income';
                else transactionType = 'expense';
            }

            // 3. Sub-Category Resolution
            const finalSubCategory = resolveSubCategory(finalCategory || undefined, subCategory || undefined, allCategories);

            return {
                type: transactionType,
                amount: Math.abs(amount || 0),
                description: description || (isReceipt ? 'Transaksi dari struk' : 'Transaksi baru'),
                category: finalCategory,
                subCategory: finalSubCategory,
                walletId,
                location: location || merchant || '',
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
                isDebtPayment: isDebtPayment || false,
                counterparty: counterparty || undefined,
                sourceWallet: sourceWallet || undefined,
                destinationWallet: destinationWallet || undefined,
                isNeed: isNeed !== undefined ? isNeed : true
            };
        });

        if (processedTransactions.length > 1) {
            setMultiParsedData(processedTransactions);
            setSuggestionMeta({
                source,
                confidence: source === 'refined' ? 'high' : 'medium',
                reason: source === 'refined' ? 'Disesuaikan dari instruksi koreksi Anda.' : 'Diprediksi dari analisis AI input Anda.'
            });
            setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
            setPageState('MULTI_CONFIRMING');
        } else {
            const dataToConfirm = processedTransactions[0];

            // Smart transfer detection
            if (dataToConfirm.category === 'Transfer' && dataToConfirm.sourceWallet && dataToConfirm.destinationWallet) {
                // Keep it in confirming state so user can verify
                const { walletInsight, budgetInsight } = calculateInsights(dataToConfirm);
                setInsightData({ wallet: walletInsight, budget: budgetInsight });
                setParsedData(dataToConfirm);
                setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
                setPageState('CONFIRMING');
                return;
            }

            const { walletInsight, budgetInsight } = calculateInsights(dataToConfirm);
            setInsightData({ wallet: walletInsight, budget: budgetInsight });
            setParsedData(dataToConfirm);
            setSuggestionMeta({
                source,
                confidence: source === 'refined' ? 'high' : 'medium',
                reason: source === 'refined' ? 'Disesuaikan dari instruksi koreksi Anda.' : 'Diprediksi dari analisis AI input Anda.'
            });
            setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
            setPageState('CONFIRMING');
        }
    }, [wallets, incomeCategories, expenseCategories, calculateInsights, showToast]);

    const processInput = useCallback(async (input: string | { type: 'image', dataUrl: string }) => {
        const isRefinement = (pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING') && typeof input === 'string';

        if (typeof input === 'string') {
            if (!input.trim()) return;
            setMessages(prev => [...prev, { id: `user-${Date.now()}`, type: 'user', content: input }]);
        } else {
            setMessages(prev => [...prev, { id: `user-image-${Date.now()}`, type: 'user-image', content: input.dataUrl }]);
        }

        setPageState('ANALYZING');
        setAiStage('parsing');
        setMessages(prev => [...prev, { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: '' }]);

        const availableCategories = [
            ...expenseCategories.map(c => `${c.name} (${(c.sub_categories || []).join(', ')})`),
            ...incomeCategories.map(c => `${c.name} (${(c.sub_categories || []).join(', ')})`)
        ];
        const availableWallets = wallets.map(w => w.name);

        // --- OPTIMISTIC / QUICK PARSE START ---
        if (typeof input === 'string' && !isRefinement) {
            try {
                // Run local regex parser
                const quickResult = quickParseTransaction(input, { expense: expenseCategories, income: incomeCategories }, availableWallets);

                if (quickResult.confidence !== 'low') {
                    // Resolve Wallet ID
                    const walletName = quickResult.walletName || '';
                    let matchingWallet = wallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());
                    const walletId = matchingWallet?.id || (walletName ? wallets.find(w => w.name.toLowerCase().includes(walletName.toLowerCase()))?.id : (wallets.find(w => w.isDefault)?.id || wallets[0]?.id)) || wallets[0]?.id;

                    const optimisticData: SmartTransactionData = {
                        amount: quickResult.amount,
                        description: quickResult.description,
                        category: quickResult.category,
                        subCategory: quickResult.subCategory,
                        walletId: walletId,
                        location: '',
                        date: quickResult.date,
                        type: quickResult.type,
                        isNeed: quickResult.isNeed
                    };

                    setParsedData(optimisticData);
                    setSuggestionMeta({
                        source: 'quick-parse',
                        confidence: quickResult.confidence,
                        reason: quickResult.detectedKeyword ? `Kategori dipilih dari kata: ${quickResult.detectedKeyword}` : 'Diprediksi cepat dari pola teks transaksi.'
                    });
                    // Show result immediately, but keep 'ai-thinking' message to show refinement is active
                    setPageState('CONFIRMING');
                }
            } catch (e) {
                console.warn("Quick parse failed, falling back to full AI", e);
            }
        }
        // --- OPTIMISTIC / QUICK PARSE END ---

        try {
            if (isRefinement && typeof input === 'string') {
                setAiStage('refining');
                // Prepare current data for refinement
                const currentTransactions = multiParsedData.length > 0 ? multiParsedData : (parsedData ? [parsedData] : []);

                // Map back to AI-friendly format (names instead of IDs)
                const mappedTransactions = currentTransactions.map(t => {
                    const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Tunai';
                    return {
                        amount: t.amount,
                        description: t.description,
                        category: t.category,
                        subCategory: t.subCategory,
                        wallet: walletName,
                        sourceWallet: t.sourceWallet,
                        destinationWallet: t.destinationWallet,
                        location: t.location,
                        date: t.date.split('T')[0], // YYYY-MM-DD
                        type: t.type,
                        isDebtPayment: t.isDebtPayment || false,
                        counterparty: t.counterparty,
                        isNeed: t.isNeed !== undefined ? t.isNeed : true
                    };
                });

                const currentData: TransactionExtractionOutput = {
                    transactions: mappedTransactions
                };

                const result = await refineTransaction(currentData, input, {
                    categories: availableCategories,
                    wallets: availableWallets
                });
                handleAISuccess(result, false, 'refined');
            } else if (typeof input === 'string') {
                setAiStage('predicting');
                const result = await extractTransaction(input, {
                    categories: availableCategories,
                    wallets: availableWallets
                });
                handleAISuccess(result);
            } else {
                setAiStage('predicting');
                const result = await scanReceipt({ photoDataUri: input.dataUrl, availableCategories });
                handleAISuccess(result, true);
            }
        } catch (error) {
            console.error('AI processing failed:', error);
            showToast('Oops! Gagal menganalisis input. Coba lagi ya.', 'error');
            resetFlow(true);
        } finally {
            setAiStage('idle');
        }
    }, [wallets, expenseCategories, incomeCategories, handleAISuccess, showToast, resetFlow, pageState, parsedData, multiParsedData]);

    /**
     * Saves the current `parsedData` transaction to the database.
     * @param andAddAnother - If true, resets the flow after saving to allow adding another transaction.
     * @returns `true` on success (signals caller to redirect), `false` on failure or when andAddAnother is true.
     */
    const saveTransaction = useCallback(async (andAddAnother = false): Promise<boolean> => {
        if (!parsedData) return false;
        setIsSaving(true);
        try {
            // Check if it's a transfer
            if (parsedData.category === 'Transfer' && parsedData.sourceWallet && parsedData.destinationWallet) {
                const from = wallets.find(w => w.name.toLowerCase() === (parsedData.sourceWallet || '').toLowerCase() || w.id === parsedData.walletId);
                const to = wallets.find(w => w.name.toLowerCase() === (parsedData.destinationWallet || '').toLowerCase());
                
                if (from && to) {
                    await addTransfer({
                        fromWalletId: from.id,
                        toWalletId: to.id,
                        amount: parsedData.amount,
                        date: parsedData.date,
                        description: parsedData.description
                    });
                    if (andAddAnother) resetFlow();
                    return true;
                } else {
                    showToast("Dompet asal atau tujuan transfer tidak ditemukan.", 'error');
                    return false;
                }
            }

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
        } finally {
            setIsSaving(false);
        }
        return false;
    }, [parsedData, addTransaction, addTransfer, wallets, showToast, resetFlow]);

    /**
     * Saves all transactions in `multiParsedData` to the database in sequence.
     * @returns `true` on success, `false` on failure or empty list.
     */
    const saveMultiTransactions = useCallback(async (): Promise<boolean> => {
        if (multiParsedData.length === 0) return false;
        setIsSaving(true);
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
        } finally {
            setIsSaving(false);
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
        suggestionMeta,
        aiStage,
        isSaving,
        processInput,
        saveTransaction,
        saveMultiTransactions,
        resetFlow,
    };
};
