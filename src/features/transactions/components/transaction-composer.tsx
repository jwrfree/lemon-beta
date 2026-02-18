'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSwipeable } from 'react-swipeable';
import { useUI } from '@/components/ui-provider';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useActions } from '@/providers/action-provider';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';
import { unifiedTransactionSchema, UnifiedTransactionFormValues } from '../schemas/transaction-schema';
import { cn, triggerHaptic } from '@/lib/utils';
import { parseISO } from 'date-fns';
import { z } from 'zod';
import { SuccessAnimation } from '@/components/success-animation';

// Partials
import { AmountInput } from './form-partials/amount-input';
import { TransactionTypeTabs } from './form-partials/type-tabs';
import { DatePicker } from './form-partials/date-picker';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { BudgetStatusPill } from './form-partials/budget-status-pill';
import { useAiCategorySuggestion } from '../hooks/use-ai-category-suggestion';
import { getCategoryColorHex } from '../utils/category-colors';

interface TransactionComposerProps {
    onClose: (data?: Transaction | any) => void;
    initialData?: Transaction | Partial<Transaction> | { type: 'transfer' } | null;
    isModal?: boolean;
}

export const TransactionComposer = ({ onClose, initialData, isModal = true }: TransactionComposerProps) => {
    const { addTransaction, updateTransaction, addTransfer } = useActions();
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const { showToast } = useUI();
    const [showSuccess, setShowSuccess] = useState(false);
    const defaultWallet = wallets.find(w => w.isDefault);

    const isEditMode = !!initialData && 'id' in initialData;

    // Safe access to initialData properties
    const getInitialValue = (key: string, fallback: any = '') => {
        if (!initialData) return fallback;
        return (initialData as any)[key] || fallback;
    };

    const defaultType = getInitialValue('type', 'expense');

    const form = useForm<z.input<typeof unifiedTransactionSchema>>({
        resolver: zodResolver(unifiedTransactionSchema) as any,
        defaultValues: {
            type: defaultType,
            amount: getInitialValue('amount') ? new Intl.NumberFormat('id-ID').format(getInitialValue('amount')) : '',
            description: getInitialValue('description'),
            date: getInitialValue('date') && typeof getInitialValue('date') === 'string' ? parseISO(getInitialValue('date')) : new Date(),
            // Expense/Income Specific
            category: getInitialValue('category'),
            subCategory: getInitialValue('subCategory'),
            walletId: getInitialValue('walletId') || defaultWallet?.id || '',
            location: getInitialValue('location'),
            // Transfer Specific
            fromWalletId: defaultWallet?.id || '',
            toWalletId: '',
        }
    });

    const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = form;

    // Watchers for conditional rendering
    const type = useWatch({ control, name: 'type' });
    const description = useWatch({ control, name: 'description' });
    const category = useWatch({ control, name: 'category' });
    const fromWalletId = useWatch({ control, name: 'fromWalletId' });

    // AI Suggestions
    const { isSuggesting, lastSuggestedDescription } = useAiCategorySuggestion({
        description,
        type: type === 'transfer' ? 'expense' : type, // Fallback for transfer type though AI not really used there
        currentCategory: category,
        isEditMode,
        setValue
    });

    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleTypeChange = (newType: 'expense' | 'income' | 'transfer') => {
        triggerHaptic('light');
        setValue('type', newType);
        // Reset category if switching between expense and income
        if (newType !== type && newType !== 'transfer') {
            setValue('category', '');
            setValue('subCategory', '');
        }
    };

    const onSubmit = async (data: z.input<typeof unifiedTransactionSchema>) => {
        // RHF with Zod resolver passes transformed data, but types dictate input type.
        // We cast to output type safely because we know zod has validated and transformed it.
        const validData = data as unknown as UnifiedTransactionFormValues;

        try {
            if (validData.type === 'transfer') {
                await addTransfer({
                    fromWalletId: validData.fromWalletId,
                    toWalletId: validData.toWalletId,
                    amount: validData.amount,
                    description: validData.description,
                    date: validData.date.toISOString(),
                });
            } else {
                const transactionData = {
                    ...validData,
                    date: validData.date.toISOString(),
                };

                if (isEditMode && initialData && 'id' in initialData) {
                    await updateTransaction((initialData as Transaction).id, initialData as Transaction, transactionData);
                } else {
                    await addTransaction(transactionData);
                }
            }

            // Premium Success Experience
            triggerHaptic('success');
            setShowSuccess(true);

            // Brief delay to allow animation to be seen
            setTimeout(() => {
                onClose({ ...validData, date: validData.date.toISOString() });
            }, 1200);

        } catch (error) {
            const err = error as Error;
            triggerHaptic('error');
            showToast(`Gagal: ${err.message}`, 'error');
        }
    };

    const handlers = useSwipeable({
        onSwipedDown: () => onClose(),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    // Helper for safe error access with discriminated unions
    const getError = (field: string) => {
        return (errors as any)[field]?.message;
    }

    const categoryVisuals = category ? expenseCategories.find(c => c.name === category) || incomeCategories.find(c => c.name === category) : null;
    const accentColor = categoryVisuals?.color.split(' ')[0] || 'text-primary';
    const accentBg = categoryVisuals?.bg_color || 'bg-primary/5';

    // Budget logic moved to BudgetStatusPill component

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isModal ? "fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center backdrop-blur-[2px] p-0 md:p-4" : ""}
            onClick={() => isModal && onClose()}
        >
            <motion.div
                drag={isModal ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.8 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 150) onClose();
                }}
                initial={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }) : {}}
                animate={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }) : {}}
                exit={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }) : {}}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg bg-background rounded-t-lg md:rounded-lg shadow-2xl flex flex-col h-auto max-h-[92vh] md:max-h-[85vh] border border-border overflow-hidden relative pb-safe"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="md:hidden w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-1 shrink-0 opacity-40" />
                <div className={cn("absolute top-0 left-0 w-full h-1.5 transition-colors duration-500", accentBg.replace('bg-', 'bg-').split(' ')[0])} />

                <div className="p-4 pt-5 border-b flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
                    <h2 className="text-xl font-medium flex items-center gap-2 tracking-tight">
                        <div className={cn("w-2.5 h-2.5 rounded-full ring-4 transition-colors duration-500", accentColor.replace('text-', 'bg-').split(' ')[0], accentBg.replace('bg-', 'ring-').split(' ')[0])} />
                        {isEditMode ? 'Edit Transaksi' : 'Transaksi Baru'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => onClose()} className="bg-muted/50 rounded-full hover:bg-muted h-9 w-9">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4 space-y-6">
                    <TransactionTypeTabs value={type} onChange={handleTypeChange} />
                    <AmountInput control={control} name="amount" error={getError('amount')} />

                    <AnimatePresence mode="popLayout">
                        {type === 'transfer' ? (
                            <motion.div key="transfer-fields" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
                                <WalletSelector control={control} name="fromWalletId" wallets={wallets} label="Dari Dompet" placeholder="Sumber Dana" error={getError('fromWalletId')} />
                                <WalletSelector control={control} name="toWalletId" wallets={wallets} label="Ke Dompet" placeholder="Tujuan" excludedWalletId={fromWalletId} error={getError('toWalletId')} />
                            </motion.div>
                        ) : (
                            <motion.div key="regular-fields" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <WalletSelector control={control} name="walletId" wallets={wallets} label="Dompet" error={getError('walletId')} />
                                    <DatePicker control={control} name="date" error={getError('date')} />
                                </div>
                                <CategorySelector control={control} name="category" categories={activeCategories} error={getError('category')} isSuggesting={isSuggesting} isAiSuggested={lastSuggestedDescription === description && description.length > 2} onSubCategoryChange={(val) => setValue('subCategory', val)} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <Input {...form.register('description')} id="description" placeholder="Deskripsi (makan siang, bensin, dll...)" className={cn("h-12 rounded-lg bg-secondary border-border shrink-0 focus-visible:ring-primary/30", errors.description && "border-destructive")} />
                        {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
                    </div>

                    {type === 'transfer' && (
                        <div className="space-y-2">
                            <DatePicker control={control} name="date" error={getError('date')} />
                        </div>
                    )}
                </form>

                <div className="p-4 border-t sticky bottom-0 bg-background/80 backdrop-blur-md z-10 shrink-0 space-y-3">
                    <BudgetStatusPill category={category} />

                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className="w-full h-12 text-base rounded-lg font-medium transition-all duration-300 shadow-card active:scale-[0.98] text-white hover:brightness-110 bg-primary"
                        style={categoryVisuals ? {
                            backgroundColor: getCategoryColorHex(categoryVisuals)
                        } : undefined}
                        size="lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Transaksi'
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

