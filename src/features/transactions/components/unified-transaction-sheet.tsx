'use client';

import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Info, Save, Trash2, Sparkles, Loader2, MessageSquareQuote, ChevronLeft, ChevronRight, CheckCheck, HelpCircle, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useTransactionForm } from '../hooks/use-transaction-form';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';

import { HeroAmount } from './liquid-composer/HeroAmount';
import { MagicBar } from './liquid-composer/MagicBar';
import { DynamicSuggestions } from './form-partials/dynamic-suggestions';
import { SemanticTransactionReview } from './form-partials/semantic-review';


interface UnifiedTransactionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction | null;
    initialType?: 'expense' | 'income' | 'transfer';
}

export const UnifiedTransactionSheet = ({ 
    isOpen, 
    onClose, 
    transaction = null,
    initialType = 'expense'
}: UnifiedTransactionSheetProps) => {
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const [magicValue, setMagicValue] = useState('');

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
        applyLiquidPatch,
        multiTransactions,
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

    const { control, watch, setValue, formState: { errors } } = form;
    const type = watch('type');
    const amount = watch('amount');
    const category = watch('category');
    const subCategory = watch('subCategory');
    const walletId = watch('walletId');

    const amountNumber = Number((amount ?? '0').toString().replace(/[^0-9]/g, ''));
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleMagicSubmit = async () => {
        if (!magicValue.trim()) return;
        await processMagicInput(magicValue.trim());
        setMagicValue('');
    };

    const handleImageUpload = async (dataUrl: string) => {
        await processMagicInput({ type: 'image', dataUrl });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent 
                side="bottom" 
                className="h-[94vh] sm:h-auto sm:max-w-2xl rounded-t-[2.5rem] p-0 flex flex-col overflow-hidden border-none shadow-2xl bg-background"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{isEditMode ? 'Edit Transaksi' : 'Transaksi Baru'}</SheetTitle>
                    <SheetDescription>Interaksi cerdas dengan Socratic Lemon Coach.</SheetDescription>
                </SheetHeader>

                {/* --- STAGE 1: HEADER --- */}
                <div className="pt-6 px-5 pb-2">
                    {/* Batch Navigation */}
                    {totalTxs > 1 && (
                        <div className="flex items-center justify-between mb-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentTxIndex === 0} className="h-8 w-8 rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                Transaksi {currentTxIndex + 1} dari {totalTxs}
                            </div>
                            <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentTxIndex === totalTxs - 1} className="h-8 w-8 rounded-full">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* --- STAGE 2: ADAPTIVE CONTENT --- */}
                <motion.div layout className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col">
                    {/* Suggestions (Only when idle or typing before submit) */}
                    <AnimatePresence mode="popLayout">
                        {!isEditMode && amountNumber === 0 && totalTxs === 0 && (
                            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-2">
                                <DynamicSuggestions 
                                    historySuggestions={historySuggestions} 
                                    onSuggestionClick={(text) => processMagicInput(text)} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Summary Chips (Non-interactive unless clicked) */}
                    <AnimatePresence mode="popLayout">
                        {(amountNumber > 0 || totalTxs > 0 || isEditMode) && (
                            <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-2">
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
                <div className="px-4 pb-4 pt-3 bg-background/95 backdrop-blur-md border-t border-border/40 flex flex-col gap-3">
                    
                    {/* Socratic & Clarification Feed */}
                    <motion.div layout className="max-w-md mx-auto w-full space-y-3 px-1">
                        <AnimatePresence mode="wait">
                            {clarificationQuestion && (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="relative flex items-start gap-3 p-3.5 pr-4 rounded-2xl rounded-tr-none bg-amber-500/10 border border-amber-500/20 max-w-[90%] mr-auto shadow-sm"
                                >
                                    <p className="text-[13px] leading-relaxed text-amber-950 font-medium">
                                        {clarificationQuestion}
                                    </p>
                                    <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <HelpCircle className="h-3 w-3 text-amber-600" />
                                    </div>
                                    {/* Chat Bubble Tail */}
                                    <div className="absolute -top-1.5 left-0 w-3 h-3 bg-amber-500/10 border-l border-t border-amber-500/20 transform rotate-45" />
                                </motion.div>
                            )}

                            {socraticInsight && (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="relative flex items-start gap-3 p-3.5 pr-4 rounded-2xl rounded-tr-none bg-primary/10 border border-primary/20 max-w-[90%] mr-auto shadow-sm"
                                >
                                    <p className="text-[13px] leading-relaxed text-primary/90 font-medium">
                                        {socraticInsight}
                                    </p>
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                    </div>
                                    {/* Chat Bubble Tail */}
                                    <div className="absolute -top-1.5 left-0 w-3 h-3 bg-primary/10 border-l border-t border-primary/20 transform rotate-45" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <MagicBar 
                        value={magicValue}
                        onChange={setMagicValue}
                        onReturn={handleMagicSubmit}
                        onClear={() => setMagicValue('')}
                        onImageUpload={handleImageUpload}
                        isProcessing={isAiProcessing}
                        placeholder="Ketik pengeluaran di sini..."
                    />

                    <AnimatePresence mode="popLayout">
                        {(isEditMode || totalTxs > 0 || amountNumber > 0) && (
                            <motion.div layout initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 20, height: 0 }} className="flex gap-3 w-full mt-3 overflow-hidden">
                                {isEditMode && (
                                    <Button variant="outline" size="icon" onClick={handleDelete} className="h-14 w-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 shrink-0">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                                {totalTxs > 1 ? (
                                         <Button 
                                            onClick={saveAll} 
                                            disabled={isAiProcessing}
                                            className="flex-1 h-14 rounded-2xl font-bold text-base bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
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
                                            className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                                                className="w-full h-11 rounded-xl font-medium text-xs border-primary/20 text-primary hover:bg-primary/5 transition-all"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Simpan & Tambah Lagi
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
};
