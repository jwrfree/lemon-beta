'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/providers/app-provider';
import { useData } from '@/hooks/use-data';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { X, CalendarIcon, ArrowRightLeft, MapPin, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { categoryDetails, Category } from '@/lib/categories';
import { SubCategorySheet } from './sub-category-sheet';
import { useUI } from '@/components/ui-provider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormValues } from '../schemas/transaction-schema';
import { z } from 'zod';
import { TransactionTypeSelector } from './transaction-type-selector';
import { CategoryGrid } from './category-grid';
import type { Transaction } from '@/types/models';
import { suggestCategory } from '@/ai/flows/suggest-category-flow';

interface TransactionFormProps {
  onClose: (data?: any) => void;
  isModal?: boolean;
  initialData?: Transaction | null;
}

export const TransactionForm = ({ onClose, isModal = true, initialData = null }: TransactionFormProps) => {
    const { addTransaction, updateTransaction } = useApp();
    const { wallets, expenseCategories, incomeCategories } = useData();
    const { setIsTransferModalOpen, showToast } = useUI();
    
    const isEditMode = !!initialData;
    const defaultWallet = wallets.find(w => w.isDefault);

    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const lastSuggestedRef = useRef<string>('');

    const form = useForm<z.input<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            type: initialData?.type || 'expense',
            amount: initialData?.amount ? new Intl.NumberFormat('id-ID').format(initialData.amount) : '',
            category: initialData?.category || '',
            subCategory: initialData?.subCategory || '',
            walletId: initialData?.walletId || defaultWallet?.id || '',
            description: initialData?.description || '',
            location: initialData?.location || '',
            date: initialData ? parseISO(initialData.date) : new Date(),
        }
    });

    const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;
    const type = watch('type');
    const category = watch('category');
    const subCategory = watch('subCategory');
    const description = watch('description');

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    // AI Predictive Category
    useEffect(() => {
        if (isEditMode || !description || description.length < 3 || description === lastSuggestedRef.current) return;

        const timer = setTimeout(async () => {
            setIsSuggesting(true);
            try {
                const result = await suggestCategory(description, type);
                if (result && result.confidence > 0.7) {
                    const matchedCategory = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
                    if (matchedCategory && category !== matchedCategory.name) {
                        setValue('category', matchedCategory.name, { shouldValidate: true });
                        lastSuggestedRef.current = description;
                        // Optional: show a small toast or visual indicator that AI helped
                    }
                }
            } catch (error) {
                console.error("Suggestion error", error);
            } finally {
                setIsSuggesting(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [description, type, category, categories, setValue, isEditMode]);

    const handleTypeChange = (newType: string) => {
        if (newType === 'transfer') {
            onClose(); 
            setTimeout(() => setIsTransferModalOpen(true), 100); 
        } else {
            setValue('type', newType as 'expense' | 'income');
            const newCategories = newType === 'expense' ? expenseCategories : incomeCategories;
            if (!newCategories.some(c => c.name === category)) {
                setValue('category', '');
                setValue('subCategory', '');
            }
        }
    };
    
    const handleCategorySelect = (cat: Category) => {
        setValue('category', cat.name, { shouldValidate: true });
        setValue('subCategory', ''); 
        if (cat.subCategories && cat.subCategories.length > 0) {
            setSelectedCategoryForSub(cat);
            setIsSubCategorySheetOpen(true);
        } else {
            setSelectedCategoryForSub(null);
        }
    };

    const handleSubCategorySelect = (subCatName: string) => {
        setValue('subCategory', subCatName);
        setIsSubCategorySheetOpen(false);
    };

    const onSubmit = async (data: TransactionFormValues) => {
        const transactionData = {
            ...data,
            date: data.date.toISOString(),
        };

        try {
            if (isEditMode) {
                await updateTransaction(initialData.id, initialData, transactionData);
            } else {
                await addTransaction(transactionData);
            }
            onClose(transactionData);
        } catch (error: any) {
            const action = isEditMode ? 'memperbarui' : 'menambahkan';
            showToast(`Gagal ${action} transaksi: ${error.message || 'Terjadi kesalahan'}`, 'error');
        }
    };

    const onInvalid = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) showToast(firstError.message, 'error');
    };
    
    const handlers = useSwipeable({
        onSwipedDown: () => onClose(),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    
    const formContent = (
        <form onSubmit={handleSubmit(onSubmit as any, onInvalid)} className="flex-1 overflow-y-auto p-4 space-y-4">
            <TransactionTypeSelector type={type} onTypeChange={handleTypeChange} />

            <div className="space-y-2">
                <Label htmlFor="amount" className={cn(errors.amount && "text-destructive")}>Jumlah</Label>
                <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="amount"
                            placeholder="Rp 0"
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                if (rawValue === '') {
                                    field.onChange('');
                                    return;
                                }
                                field.onChange(new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0));
                            }}
                            inputMode="numeric"
                            className={cn("text-2xl font-bold", errors.amount && "border-destructive")}
                        />
                    )}
                />
                {errors.amount && <p className="text-sm font-medium text-destructive">{errors.amount.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                     <Label htmlFor="wallet" className={cn(errors.walletId && "text-destructive")}>Dompet</Label>
                     <Controller
                        control={control}
                        name="walletId"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="wallet" className={cn(errors.walletId && "border-destructive")}>
                                    <SelectValue placeholder="Pilih dompet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wallets.map((wallet) => (
                                        <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date" className={cn(errors.date && "text-destructive")}>Tanggal</Label>
                    <Controller
                        control={control}
                        name="date"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground", errors.date && "border-destructive")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "d MMM yyyy", { locale: dateFnsLocaleId }) : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={dateFnsLocaleId} />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="category-button" className={cn(errors.category && "text-destructive")}>Kategori</Label>
                    <AnimatePresence>
                        {isSuggesting && (
                            <motion.div 
                                initial={{ opacity: 0, x: 5 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-md"
                            >
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                AI berpikir...
                            </motion.div>
                        )}
                        {!isSuggesting && lastSuggestedRef.current && lastSuggestedRef.current === description && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100"
                            >
                                <Sparkles className="h-2.5 w-2.5 fill-amber-600" />
                                Disarankan AI
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <Button
                    id="category-button"
                    type="button"
                    variant="outline"
                    className={cn("flex w-full items-center justify-between rounded-md p-3 h-auto", errors.category && "border-destructive")}
                    onClick={() => {
                        const catObj = categories.find(c => c.name === category);
                        if (catObj) handleCategorySelect(catObj);
                    }}
                >
                    {category ? (
                        <div className="flex flex-col text-left">
                            <span className="font-medium truncate">{category}</span>
                            {subCategory && <span className="text-sm text-muted-foreground">{subCategory}</span>}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Pilih Kategori</span>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                <CategoryGrid categories={categories} selectedCategory={category} onCategorySelect={handleCategorySelect} />
                {errors.category && <p className="text-sm font-medium text-destructive">{errors.category.message as string}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <Input {...field} id="description" placeholder="e.g., Kopi pagi" className={cn(errors.description && "border-destructive")} />
                    )}
                />
            </div>
            <div className="space-y-2 pb-2">
                <Label htmlFor="location">Lokasi / Toko (Opsional)</Label>
                <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Controller
                        control={control}
                        name="location"
                        render={({ field }) => (
                            <Input {...field} id="location" placeholder="e.g., Starbucks" className="pl-10" />
                        )}
                    />
                </div>
            </div>
        </form>
    );

    const title = isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi';

    if (isModal) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4"
                    onClick={() => onClose()}
                >
                    <motion.div
                        initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        animate={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
                        exit={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full max-w-md bg-background rounded-t-xl md:rounded-lg shadow-xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh] border border-border/50"
                        onClick={(e) => e.stopPropagation()}
                        {...handlers}
                    >
                        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-xl md:rounded-t-lg z-10">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <Button variant="ghost" size="icon" onClick={() => onClose()} className="bg-muted rounded-md">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Tutup</span>
                            </Button>
                        </div>
                        {formContent}
                        <div className="p-4 border-t sticky bottom-0 bg-background md:rounded-b-lg z-10">
                            <Button type="submit" onClick={handleSubmit(onSubmit as any, onInvalid)} className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Transaksi'}`}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
                 <AnimatePresence>
                    {isSubCategorySheetOpen && selectedCategoryForSub && (
                        <SubCategorySheet
                            category={selectedCategoryForSub}
                            selectedValue={subCategory || ''}
                            onSelect={handleSubCategorySelect}
                            onClose={() => setIsSubCategorySheetOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <>
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                 <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => onClose()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">{title}</h1>
            </header>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {formContent}
                </div>
                <div className="p-4 border-t bg-background z-10">
                    <Button type="submit" onClick={handleSubmit(onSubmit as any, onInvalid)} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Transaksi'}`}
                    </Button>
                </div>
            </div>
             <AnimatePresence>
                {isSubCategorySheetOpen && selectedCategoryForSub && (
                    <SubCategorySheet
                        category={selectedCategoryForSub}
                        selectedValue={subCategory || ''}
                        onSelect={handleSubCategorySelect}
                        onClose={() => setIsSubCategorySheetOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
