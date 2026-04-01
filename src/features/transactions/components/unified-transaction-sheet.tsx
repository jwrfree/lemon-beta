'use client';

import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, Trash2, Sparkles, Loader2, ChevronLeft, ChevronRight, CheckCheck, HelpCircle, Plus, X } from 'lucide-react';
import { useTransactionForm } from '../hooks/use-transaction-form';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';
import { cn } from '@/lib/utils';

import { MagicBar } from './liquid-composer/MagicBar';
import { DynamicSuggestions } from './form-partials/dynamic-suggestions';
import { SemanticTransactionReview } from './form-partials/semantic-review';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog';


interface UnifiedTransactionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction | null;
    initialType?: 'expense' | 'income' | 'transfer';
    initialMode?: 'smart' | 'manual';
}

export const UnifiedTransactionSheet = ({ 
    isOpen, 
    onClose, 
    transaction = null,
    initialType = 'expense',
    initialMode = 'smart'
}: UnifiedTransactionSheetProps) => {
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const [magicValue, setMagicValue] = useState('');
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [showRemoveDraftConfirm, setShowRemoveDraftConfirm] = useState(false);

    const context = useMemo(() => ({
        wallets: wallets.map(w => ({ id: w.id, name: w.name })),
        categories: [...expenseCategories, ...incomeCategories].map(c => c.name)
    }), [wallets, expenseCategories, incomeCategories]);

    const { 
        form, 
        isSubmitting, 
        handleSubmit, 
        handleDelete, 
        isAiProcessing, 
        socraticInsight, 
        clarificationQuestion,
        processMagicInput,
        currentTxIndex,
        totalTxs,
        goToNext,
        goToPrev,
        removeCurrent,
        saveAll,
        historySuggestions,
        handleSubmitAndAddAnother,
        isEditMode
    } = useTransactionForm({
        initialData: transaction,
        onSuccess: onClose,
        type: initialType,
        context
    });

    const { watch } = form;
    const amount = watch('amount');

    const amountNumber = Number((amount ?? '0').toString().replace(/[^0-9]/g, ''));
    const sheetTitle = isEditMode ? 'Edit transaksi' : initialMode === 'manual' ? 'Catat manual' : 'Smart Add';
    const shouldShowReview = amountNumber > 0 || totalTxs > 0 || isEditMode || initialMode === 'manual';
    const shouldShowComposer = initialMode === 'smart' && (amountNumber === 0 || clarificationQuestion) && !isEditMode;
    const useCompactSheetLayout = isEditMode && !shouldShowComposer && totalTxs <= 1;

    const handleMagicSubmit = async () => {
        if (!magicValue.trim()) return;
        const result = await processMagicInput(magicValue.trim());
        if (result.shouldClearComposer) {
            setMagicValue('');
        }
    };

    const handleImageUpload = async (dataUrl: string) => {
        await processMagicInput({ type: 'image', dataUrl });
    };

    const handleSuggestionPreview = (text: string) => {
        setMagicValue(text);
    };

    const handleCloseAttempt = (open: boolean) => {
        if (!open) {
            const isDirty = amountNumber > 0 || magicValue.trim().length > 0 || totalTxs > 0 || isAiProcessing;
            if (isDirty && !isSubmitting) {
                setShowDiscardConfirm(true);
            } else {
                onClose();
            }
        }
    };

    return (
        <>
        <Sheet open={isOpen} onOpenChange={handleCloseAttempt}>
            <SheetContent 
                side="bottom" 
                hideCloseButton={true}
                className={cn(
                    "overflow-hidden rounded-t-[2.25rem] bg-muted p-0 sm:max-w-2xl sm:rounded-t-[2.5rem]",
                    useCompactSheetLayout
                        ? "flex max-h-[88dvh] flex-col sm:max-h-[92dvh]"
                        : "grid h-[100dvh] max-h-[100dvh] grid-rows-[auto,minmax(0,1fr),auto] sm:h-auto sm:max-h-[92dvh]"
                )}
            >
                <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center">
                    <div className="h-1.5 w-12 rounded-full bg-border" />
                </div>
                {/* Custom Standard Close Button */}
                <div className="absolute right-4 top-3 z-50 sm:right-6 sm:top-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleCloseAttempt(false)} 
                        className="h-9 w-9 rounded-full bg-background text-muted-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.22)] transition-all active:scale-95 hover:bg-secondary"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <SheetHeader className="sr-only">
                    <SheetTitle>{isEditMode ? 'Edit Transaksi' : 'Transaksi Baru'}</SheetTitle>
                    <SheetDescription>Interaksi cerdas dengan Socratic Lemon Coach.</SheetDescription>
                </SheetHeader>

                {/* --- STAGE 1: HEADER --- */}
                <div
                    className={cn(
                        "shrink-0 bg-muted shadow-[0_10px_30px_-28px_rgba(15,23,42,0.12)]",
                        useCompactSheetLayout ? "px-4 pb-2 pt-7 sm:px-5 sm:pb-3 sm:pt-8" : "px-4 pb-3 pt-7 sm:px-5 sm:pb-4 sm:pt-8"
                    )}
                >
                    <div className="pr-14">
                        <h2 className="max-w-[28rem] text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                            {sheetTitle}
                        </h2>
                    </div>

                    {/* Batch Navigation */}
                    {totalTxs > 1 && (
                        <div className="relative mt-5 flex items-center justify-between rounded-[24px] bg-card px-3 py-3 shadow-[0_24px_60px_-40px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-top-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPrev}
                                disabled={currentTxIndex === 0}
                                aria-label="Transaksi sebelumnya"
                                className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-label font-semibold uppercase tracking-widest text-muted-foreground/55">
                                    Batch Review
                                </span>
                                <div className="text-label font-bold text-primary">
                                    Transaksi {currentTxIndex + 1} dari {totalTxs}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowRemoveDraftConfirm(true)}
                                    aria-label="Hapus draft transaksi ini"
                                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToNext}
                                    disabled={currentTxIndex === totalTxs - 1}
                                    aria-label="Transaksi berikutnya"
                                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- STAGE 2: ADAPTIVE CONTENT --- */}
                <motion.div
                    layout
                    className={cn(
                        "flex flex-col overflow-y-auto overscroll-y-contain px-4 sm:px-6",
                        useCompactSheetLayout
                            ? "min-h-0 flex-1 space-y-3 py-3 pb-4 sm:py-4"
                            : "min-h-0 space-y-4 py-4 pb-4 sm:space-y-5 sm:py-6 sm:pb-0"
                    )}
                >
                    {/* Suggestions (Only when idle or typing before submit) */}
                    <AnimatePresence mode="popLayout">
                        {!isEditMode && amountNumber === 0 && totalTxs === 0 && initialMode !== 'manual' && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="rounded-[32px] bg-background p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.2)]"
                            >
                                <DynamicSuggestions 
                                    historySuggestions={historySuggestions} 
                                    onSuggestionClick={handleSuggestionPreview} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                        {(clarificationQuestion || socraticInsight) && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-3"
                            >
                                {clarificationQuestion && (
                                    <div className="rounded-[24px] bg-yellow-100 p-4 dark:bg-yellow-900">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500">
                                                <HelpCircle className="h-3 w-3 text-white" />
                                            </div>
                                            <p className="text-sm leading-relaxed text-warning-foreground">
                                                {clarificationQuestion}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {socraticInsight && (
                                    <div className="rounded-[24px] bg-teal-50 p-4 dark:bg-teal-950">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                                                <Sparkles className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {socraticInsight}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                        {shouldShowReview && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="px-1"
                            >
                                <SemanticTransactionReview 
                                    form={form}
                                    expenseCategories={expenseCategories}
                                    incomeCategories={incomeCategories}
                                    wallets={wallets}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* --- FOOTER: AI INPUT & ACTIONS --- */}
                <div
                    className={cn(
                        "flex shrink-0 flex-col gap-3 bg-muted px-4 sm:px-5",
                        useCompactSheetLayout
                            ? "border-t border-border pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_32px_-28px_rgba(15,23,42,0.18)] sm:pb-4"
                            : "pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:pb-4"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {shouldShowComposer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-visible"
                            >
                                <MagicBar 
                                    value={magicValue}
                                    onChange={setMagicValue}
                                    onReturn={handleMagicSubmit}
                                    onClear={() => setMagicValue('')}
                                    onImageUpload={handleImageUpload}
                                    isProcessing={isAiProcessing}
                                    placeholder="Contoh: makan siang 35rb pakai BCA"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                        {shouldShowReview && (
                            <motion.div layout initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 20, height: 0 }} className="mt-1 space-y-3 overflow-hidden">
                                <div className="flex w-full gap-3">
                                    {isEditMode && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleDelete}
                                            aria-label="Hapus transaksi"
                                            className="h-14 w-14 shrink-0 rounded-[22px] bg-error-surface text-error hover:bg-error-muted"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                    {totalTxs > 1 ? (
                                        <Button 
                                            onClick={saveAll} 
                                            disabled={isAiProcessing}
                                            className="h-14 flex-1 rounded-[22px] bg-success text-base font-bold text-success-foreground shadow-[0_18px_34px_-24px_rgba(5,150,105,0.45)] transition-all hover:opacity-90"
                                        >
                                            {isAiProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                                <span className="flex items-center gap-2">
                                                    <CheckCheck className="h-5 w-5" />
                                                    Simpan Semua ({totalTxs})
                                                </span>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="flex-1 flex flex-col gap-3">
                                            <Button 
                                                onClick={handleSubmit} 
                                                disabled={isSubmitting} 
                                                className="h-14 w-full rounded-[22px] bg-primary text-base font-bold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.45)] transition-all hover:scale-[1.01] active:scale-[0.98]"
                                            >
                                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                                    <span className="flex items-center gap-2">
                                                        <Save className="h-5 w-5" />
                                                        {isEditMode ? 'Update Transaksi' : 'Simpan Transaksi'}
                                                    </span>
                                                )}
                                            </Button>
                                            {!isEditMode && amountNumber > 0 && (
                                                <Button 
                                                    variant="outline"
                                                    onClick={handleSubmitAndAddAnother} 
                                                    disabled={isSubmitting} 
                                                    className="h-11 w-full rounded-[18px] bg-secondary text-label text-primary transition-all hover:bg-secondary"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Simpan & tambah lagi
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>

        {/* Discard Confirmation Dialog */}
        <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
            <AlertDialogContent className="max-w-[90%] sm:max-w-md rounded-card overflow-hidden p-7">
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className="text-xl font-bold tracking-tight">Batalkan Transaksi?</AlertDialogTitle>
                    <AlertDialogDescription className="text-label leading-relaxed text-muted-foreground">
                        Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar? Semua draf transaksi akan hilang secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 flex flex-col gap-3 sm:flex-col sm:space-x-0">
                    <AlertDialogAction 
                        onClick={() => {
                            setShowDiscardConfirm(false);
                            onClose();
                        }}
                        className="w-full h-14 rounded-card bg-error font-bold text-error-foreground shadow-[0_18px_34px_-24px_rgba(225,29,72,0.38)] transition-all hover:opacity-90"
                    >
                        Ya, Batalkan
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full h-12 rounded-lg border-0 bg-secondary font-bold text-label text-primary transition-all hover:bg-secondary">
                        Lanjutkan Mengisi
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRemoveDraftConfirm} onOpenChange={setShowRemoveDraftConfirm}>
            <AlertDialogContent className="max-w-[90%] sm:max-w-md rounded-card overflow-hidden p-7">
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className="text-xl font-bold tracking-tight">Hapus draft ini?</AlertDialogTitle>
                    <AlertDialogDescription className="text-label leading-relaxed text-muted-foreground">
                        Draft transaksi aktif akan dihapus dari batch. Draft lain tetap aman dan Anda bisa lanjut review setelah ini.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 flex flex-col gap-3 sm:flex-col sm:space-x-0">
                    <AlertDialogAction 
                        onClick={() => {
                            setShowRemoveDraftConfirm(false);
                            removeCurrent();
                        }}
                        className="w-full h-14 rounded-card bg-error font-bold text-error-foreground shadow-[0_18px_34px_-24px_rgba(225,29,72,0.38)] transition-all hover:opacity-90"
                    >
                        Ya, hapus draft
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full h-12 rounded-lg border-0 bg-secondary font-bold text-label text-primary transition-all hover:bg-secondary">
                        Kembali review
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
};
