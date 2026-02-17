'use client';

import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trash2, Save, CalendarIcon, ArrowRightLeft, Tag, MapPin, CornerDownRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

// Hooks & Logic
import { useTransactionForm } from '../hooks/use-transaction-form';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';

// Liquid & Form Components
import { AmountInput } from './form-partials/amount-input';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { DatePicker } from './form-partials/date-picker';
import { HeroAmount } from './liquid-composer/HeroAmount';
import { MagicBar } from './liquid-composer/MagicBar';

interface EditTransactionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export const EditTransactionSheet = ({ isOpen, onClose, transaction }: EditTransactionSheetProps) => {
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const [magicValue, setMagicValue] = useState('');
    const [showManualForm, setShowAllFields] = useState(false);
    
    // Context for AI logic
    const aiContext = useMemo(() => ({
        wallets,
        categories: [...expenseCategories, ...incomeCategories].map(c => c.name)
    }), [wallets, expenseCategories, incomeCategories]);

    const { 
        form, 
        isSubmitting, 
        handleSubmit, 
        handleDelete, 
        isAiProcessing, 
        aiExplanation, 
        applyLiquidPatch 
    } = useTransactionForm({
        initialData: transaction,
        onSuccess: onClose,
        context: aiContext
    });

    const { control, watch, setValue, formState: { errors } } = form;
    const type = watch('type');
    const amount = watch('amount');
    const category = watch('category');
    const subCategory = watch('subCategory');
    const location = watch('location');
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

    if (!transaction) return null;

    const handleMagicSubmit = async () => {
        if (!magicValue) return;
        await applyLiquidPatch(magicValue);
        setMagicValue('');
    };

    // Auto-trigger AI on specific keywords or debounced could be added here
    // For now, we trigger via MagicBar's intended action or enter key

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[95vh] sm:h-auto sm:max-w-lg rounded-t-[3rem] sm:rounded-3xl px-0 pb-0 flex flex-col gap-0 overflow-hidden border-none shadow-2xl bg-zinc-50 dark:bg-black">
                <SheetHeader className="sr-only">
                    <SheetTitle>Edit Transaksi</SheetTitle>
                    <SheetDescription>Gunakan Magic Bar atau formulir manual untuk mengubah detail transaksi.</SheetDescription>
                </SheetHeader>
                
                {/* 1. Liquid Header (The Star) */}
                <div className="relative pt-8 pb-4 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 shadow-sm">
                    <HeroAmount 
                        amount={Number(amount.toString().replace(/[^0-9]/g, ''))} 
                        type={type} 
                        onAmountClick={() => setShowAllFields(true)}
                    />

                    {/* Metadata Orbits (DeepSeek Visuals) */}
                    <div className="min-h-[60px] flex flex-col items-center justify-center gap-2 mb-4">
                        <AnimatePresence mode="popLayout">
                            {category && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="flex flex-col items-center gap-1.5"
                                >
                                    <div className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                                        <Tag className="h-3 w-3 fill-white/20" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">{category}</span>
                                    </div>
                                    {subCategory && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -5 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-xl border border-primary/10"
                                        >
                                            <CornerDownRight className="h-3 w-3 opacity-50" />
                                            <span className="text-[10px] font-bold">{subCategory}</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                            {location && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="flex items-center gap-1 text-zinc-500 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                >
                                    <MapPin className="h-3 w-3 text-rose-500" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">{location}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Magic Input */}
                    <div className="px-6 mb-2">
                        <MagicBar 
                            value={magicValue}
                            onChange={setMagicValue}
                            onReturn={handleMagicSubmit}
                            isProcessing={isAiProcessing}
                            onClear={() => setMagicValue('')}
                        />
                        <AnimatePresence>
                            {aiExplanation && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="flex items-center justify-center gap-1.5 mt-3 text-emerald-600 dark:text-emerald-400"
                                >
                                    <Sparkles className="h-3 w-3 fill-current" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{aiExplanation}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. Manual Toggle & Form */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAllFields(!showManualForm)}
                        className="w-full text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-2 mb-4"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {showManualForm ? 'Sembunyikan Detail' : 'Edit Manual'}
                        </span>
                        {showManualForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>

                    <AnimatePresence>
                        {showManualForm && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-6 pt-2 overflow-hidden"
                            >
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-5">
                                    <Tabs value={type} onValueChange={(v: any) => setValue('type', v)}>
                                        <TabsList className="w-full h-11 bg-muted/50 rounded-2xl p-1">
                                            <TabsTrigger value="expense" className="flex-1 rounded-xl text-[10px] font-bold uppercase">Pengeluaran</TabsTrigger>
                                            <TabsTrigger value="income" className="flex-1 rounded-xl text-[10px] font-bold uppercase">Pemasukan</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                    <AmountInput control={control} name="amount" error={errors.amount?.message} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <WalletSelector control={control} name="walletId" wallets={wallets} label="Dompet" error={errors.walletId?.message} />
                                    <DatePicker control={control} name="date" error={errors.date?.message} />
                                </div>

                                <CategorySelector control={control} name="category" categories={activeCategories} error={errors.category?.message} onSubCategoryChange={(val) => setValue('subCategory', val)} />
                                
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Deskripsi</p>
                                    <Input {...form.register('description')} placeholder="Catatan transaksi..." className="h-12 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Global Actions */}
                <div className="p-6 border-t bg-white dark:bg-zinc-950 flex gap-3 pb-safe">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleDelete}
                        className="h-14 w-14 rounded-2xl text-rose-500 hover:bg-rose-500/10 shrink-0 border border-rose-500/10"
                    >
                        <Trash2 className="h-6 w-6" />
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="flex-1 h-14 rounded-2xl text-base font-bold shadow-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Simpan Perubahan
                            </div>
                        )}
                    </Button>
                </div>

            </SheetContent>
        </Sheet>
    );
};
