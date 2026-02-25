'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, Pencil, Save, ChevronLeft, CornerDownRight, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CategoryGrid } from '@/features/transactions/components/category-grid';
import { categories, Category } from '@/lib/categories';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SmartAddResultsProps {
    pageState: string;
    parsedData: any;
    multiParsedData: any[];
    inputValue: string;
    getCategoryVisuals: (cat: string) => any;
    isCategoryPopoverOpen: boolean;
    setIsCategoryPopoverOpen: (open: boolean) => void;
    setParsedData: (data: any) => void;
    insightData: any;
    removeMultiTransaction: (index: number) => void;
}

export const SmartAddResults = ({
    pageState,
    parsedData,
    multiParsedData,
    inputValue,
    getCategoryVisuals,
    isCategoryPopoverOpen,
    setIsCategoryPopoverOpen,
    setParsedData,
    insightData,
    removeMultiTransaction
}: SmartAddResultsProps) => {
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');

    // Sub-category logic state
    const [popoverView, setPopoverView] = useState<'CATEGORY' | 'SUBCATEGORY'>('CATEGORY');
    const [tempCategory, setTempCategory] = useState<Category | null>(null);

    useEffect(() => {
        if (parsedData) {
            setEditDesc(parsedData.description || '');
            setEditAmount(String(parsedData.amount || ''));
        }
    }, [parsedData]);

    // Reset popover view when closed
    useEffect(() => {
        if (!isCategoryPopoverOpen) {
            setTimeout(() => {
                setPopoverView('CATEGORY');
                setTempCategory(null);
            }, 300);
        }
    }, [isCategoryPopoverOpen]);

    const handleCategorySelect = (cat: Category) => {
        // Robust lookup: Re-fetch from source logic to ensure sub_categories exist
        // Sometimes prop passing strips optional fields or transforms them
        const originalCat = [...categories.expense, ...categories.income].find(c => c.name === cat.name);

        if (originalCat && originalCat.sub_categories && originalCat.sub_categories.length > 0) {
            setTempCategory(originalCat);
            setPopoverView('SUBCATEGORY');
        } else {
            // No sub-categories, just set and close
            setParsedData({ ...parsedData, category: cat.name, subCategory: undefined });
            setIsCategoryPopoverOpen(false);
        }
    };

    const handleSubCategorySelect = (sub: string) => {
        if (tempCategory) {
            setParsedData({ ...parsedData, category: tempCategory.name, subCategory: sub });
            setIsCategoryPopoverOpen(false);
        }
    };

    if (pageState === 'CONFIRMING' && parsedData) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <div className="flex justify-start">
                    <div className="p-4 bg-card rounded-card relative overflow-hidden group shadow-card border border-border/50 max-w-[90%]">
                        <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60 transition-transform group-hover:scale-y-110 duration-300", getCategoryVisuals(parsedData.category).color.replace('text-', 'bg-'))} />
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-base leading-snug text-foreground">
                                <span>Oke, catat</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary bg-primary/10 px-1.5 py-0.5 rounded transition-all active:scale-95 text-left">
                                            {parsedData.description}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-4 shadow-xl rounded-card border-primary/10">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Ubah Deskripsi</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={editDesc}
                                                    onChange={e => setEditDesc(e.target.value)}
                                                    autoFocus
                                                    className="h-10 rounded-md"
                                                />
                                                <Button size="icon" className="h-10 w-10 shrink-0 rounded-md" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <span>sebesar</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="font-medium text-primary tabular-nums underline underline-offset-4 decoration-primary/30 hover:decoration-primary bg-primary/10 px-1.5 py-0.5 rounded transition-all active:scale-95">
                                            {formatCurrency(parsedData.amount)}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-4 shadow-xl rounded-card border-primary/10">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Ubah Nominal</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={e => setEditAmount(e.target.value)}
                                                    autoFocus
                                                    className="h-10 rounded-md tabular-nums"
                                                />
                                                <Button size="icon" className="h-10 w-10 shrink-0 rounded-md" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <span>?</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all hover:brightness-95 border",
                                                getCategoryVisuals(parsedData.category).bgColor,
                                                getCategoryVisuals(parsedData.category).color,
                                                getCategoryVisuals(parsedData.category).color.replace('text-', 'border-').split(' ')[0].replace('600', '300').replace('500', '200')
                                            )}
                                        >
                                            <span className="opacity-90 text-xs">Kategori:</span>
                                            {parsedData.category}
                                            {parsedData.subCategory && (
                                                <>
                                                    <span className="opacity-50">/</span>
                                                    <span className="opacity-90">{parsedData.subCategory}</span>
                                                </>
                                            )}
                                            <Pencil className="h-2.5 w-2.5 ml-0.5 opacity-70" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0 shadow-xl rounded-card border-primary/10 overflow-hidden" align="start">

                                        {popoverView === 'CATEGORY' ? (
                                            <div className="max-h-[300px] overflow-y-auto p-2">
                                                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 mt-1 px-2">Ganti Kategori Cepat</p>
                                                <CategoryGrid
                                                    categories={parsedData.type === 'income' ? categories.income : categories.expense}
                                                    selectedCategory={parsedData.category}
                                                    onCategorySelect={handleCategorySelect}
                                                />
                                            </div>
                                        ) : (
                                            <div className="max-h-[300px] overflow-y-auto bg-slate-50 dark:bg-zinc-900">
                                                <div className="sticky top-0 bg-white dark:bg-black p-3 border-b flex items-center gap-2 z-10">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setPopoverView('CATEGORY')}>
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", tempCategory?.color?.replace('text-', 'bg-') || 'bg-gray-500')} />
                                                        <span className="text-sm font-medium">{tempCategory?.name}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2 grid grid-cols-1 gap-1">
                                                    {/* Option to select parent only */}
                                                    <button
                                                        className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group"
                                                        onClick={() => {
                                                            if (tempCategory) {
                                                                setParsedData({ ...parsedData, category: tempCategory.name, subCategory: undefined });
                                                                setIsCategoryPopoverOpen(false);
                                                            }
                                                        }}
                                                    >
                                                        <span>Tanpa Sub-Kategori</span>
                                                    </button>

                                                    {tempCategory?.sub_categories?.map((sub) => (
                                                        <button
                                                            key={sub}
                                                            className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group"
                                                            onClick={() => handleSubCategorySelect(sub)}
                                                        >
                                                            <span>{sub}</span>
                                                            <CornerDownRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {/* Need vs Want Toggle */}
                                {parsedData.type === 'expense' && (
                                    <button
                                        type="button"
                                        onClick={() => setParsedData({ ...parsedData, isNeed: !parsedData.isNeed })}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all border",
                                            parsedData.isNeed 
                                                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                                                : "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800"
                                        )}
                                    >
                                        <Sparkles className={cn("h-3 w-3", !parsedData.isNeed && "fill-current")} />
                                        {parsedData.isNeed ? 'Kebutuhan (Need)' : 'Gaya Hidup (Want)'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {insightData && (
                    <div className="space-y-2">
                        {insightData.wallet?.isInsufficient && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start">
                                <div className="p-3 bg-destructive/10 text-destructive rounded-card text-xs font-medium flex flex-col gap-1 max-w-[85%] border border-destructive/20 shadow-destructive/5">
                                    <span className="font-medium uppercase tracking-widest text-xs">⚠️ Saldo Tidak Cukup!</span>
                                    <p className="opacity-90">Saldo {insightData.wallet.name} kamu akan menjadi minus ({formatCurrency(insightData.wallet.newBalance)}).</p>
                                </div>
                            </motion.div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                            {insightData.wallet && (
                                <div className="p-3 bg-card rounded-card text-xs leading-relaxed border shadow-card flex flex-col gap-1 min-w-[140px]">
                                    <span className="text-xs uppercase font-medium text-muted-foreground/60 tracking-widest">Sumber: {insightData.wallet.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40 tabular-nums">{formatCurrency(insightData.wallet.currentBalance)}</span>
                                        <span className="text-muted-foreground/30">→</span>
                                        <span className={cn("font-medium tabular-nums", insightData.wallet.isInsufficient ? "text-destructive" : "text-primary")}>
                                            {formatCurrency(insightData.wallet.newBalance)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {insightData.budget && (
                                <div className="p-3 bg-card rounded-card text-xs leading-relaxed border shadow-card flex flex-col gap-1 min-w-[140px]">
                                    <span className="text-xs uppercase font-medium text-muted-foreground/60 tracking-widest">Anggaran: {insightData.budget.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40 tabular-nums">{formatCurrency(insightData.budget.currentRemaining)}</span>
                                        <span className="text-muted-foreground/30">→</span>
                                        <span className={cn("font-medium tabular-nums", insightData.budget.isOverBudget ? "text-destructive" : "text-primary")}>
                                            {formatCurrency(insightData.budget.newRemaining)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }

    if (pageState === 'MULTI_CONFIRMING' && multiParsedData.length > 0) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <div className="flex justify-start">
                    <div className="p-3 bg-card rounded-card text-sm border shadow-card font-medium">
                        Wah, saya menemukan <span className="font-medium text-primary">{multiParsedData.length} transaksi</span> sekaligus!
                    </div>
                </div>
                <div className="space-y-2">
                    {multiParsedData.map((tx, idx) => (
                        <div key={idx} className="bg-card rounded-card p-3 flex justify-between items-center relative overflow-hidden border shadow-card group hover:border-primary/20 transition-colors">
                            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60 group-hover:scale-y-110 transition-transform", getCategoryVisuals(tx.category).color.replace('text-', 'bg-'))} />

                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn("h-11 w-11 rounded-md flex items-center justify-center shrink-0", getCategoryVisuals(tx.category).bgColor, getCategoryVisuals(tx.category).color)}>
                                    {(() => {
                                        const Icon = getCategoryVisuals(tx.category).icon;
                                        const IconElement = Icon as React.ElementType;
                                        return IconElement ? <IconElement size={20} /> : null;
                                    })()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium text-foreground tracking-tight truncate">{tx.description}</span>
                                    {/* Updated: Check if subCategory exists in Multi-mode as well if parser supports it */}
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                                        {tx.category}
                                        {tx.subCategory ? ` / ${tx.subCategory}` : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={cn("font-medium text-sm tabular-nums", tx.type === 'expense' ? "text-destructive" : "text-teal-600 dark:text-teal-500")}>
                                    {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                                </span>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors" onClick={() => removeMultiTransaction(idx)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    return null;
};

