'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/app-provider';
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
import { X, CalendarIcon, ArrowRightLeft, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { categoryDetails, Category } from '@/lib/categories';
import { SubCategorySheet } from './sub-category-sheet';
import { useUI } from '@/components/ui-provider';

interface TransactionFormProps {
  onClose: (data?: any) => void;
  isModal?: boolean;
  initialData?: any | null;
}

export const TransactionForm = ({ onClose, isModal = true, initialData = null }: TransactionFormProps) => {
    const { addTransaction, updateTransaction } = useApp();
    const { wallets, expenseCategories, incomeCategories } = useData();
    const { setIsTransferModalOpen, showToast } = useUI();
    
    const isEditMode = !!initialData;
    const defaultWallet = wallets.find(w => w.isDefault);

    const [type, setType] = useState(initialData?.type || 'expense');
    const [amount, setAmount] = useState(() => {
        if (!initialData?.amount) return '';
        return new Intl.NumberFormat('id-ID').format(initialData.amount);
    });
    const [category, setCategory] = useState(initialData?.category || '');
    const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
    const [walletId, setWalletId] = useState(initialData?.walletId || defaultWallet?.id || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [date, setDate] = useState<Date | undefined>(initialData ? parseISO(initialData.date) : new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setAmount(formattedValue);
    };

    const handleTypeChange = (newType: string) => {
        if (newType === 'transfer') {
            onClose(); // Close the current form
            setTimeout(() => setIsTransferModalOpen(true), 100); 
        } else {
            setType(newType);
            const newCategories = newType === 'expense' ? expenseCategories : incomeCategories;
            // Reset category if it's not in the new list of categories
            if (!newCategories.some(c => c.name === category)) {
                setCategory('');
                setSubCategory('');
            }
        }
    };
    
    const handleCategorySelect = (cat: Category) => {
        setCategory(cat.name);
        setSubCategory(''); // Reset subcategory when main category changes
        if (cat.subCategories && cat.subCategories.length > 0) {
            setSelectedCategoryForSub(cat);
            setIsSubCategorySheetOpen(true);
        } else {
            setSelectedCategoryForSub(null);
        }
    };

    const handleSubCategorySelect = (subCatName: string) => {
        setSubCategory(subCatName);
        setIsSubCategorySheetOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !walletId || !date || !description) {
            showToast('Harap isi semua kolom yang wajib diisi.', 'error');
            return;
        }

        setIsSubmitting(true);
        const transactionData = {
            type,
            amount: parseInt(amount.replace(/[^0-9]/g, '')),
            category,
            subCategory,
            walletId,
            description,
            location,
            date: date.toISOString(),
        };

        try {
            if (isEditMode) {
                await updateTransaction(initialData.id, initialData, transactionData);
            } else {
                await addTransaction(transactionData);
                showToast('Transaksi berhasil ditambahkan!', 'success');
            }
            onClose(transactionData);
        } catch (error) {
            showToast(`Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} transaksi.`, 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlers = useSwipeable({
        onSwipedDown: () => onClose(),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    
    const formContent = (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 rounded-full bg-muted p-1">
                <Button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={cn(
                        "rounded-full",
                        type === 'expense' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-transparent text-muted-foreground hover:bg-background/50'
                    )}
                >
                    Pengeluaran
                </Button>
                <Button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                     className={cn(
                        "rounded-full",
                        type === 'income' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-transparent text-muted-foreground hover:bg-background/50'
                    )}
                >
                    Pemasukan
                </Button>
                <Button
                    type="button"
                    onClick={() => handleTypeChange('transfer')}
                    className="rounded-full bg-transparent text-muted-foreground hover:bg-background/50 flex items-center gap-1"
                >
                   <ArrowRightLeft className="h-4 w-4" /> Transfer
                </Button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Jumlah</Label>
                <Input
                    id="amount"
                    placeholder="Rp 0"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                    inputMode="numeric"
                    size="lg"
                    className="text-2xl font-bold"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                     <Label htmlFor="wallet">Dompet</Label>
                    <Select onValueChange={setWalletId} value={walletId}>
                        <SelectTrigger id="wallet">
                            <SelectValue placeholder="Pilih dompet" />
                        </SelectTrigger>
                        <SelectContent>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                    {wallet.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                type="button"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "d MMM yyyy", { locale: dateFnsLocaleId }) : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={dateFnsLocaleId}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category-button">Kategori</Label>
                <button
                    id="category-button"
                    type="button"
                    className="flex w-full items-center justify-between rounded-md border p-3"
                    onClick={() => {
                        const currentCategoryObject = categories.find(c => c.name === category);
                        if (currentCategoryObject) {
                            handleCategorySelect(currentCategoryObject);
                        } else if (categories.length > 0) {
                            // If no category is selected, or the selected one is invalid for the current type,
                            // open the sheet for the first available category as a default action.
                            // This case is unlikely if the first 8 are shown, but it's a good fallback.
                            // A better UX might be a dedicated "Choose Category" button.
                            // For now, we'll just log this. A dedicated category picker would be better.
                            console.log("No valid category selected to open sub-category sheet for.");
                        }
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
                </button>
                <div className="grid grid-cols-4 gap-2">
                    {categories.slice(0, 8).map((cat) => {
                        const isSelected = category === cat.name;
                        const { icon: CategoryIcon, color, bgColor } = categoryDetails(cat.name);
                        return (
                            <button
                                type="button"
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className={cn(
                                    "p-3 text-center border rounded-lg flex flex-col items-center justify-center gap-2 aspect-square",
                                    isSelected ? 'border-primary bg-primary/10' : 'border-transparent'
                                )}
                            >
                                <div className={cn("p-2 rounded-full", isSelected ? 'bg-transparent' : bgColor)}>
                                    <CategoryIcon className={cn("h-5 w-5", isSelected ? 'text-primary' : color)} />
                                </div>
                                <span className="text-xs text-center leading-tight truncate">{cat.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                    id="description"
                    placeholder="e.g., Kopi pagi"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Lokasi / Toko (Opsional)</Label>
                <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="location"
                        placeholder="e.g., Starbucks"
                        className="pl-10"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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
                    className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
                    onClick={() => onClose()}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-full"
                        onClick={(e) => e.stopPropagation()}
                        {...handlers}
                    >
                        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <Button variant="ghost" size="icon" onClick={() => onClose()} className="bg-muted rounded-full">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Tutup</span>
                            </Button>
                        </div>
                        {formContent}
                        <div className="p-4 border-t sticky bottom-0 bg-background z-10">
                            <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Transaksi'}`}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
                 <AnimatePresence>
                    {isSubCategorySheetOpen && selectedCategoryForSub && (
                        <SubCategorySheet
                            category={selectedCategoryForSub}
                            selectedValue={subCategory}
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
                    <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Transaksi'}`}
                    </Button>
                </div>
            </div>
             <AnimatePresence>
                {isSubCategorySheetOpen && selectedCategoryForSub && (
                    <SubCategorySheet
                        category={selectedCategoryForSub}
                        selectedValue={subCategory}
                        onSelect={handleSubCategorySelect}
                        onClose={() => setIsSubCategorySheetOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
