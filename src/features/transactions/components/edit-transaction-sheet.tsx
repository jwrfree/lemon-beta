'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trash2, Save, CalendarIcon, ArrowRightLeft, Tag, MapPin, CornerDownRight, ChevronDown, ChevronUp, Sparkles, Heart, ShoppingBag } from 'lucide-react';
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
    const [showAllFields, setShowAllFields] = useState(true);
    // Always show manual form for editing
    const showManualForm = true;

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
    const isNeed = watch('isNeed');
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

    if (!transaction) return null;

    const handleMagicSubmit = async () => {
        if (!magicValue) return;
        await applyLiquidPatch(magicValue);
        setMagicValue('');
    };

    // --- GHOST TYPING (Auto-Process Logic) ---
    useEffect(() => {
        if (!magicValue || magicValue.length < 3) return;

        const timer = setTimeout(() => {
            handleMagicSubmit();
        }, 1200); // 1.2s delay

        return () => clearTimeout(timer);
    }, [magicValue]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[95vh] sm:h-auto sm:max-w-lg rounded-t-lg sm:rounded-lg px-0 pb-0 flex flex-col gap-0 overflow-hidden border-none shadow-2xl bg-background text-foreground">
                <SheetHeader className="sr-only">
                    <SheetTitle>Edit Transaksi</SheetTitle>
                    <SheetDescription>Gunakan Magic Bar atau formulir manual untuk mengubah detail transaksi.</SheetDescription>
                </SheetHeader>

                {/* 1. Liquid Header (The Star) */}
                <div className="relative pt-8 pb-4 bg-card border-b border-border shadow-sm">
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
                                    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg">
                                        <Tag className="h-3 w-3 fill-primary-foreground/20" />
                                        <span className="text-xs font-medium uppercase tracking-widest">{category}</span>
                                    </div>
                                    {subCategory && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10"
                                        >
                                            <CornerDownRight className="h-3 w-3 opacity-50" />
                                            <span className="text-xs font-medium">{subCategory}</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                            {location && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1 text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-sm"
                                >
                                    <MapPin className="h-3 w-3 text-destructive" />
                                    <span className="text-xs font-medium uppercase tracking-wider">{location}</span>
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
                                    className="flex items-center justify-center gap-1.5 mt-3 text-success"
                                >
                                    <Sparkles className="h-3 w-3 fill-current" />
                                    <span className="text-xs font-medium uppercase tracking-widest">{aiExplanation}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. Manual Form (Always Visible) */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-6 pt-2 overflow-hidden"
                    >
                        <div className="bg-card rounded-lg p-5 border border-border shadow-card space-y-5">
                            <Tabs value={type} onValueChange={(v: any) => setValue('type', v)}>
                                <TabsList className="w-full h-11 bg-muted/50 rounded-lg p-1">
                                    <TabsTrigger value="expense" className="flex-1 rounded-md text-xs font-medium uppercase">Pengeluaran</TabsTrigger>
                                    <TabsTrigger value="income" className="flex-1 rounded-md text-xs font-medium uppercase">Pemasukan</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <AmountInput control={control} name="amount" error={errors.amount?.message} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <WalletSelector control={control} name="walletId" wallets={wallets} label="Dompet" error={(errors as any).walletId?.message} />
                            <DatePicker control={control} name="date" error={errors.date?.message} />
                        </div>

                        <CategorySelector
                            control={control}
                            name="category"
                            value={subCategory}
                            categories={activeCategories}
                            error={(errors as any).category?.message}
                            onSubCategoryChange={(val) => setValue('subCategory', val)}
                        />

                        {type === 'expense' && (
                            <div className="flex gap-2 p-1 bg-secondary rounded-lg border border-border">
                                <button
                                    type="button"
                                    onClick={() => setValue('isNeed', true, { shouldDirty: true })}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-md text-xs font-medium uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        isNeed !== false ? "bg-card shadow-sm text-success ring-1 ring-border" : "text-muted-foreground hover:bg-card/50"
                                    )}
                                >
                                    <Heart className={cn("h-3.5 w-3.5", isNeed !== false ? "fill-success" : "opacity-50")} />
                                    Kebutuhan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('isNeed', false, { shouldDirty: true })}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-md text-xs font-medium uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        isNeed === false ? "bg-card shadow-sm text-pink-500 ring-1 ring-border" : "text-muted-foreground hover:bg-card/50"
                                    )}
                                >
                                    <ShoppingBag className={cn("h-3.5 w-3.5", isNeed === false ? "fill-pink-500" : "opacity-50")} />
                                    Keinginan
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Lokasi
                            </p>
                            <Input {...form.register('location')} placeholder="Mis: Grand Indonesia, Starbucks..." className="h-12 rounded-lg bg-card border-border" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-1">Deskripsi</p>
                            <Input {...form.register('description')} placeholder="Catatan transaksi..." className="h-12 rounded-lg bg-card border-border" />
                        </div>
                    </motion.div>
                </div>

                {/* 3. Global Actions */}
                <div className="p-6 border-t bg-card flex gap-3 pb-safe">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-14 w-14 rounded-lg text-destructive hover:bg-destructive/10 shrink-0 border border-destructive/10"
                    >
                        <Trash2 className="h-6 w-6" />
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 h-14 rounded-lg text-base font-medium shadow-card bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all"
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

