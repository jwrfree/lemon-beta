'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trash2, Save, CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

// Hooks & Logic
import { useTransactionForm } from '../hooks/use-transaction-form';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';

// Form Partials
import { AmountInput } from './form-partials/amount-input';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { DatePicker } from './form-partials/date-picker';

interface EditTransactionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export const EditTransactionSheet = ({ isOpen, onClose, transaction }: EditTransactionSheetProps) => {
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();

    // Use the new robust hook
    const { form, isSubmitting, handleSubmit, handleDelete } = useTransactionForm({
        initialData: transaction,
        onSuccess: onClose
    });

    const { control, watch, setValue, formState: { errors } } = form;
    const type = watch('type');
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

    if (!transaction) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-w-lg rounded-t-[2rem] sm:rounded-xl px-0 pb-0 flex flex-col gap-0 overflow-hidden border-none shadow-2xl">

                {/* 1. Premium Header */}
                <div className="px-6 py-5 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500')} />
                            Edit Transaksi
                        </SheetTitle>
                        <SheetDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                            ID: {transaction.id.slice(0, 8)}...
                        </SheetDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 transition-all"
                        aria-label="Hapus Transaksi"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* 2. Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-black/20">

                    {/* Amount & Type Section */}
                    <div className="bg-background rounded-3xl p-4 shadow-sm border border-border/50 space-y-4">
                        <Tabs value={type} onValueChange={(v: any) => setValue('type', v)} className="w-full">
                            <TabsList className="w-full h-11 bg-muted/50 rounded-2xl p-1">
                                <TabsTrigger value="expense" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm transition-all">Pengeluaran</TabsTrigger>
                                <TabsTrigger value="income" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">Pemasukan</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="pt-2">
                            <AmountInput control={control} name="amount" error={errors.amount?.message} />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <WalletSelector
                                control={control}
                                name="walletId"
                                wallets={wallets}
                                label="Dompet"
                                error={(errors as any).walletId?.message}
                            />
                            <DatePicker
                                control={control}
                                name="date"
                                error={errors.date?.message}
                            />
                        </div>

                        <CategorySelector
                            control={control}
                            name="category"
                            categories={activeCategories}
                            error={(errors as any).category?.message}
                            onSubCategoryChange={(val) => setValue('subCategory', val)}
                        />

                        <div className="space-y-2">
                            <Input
                                {...form.register('description')}
                                placeholder="Catatan (opsional)"
                                className="h-12 rounded-2xl bg-white dark:bg-zinc-900 border-border/50 focus:ring-primary/20"
                            />
                            {errors.description && <p className="text-xs text-destructive pl-1">{errors.description.message}</p>}
                        </div>
                    </div>
                </div>

                {/* 3. Footer Actions */}
                <div className="p-4 border-t bg-background/80 backdrop-blur-xl sticky bottom-0 z-10 pb-safe">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cn(
                            "w-full h-12 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-[0.98]",
                            type === 'expense'
                                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Simpan Perubahan
                            </span>
                        )}
                    </Button>
                </div>

            </SheetContent>
        </Sheet>
    );
};
