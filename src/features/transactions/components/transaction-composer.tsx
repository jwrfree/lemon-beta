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
import { useActions } from '@/providers/action-provider';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';
import { unifiedTransactionSchema, UnifiedTransactionFormValues } from '../schemas/transaction-schema';
import { parseISO } from 'date-fns';
import { z } from 'zod';

// Partials
import { AmountInput } from './form-partials/amount-input';
import { TransactionTypeTabs } from './form-partials/type-tabs';
import { DatePicker } from './form-partials/date-picker';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { useAiCategorySuggestion } from '../hooks/use-ai-category-suggestion';

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
                showToast("Transfer berhasil dicatat", 'success');
            } else {
                const transactionData = {
                    ...validData,
                    date: validData.date.toISOString(),
                };

                if (isEditMode && initialData && 'id' in initialData) {
                    await updateTransaction((initialData as Transaction).id, initialData as Transaction, transactionData);
                    showToast("Transaksi berhasil diperbarui", 'success');
                } else {
                    await addTransaction(transactionData);
                    showToast("Transaksi berhasil ditambahkan", 'success');
                }
            }
            onClose({ ...validData, date: validData.date.toISOString() });
        } catch (error) {
            const err = error as Error;
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isModal ? "fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4" : ""}
            onClick={() => isModal && onClose()}
        >
            <motion.div
                initial={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }) : {}}
                animate={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }) : {}}
                exit={isModal ? (typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }) : {}}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-lg bg-background rounded-t-2xl md:rounded-xl shadow-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh] border border-border/50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {isEditMode ? 'Edit Transaksi' : 'Transaksi Baru'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => onClose()} className="bg-muted/50 rounded-full hover:bg-muted">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-6">

                    <TransactionTypeTabs value={type} onChange={handleTypeChange} />

                    <AmountInput control={control} name="amount" error={getError('amount')} />

                    <AnimatePresence mode="popLayout">
                        {type === 'transfer' ? (
                            <motion.div
                                key="transfer-fields"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <WalletSelector
                                    control={control}
                                    name="fromWalletId"
                                    wallets={wallets}
                                    label="Dari Dompet"
                                    placeholder="Sumber Dana"
                                    error={getError('fromWalletId')}
                                />
                                <WalletSelector
                                    control={control}
                                    name="toWalletId"
                                    wallets={wallets}
                                    label="Ke Dompet"
                                    placeholder="Tujuan"
                                    excludedWalletId={fromWalletId}
                                    error={getError('toWalletId')}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="regular-fields"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <WalletSelector
                                        control={control}
                                        name="walletId"
                                        wallets={wallets}
                                        label="Dompet"
                                        error={getError('walletId')}
                                    />
                                    <DatePicker control={control} name="date" error={getError('date')} />
                                </div>

                                <CategorySelector
                                    control={control}
                                    name="category"
                                    categories={activeCategories}
                                    error={getError('category')}
                                    isSuggesting={isSuggesting}
                                    isAiSuggested={lastSuggestedDescription === description && description.length > 2}
                                    onSubCategoryChange={(val) => setValue('subCategory', val)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Deskripsi
                        </label>
                        <Input
                            {...form.register('description')}
                            id="description"
                            placeholder="e.g., Makan Siang, Bayar Listrik"
                            className={errors.description ? "border-destructive" : ""}
                        />
                        {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
                    </div>

                    {type === 'transfer' && (
                        <div className="space-y-2">
                            <DatePicker control={control} name="date" error={getError('date')} />
                        </div>
                    )}

                </form>

                {/* Footer */}
                <div className="p-4 border-t sticky bottom-0 bg-background z-10 shrink-0">
                    <Button onClick={handleSubmit(onSubmit)} className="w-full h-12 text-base" size="lg" disabled={isSubmitting}>
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
