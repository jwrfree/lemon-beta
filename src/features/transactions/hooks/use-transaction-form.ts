import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { parseISO } from 'date-fns';

import { unifiedTransactionSchema, UnifiedTransactionFormValues, UnifiedTransactionInputValues } from '../schemas/transaction-schema';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { triggerHaptic } from '@/lib/utils';
import { Transaction, Wallet } from '@/types/models';
import { patchTransactionLiquid } from '@/ai/flows/liquid-patch-flow';
import { extractTransaction, refineTransaction, TransactionExtractionOutput, SingleTransactionOutput } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import { useActions } from '@/providers/action-provider';
import { useMonthTransactions } from './use-month-transactions';
import { useMemo } from 'react';

interface UseTransactionFormProps {
    initialData?: Transaction | null;
    onSuccess?: () => void;
    type?: 'expense' | 'income' | 'transfer'; // Default type override
    context?: { wallets: { id: string, name: string }[], categories: string[] }; // Context for AI
}

export const useTransactionForm = ({ initialData, onSuccess, type, context }: UseTransactionFormProps = {}) => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const { addTransaction, updateTransaction, deleteTransaction, addTransfer } = useActions();
    const { transactions } = useMonthTransactions();
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
    
    // Multi-transaction state
    const [multiTransactions, setMultiTransactions] = useState<any[]>([]);
    const [currentTxIndex, setCurrentTxIndex] = useState(0);

    const router = useRouter();

    // History suggestions logic
    const historySuggestions = useMemo(() => {
        const seen = new Set<string>();

        return transactions
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((tx) => {
                const compactAmount = tx.amount >= 1000000
                    ? `${Number((tx.amount / 1000000).toFixed(1)).toString().replace('.', ',')}jt`
                    : tx.amount >= 1000
                        ? `${Math.round(tx.amount / 1000)}rb`
                        : `${tx.amount}`;

                const baseText = tx.description?.trim() || tx.category;
                return `${baseText} ${compactAmount}`.trim();
            })
            .filter((text) => {
                const normalized = text.toLowerCase();
                if (!normalized || seen.has(normalized)) return false;
                seen.add(normalized);
                return true;
            })
            .slice(0, 5);
    }, [transactions]);

    const isEditMode = !!initialData;

    // 1. Initialize Form with Zod Resolver
    const form = useForm<UnifiedTransactionInputValues>({
        resolver: zodResolver(unifiedTransactionSchema) as any,
        defaultValues: {
            type: type || 'expense',
            amount: '' as any,
            description: '',
            date: new Date(),
            walletId: '',
            category: '',
            subCategory: '',
            location: '',
            isNeed: true, // Added default
            // Transfer defaults
            fromWalletId: '',
            toWalletId: '',
        },
    });

    // 2. Populate Form Data on Edit
    useEffect(() => {
        if (initialData) {
            form.reset({
                type: initialData.type,
                amount: initialData.amount.toString(),
                description: initialData.description,
                date: parseISO(initialData.date),
                walletId: initialData.walletId,
                category: initialData.category,
                subCategory: initialData.subCategory || '',
                location: initialData.location || '',
                isNeed: initialData.isNeed ?? true, // Added isNeed
            } as any);
        }
    }, [initialData, form]);

    // 3. Debug Validation Errors
    useEffect(() => {
        const errors = form.formState.errors;
        if (Object.keys(errors).length > 0) {
            console.error("Form Validation Errors:", errors);
            const firstError = Object.values(errors)[0]?.message;
            if (firstError && typeof firstError === 'string') {
                showToast(`Validasi gagal: ${firstError}`, 'error');
            }
        }
    }, [form.formState.submitCount]);

    // 4. Power AI Processing (Multi + OCR)
    const processMagicInput = useCallback(async (input: string | { type: 'image', dataUrl: string }) => {
        if (!user || !context) return;

        setIsAiProcessing(true);
        setAiExplanation(null);
        setClarificationQuestion(null);

        try {
            let result: TransactionExtractionOutput;

            if (typeof input === 'string') {
                // If we already have multi-transactions, refine them
                if (multiTransactions.length > 0) {
                    const previousData: TransactionExtractionOutput = {
                        transactions: multiTransactions.map(tx => ({
                            amount: parseFloat(tx.amount),
                            description: tx.description,
                            category: tx.category,
                            subCategory: tx.subCategory,
                            wallet: context.wallets.find(w => w.id === tx.walletId)?.name || 'Tunai',
                            date: tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : tx.date,
                            type: tx.type as any,
                            isNeed: tx.isNeed,
                            isDebtPayment: tx.isDebtPayment || false
                        }))
                    };
                    result = await refineTransaction(previousData, input, {
                        wallets: context.wallets.map(w => w.name),
                        categories: context.categories
                    });
                } else {
                    result = await extractTransaction(input, {
                        wallets: context.wallets.map(w => w.name),
                        categories: context.categories
                    });
                }
            } else {
                // OCR Flow
                const ocrResult = await scanReceipt({ 
                    photoDataUri: input.dataUrl, 
                    availableCategories: context.categories 
                });
                // Adapt ScanReceiptOutput to TransactionExtractionOutput
                result = {
                    transactions: [{
                        amount: ocrResult.amount || 0,
                        description: ocrResult.description || 'Transaksi dari Struk',
                        merchant: ocrResult.merchant,
                        category: ocrResult.category || 'Lain-lain',
                        date: ocrResult.transactionDate || new Date().toISOString().slice(0, 10),
                        type: 'expense',
                        isNeed: true,
                        wallet: 'Tunai',
                        isDebtPayment: false
                    }],
                    socraticInsight: "Struk berhasil dipindai! Silakan cek detailnya."
                };
            }

            if (result.clarificationQuestion) {
                setClarificationQuestion(result.clarificationQuestion);
            }

            if (result.socraticInsight) {
                setAiExplanation(result.socraticInsight);
            }

            if (result.transactions && result.transactions.length > 0) {
                const processed = result.transactions.map(tx => {
                    const matchingWallet = context.wallets.find(w => 
                        w.name.toLowerCase().includes((tx.wallet || '').toLowerCase())
                    );
                    return {
                        amount: tx.amount.toString(),
                        description: tx.description || '',
                        category: tx.category || 'Lain-lain',
                        subCategory: tx.subCategory || '',
                        walletId: matchingWallet?.id || context.wallets[0]?.id || '',
                        date: tx.date ? parseISO(tx.date) : new Date(),
                        type: tx.type || 'expense',
                        location: tx.location || tx.merchant || '',
                        isNeed: tx.isNeed ?? true,
                        // Transfer support
                        fromWalletId: tx.sourceWallet ? context.wallets.find(w => w.name.toLowerCase().includes(tx.sourceWallet!.toLowerCase()))?.id : '',
                        toWalletId: tx.destinationWallet ? context.wallets.find(w => w.name.toLowerCase().includes(tx.destinationWallet!.toLowerCase()))?.id : '',
                    };
                });

                if (processed.length > 1) {
                    setMultiTransactions(processed);
                    setCurrentTxIndex(0);
                    // Reset form to first transaction
                    form.reset(processed[0] as any);
                } else {
                    // Single transaction: just patch the form
                    form.reset(processed[0] as any);
                    setMultiTransactions([]);
                }
                triggerHaptic('success');
            }
        } catch (err) {
            console.error("[useTransactionForm] Magic Processing Error:", err);
            showToast("Gagal memproses input AI.", "error");
        } finally {
            setIsAiProcessing(false);
        }
    }, [user, context, form, multiTransactions, showToast]);

    // 5. AI Patch Logic (Legacy Support)
    const applyLiquidPatch = useCallback(async (text: string) => {
        if (!text || !user || !context) return;
        setIsAiProcessing(true);
        try {
            const currentState = form.getValues();
            const patch = await patchTransactionLiquid(text, currentState, {
                wallets: context.wallets.map(w => ({ id: w.id, name: w.name })),
                categories: context.categories
            });
            if (patch.confidence > 0.6) {
                if (patch.amount) form.setValue('amount', patch.amount.toString(), { shouldDirty: true });
                if (patch.category) form.setValue('category', patch.category, { shouldDirty: true });
                if (patch.subCategory) form.setValue('subCategory', patch.subCategory, { shouldDirty: true });
                if (patch.location) form.setValue('location', patch.location, { shouldDirty: true });
                if (patch.description) form.setValue('description', patch.description, { shouldDirty: true });
                if (patch.walletId) form.setValue('walletId', patch.walletId, { shouldDirty: true });
                if (patch.explanation) setAiExplanation(patch.explanation);
            }
        } catch (err) {
            console.error("[useTransactionForm] AI Patch Error:", err);
        } finally {
            setIsAiProcessing(false);
        }
    }, [user, context, form]);

    const goToNext = useCallback(() => {
        if (currentTxIndex < multiTransactions.length - 1) {
            // Save current form values to multiTransactions array before switching
            const currentValues = form.getValues();
            const updated = [...multiTransactions];
            updated[currentTxIndex] = currentValues;
            setMultiTransactions(updated);

            const nextIndex = currentTxIndex + 1;
            setCurrentTxIndex(nextIndex);
            form.reset(updated[nextIndex] as any);
            triggerHaptic('light');
        }
    }, [currentTxIndex, multiTransactions, form]);

    const goToPrev = useCallback(() => {
        if (currentTxIndex > 0) {
            const currentValues = form.getValues();
            const updated = [...multiTransactions];
            updated[currentTxIndex] = currentValues;
            setMultiTransactions(updated);

            const prevIndex = currentTxIndex - 1;
            setCurrentTxIndex(prevIndex);
            form.reset(updated[prevIndex] as any);
            triggerHaptic('light');
        }
    }, [currentTxIndex, multiTransactions, form]);

    const removeCurrent = useCallback(() => {
        if (multiTransactions.length > 1) {
            const updated = multiTransactions.filter((_, i) => i !== currentTxIndex);
            setMultiTransactions(updated);
            const nextIndex = Math.min(currentTxIndex, updated.length - 1);
            setCurrentTxIndex(nextIndex);
            form.reset(updated[nextIndex] as any);
            triggerHaptic('medium');
        } else {
            setMultiTransactions([]);
            form.reset();
        }
    }, [currentTxIndex, multiTransactions, form]);

    // 4. Robust Submit Handler
    const onSubmitHandler = useCallback(async (data: any, andAddAnother = false) => {
        if (!user) {
            showToast("Sesi habis. Silakan login kembali.", "error");
            return;
        }

        triggerHaptic('medium');

        const currentData = data as any;
        const formattedData = {
            type: currentData.type,
            amount: currentData.amount,
            description: currentData.description,
            category: currentData.category,
            subCategory: currentData.subCategory,
            walletId: currentData.walletId,
            location: currentData.location,
            isNeed: currentData.isNeed,
            date: (() => {
                const selectedDate = currentData.date instanceof Date ? currentData.date : parseISO(currentData.date);
                const now = new Date();
                
                // If it's today, preserve current time. Otherwise, use what was selected.
                if (selectedDate.toDateString() === now.toDateString()) {
                    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                }
                
                return selectedDate.toISOString();
            })(),
        };

        try {
            if (isEditMode && initialData) {
                const success = await updateTransaction(initialData.id, initialData, formattedData);
                if (!success) return;
            } else {
                // If in multi-mode, save this one and move to next or finish
                if (multiTransactions.length > 1) {
                    const txId = await addTransaction(formattedData);
                    if (!txId) return;
                    
                    const remaining = multiTransactions.filter((_, i) => i !== currentTxIndex);
                    if (remaining.length > 0) {
                        setMultiTransactions(remaining);
                        const nextIndex = Math.min(currentTxIndex, remaining.length - 1);
                        setCurrentTxIndex(nextIndex);
                        form.reset(remaining[nextIndex] as any);
                        showToast(`Tersimpan! Sisa ${remaining.length} lagi.`, 'success');
                        return; // Don't close yet
                    }
                } else {
                    const txId = await addTransaction(formattedData);
                    if (!txId) return;
                }
            }

            triggerHaptic('success');
            router.refresh();

            if (andAddAnother) {
                form.reset({
                    type: currentData.type,
                    amount: '' as any,
                    description: '',
                    date: new Date(),
                    walletId: currentData.walletId,
                    category: '',
                    subCategory: '',
                    location: '',
                    isNeed: true,
                } as any);
                showToast("Transaksi disimpan. Siap catat yang lain!", "success");
            } else if (onSuccess) {
                setTimeout(() => onSuccess(), 100);
            }
        } catch (err) {
            console.error("[useTransactionForm] Submit Error:", err);
            showToast("Gagal menyimpan transaksi.", "error");
        }
    }, [user, isEditMode, initialData, showToast, onSuccess, router, addTransaction, updateTransaction, multiTransactions, currentTxIndex, form]);

    const saveAll = useCallback(async () => {
        if (multiTransactions.length === 0) return;
        
        setIsAiProcessing(true);
        try {
            for (const tx of multiTransactions) {
                const formatted = {
                    ...tx,
                    amount: parseFloat(tx.amount),
                    date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
                };
                await addTransaction(formatted);
            }
            showToast(`${multiTransactions.length} transaksi berhasil disimpan!`, 'success');
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err) {
            showToast("Beberapa transaksi gagal disimpan.", "error");
        } finally {
            setIsAiProcessing(false);
        }
    }, [multiTransactions, addTransaction, showToast, onSuccess, router]);

    // 5. Delete Handler
    const onDeleteHandler = useCallback(async () => {
        if (!user || !initialData) return;

        triggerHaptic('medium');

        // Use deleteTransaction from useActions
        await deleteTransaction(initialData);

        triggerHaptic('success');
        showToast("Transaksi berhasil dihapus", 'success');

        router.refresh();
        if (onSuccess) {
            setTimeout(() => {
                onSuccess();
            }, 100);
        }

    }, [user, initialData, showToast, onSuccess, router, deleteTransaction]);

    return {
        form,
        isEditMode,
        isSubmitting: form.formState.isSubmitting,
        isAiProcessing,
        aiExplanation,
        socraticInsight: aiExplanation,
        clarificationQuestion,
        
        // Navigation & Multi
        multiTransactions,
        currentTxIndex,
        totalTxs: multiTransactions.length,
        goToNext,
        goToPrev,
        removeCurrent,
        saveAll,
        historySuggestions,

        processMagicInput,
        applyLiquidPatch, // Legacy support if needed
        handleSubmit: form.handleSubmit((data) => onSubmitHandler(data, false)),
        handleSubmitAndAddAnother: form.handleSubmit((data) => onSubmitHandler(data, true)),
        handleDelete: onDeleteHandler,
        errors: form.formState.errors,
    };
};
