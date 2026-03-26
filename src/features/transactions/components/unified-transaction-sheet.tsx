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

// Partials
import { AmountInput } from './form-partials/amount-input';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { DatePicker } from './form-partials/date-picker';
import { HeroAmount } from './liquid-composer/HeroAmount';
import { MagicBar } from './liquid-composer/MagicBar';
import { DynamicSuggestions } from './form-partials/dynamic-suggestions';

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
    const [showManualForm, setShowManualForm] = useState(false);

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

                {/* --- STAGE 1: MAGIC HEADER --- */}
                <div className="relative bg-gradient-to-b from-secondary/30 to-background px-6 pt-10 pb-8 border-b border-border/40">
                    {/* Batch Navigation */}
                    {totalTxs > 1 && (
                        <div className="flex items-center justify-between mb-6 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
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

                    <div className="flex justify-center mb-8">
                        <HeroAmount amount={amountNumber} type={type} onAmountClick={() => setShowManualForm(true)} />
                    </div>

                    {/* Magic Input */}
                    <div className="max-w-md mx-auto relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                            <Sparkles className="h-3 w-3" />
                            Lemon Magic
                        </div>
                        <MagicBar 
                            value={magicValue}
                            onChange={setMagicValue}
                            onReturn={handleMagicSubmit}
                            onClear={() => setMagicValue('')}
                            onImageUpload={handleImageUpload}
                            isProcessing={isAiProcessing}
                            placeholder="Contoh: beli boba 25rb atau upload struk"
                        />
                    </div>

                    {/* Socratic & Clarification Feed */}
                    <div className="max-w-md mx-auto space-y-3 mt-6">
                        <AnimatePresence mode="wait">
                            {clarificationQuestion && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
                                >
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                        <HelpCircle className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-amber-950 font-semibold">
                                        {clarificationQuestion}
                                    </p>
                                </motion.div>
                            )}

                            {socraticInsight && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MessageSquareQuote className="h-4 w-4 text-primary" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/80 italic font-medium">
                                        "{socraticInsight}"
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- STAGE 2: ADAPTIVE CONTENT --- */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col">
                    {/* Suggestions (Only when idle) */}
                    {!isEditMode && amountNumber === 0 && !magicValue && totalTxs === 0 && (
                        <div className="flex-1 flex flex-col justify-center py-4">
                            <DynamicSuggestions 
                                historySuggestions={historySuggestions} 
                                onSuggestionClick={(text) => processMagicInput(text)} 
                            />
                        </div>
                    )}

                    {/* Summary Chips (Non-interactive unless clicked) */}
                    {(amountNumber > 0 || totalTxs > 0) && (
                        <div className="flex flex-wrap justify-center gap-2">
                             <button 
                                onClick={() => setShowManualForm(true)} 
                                className="px-4 py-2 rounded-full border border-border/60 bg-card hover:bg-secondary/50 transition-colors flex items-center gap-2 text-xs font-medium"
                            >
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {category || 'Pilih Kategori'}
                            </button>
                            <button 
                                onClick={() => setShowManualForm(true)} 
                                className="px-4 py-2 rounded-full border border-border/60 bg-card hover:bg-secondary/50 transition-colors flex items-center gap-2 text-xs font-medium"
                            >
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                {wallets.find(w => w.id === walletId)?.name || 'Pilih Dompet'}
                            </button>
                        </div>
                    )}

                    {/* Manual Form (Collapsible) */}
                    <AnimatePresence>
                        {showManualForm && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-6 pt-4 border-t border-border/40">
                                    <div className="grid grid-cols-2 gap-4">
                                        <WalletSelector control={control} name="walletId" wallets={wallets} label="Dompet" error={(errors as any).walletId?.message} />
                                        <DatePicker control={control} name="date" error={(errors as any).date?.message} />
                                    </div>
                                    <CategorySelector 
                                        control={control} 
                                        name="category" 
                                        value={subCategory} 
                                        categories={activeCategories} 
                                        error={(errors as any).category?.message}
                                        onSubCategoryChange={(val) => setValue('subCategory', val)}
                                    />
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Deskripsi</p>
                                        <div className="relative">
                                            <input 
                                                {...form.register('description')} 
                                                placeholder="Makan siang, bensin, dll..." 
                                                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showManualForm && (
                        <Button 
                            variant="ghost" 
                            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 py-4"
                            onClick={() => setShowManualForm(true)}
                        >
                            <ChevronDown className="h-4 w-4" />
                            Lihat detail manual
                        </Button>
                    )}
                </div>

                {/* --- FOOTER: ACTIONS --- */}
                <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border/40 flex gap-3">
                    {isEditMode && (
                        <Button variant="outline" size="icon" onClick={handleDelete} className="h-14 w-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10">
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
                                    className="w-full h-11 rounded-2xl font-medium text-xs border-primary/20 text-primary hover:bg-primary/5 transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Simpan & Tambah Lagi
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
