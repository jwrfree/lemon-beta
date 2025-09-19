
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/app-provider';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { X, CalendarIcon, ArrowRightLeft, MapPin, ChevronRight } from 'lucide-react';
import { categoryDetails, Category } from '@/lib/categories';
import { SubCategorySheet } from './sub-category-sheet';

interface AddTransactionFormProps {
  onClose: () => void;
  isModal?: boolean;
  initialData?: any | null;
}

export const AddTransactionForm = ({ onClose, isModal = true, initialData: propsInitialData }: AddTransactionFormProps) => {
    const { addTransaction, wallets, expenseCategories, incomeCategories, setIsTxModalOpen, setIsTransferModalOpen } = useApp();
    
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
      if (propsInitialData) {
        setInitialData(propsInitialData);
      } else if (!isModal) {
        // Fallback to session storage if not passed as prop and not in modal mode
        const prefilled = sessionStorage.getItem('prefilled-tx');
        if (prefilled) {
            try {
                setInitialData(JSON.parse(prefilled));
                sessionStorage.removeItem('prefilled-tx');
            } catch (e) {
                console.error("Failed to parse prefilled data", e);
            }
        }
      }
    }, [propsInitialData, isModal]);

    const defaultWallet = wallets.find(w => w.isDefault);

    const [type, setType] = useState(initialData?.type || 'expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(initialData?.category || '');
    const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
    const [walletId, setWalletId] = useState(initialData?.walletId || defaultWallet?.id || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [date, setDate] = useState<Date | undefined>(initialData ? parseISO(initialData.date) : new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);

    useEffect(() => {
        if (initialData) {
            setType(initialData.type || 'expense');
            setCategory(initialData.category || '');
            setWalletId(initialData.walletId || defaultWallet?.id || '');
            setDescription(initialData.description || '');
            setLocation(initialData.location || '');
            setDate(initialData.date ? parseISO(initialData.date) : new Date());
            const formattedValue = new Intl.NumberFormat('id-ID').format(initialData.amount || 0);
            setAmount(formattedValue);
        }
    }, [initialData, defaultWallet?.id]);


    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setAmount(formattedValue);
    };

    const handleTypeChange = (newType: string) => {
        if (newType === 'transfer') {
            setIsTxModalOpen(false);
            setTimeout(() => setIsTransferModalOpen(true), 100); 
        } else {
            setType(newType);
            setCategory('');
            setSubCategory('');
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
            toast.error('Harap isi semua kolom yang wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addTransaction({
                type,
                amount: parseInt(amount.replace(/[^0-9]/g, '')),
                category,
                subCategory,
                walletId,
                description,
                location,
                date: date.toISOString(),
            });
            toast.success('Transaksi berhasil ditambahkan!');
            onClose();
        } catch (error) {
            toast.error('Gagal menambahkan transaksi.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlers = useSwipeable({
        onSwipedDown: onClose,
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
                    className="text-2xl h-14 font-bold"
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
                <Label>Kategori</Label>
                <div className="flex items-center justify-between rounded-md border p-3" onClick={() => category && handleCategorySelect(categories.find(c => c.name === category)!)}>
                    {category ? (
                        <div className="flex flex-col">
                            <span className="font-medium">{category}</span>
                            {subCategory && <span className="text-sm text-muted-foreground">{subCategory}</span>}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Pilih Kategori</span>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => {
                        const isSelected = category === cat.name;
                        const { icon: CategoryIcon, color, bgColor } = categoryDetails(cat.name);
                        return (
                            <button
                                type="button"
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className={cn(
                                    "p-3 text-center border rounded-lg flex flex-col items-center justify-center gap-2 aspect-square",
                                    isSelected ? 'border-primary bg-primary/10' : 'border-muted'
                                )}
                            >
                                <div className={cn("p-3 rounded-full", isSelected ? 'bg-transparent' : bgColor)}>
                                    <CategoryIcon className={cn("h-6 w-6", isSelected ? 'text-primary' : color)} />
                                </div>
                                <span className="text-sm text-center truncate">{cat.name}</span>
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

    return (
        <>
            {isModal ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-full"
                        onClick={(e) => e.stopPropagation()}
                        {...handlers}
                    >
                        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold">Tambah Transaksi</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        {formContent}
                        <div className="p-4 border-t sticky bottom-0 bg-background z-10">
                            <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : (
                <div className="flex flex-col h-full bg-background">
                     <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                         <Button variant="ghost" size="icon" className="absolute left-4" onClick={onClose}>
                            <X className="h-6 w-6" strokeWidth={1.75} />
                        </Button>
                        <h1 className="text-xl font-bold text-center w-full">Edit Detail</h1>
                    </header>
                    {formContent}
                    <div className="p-4 border-t sticky bottom-0 bg-background z-10">
                        <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </Button>
                    </div>
                </div>
            )}
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
