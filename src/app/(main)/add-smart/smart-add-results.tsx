'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, Pencil, Save } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CategoryGrid } from '@/features/transactions/components/category-grid';
import { categories } from '@/lib/categories';
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

    useEffect(() => {
        if (parsedData) {
            setEditDesc(parsedData.description || '');
            setEditAmount(String(parsedData.amount || ''));
        }
    }, [parsedData]);

    if (pageState === 'CONFIRMING' && parsedData) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <div className="flex justify-start">
                    <div className="p-4 bg-card rounded-2xl relative overflow-hidden group shadow-sm border border-border/50 max-w-[90%]">
                        <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60 transition-transform group-hover:scale-y-110 duration-300", getCategoryVisuals(parsedData.category).color.replace('text-', 'bg-'))} />
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-base leading-snug text-foreground">
                                <span>Oke, catat</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary bg-primary/10 px-1.5 py-0.5 rounded transition-all active:scale-95 text-left">
                                            {parsedData.description}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-4 shadow-xl rounded-2xl border-primary/10">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ubah Deskripsi</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={editDesc}
                                                    onChange={e => setEditDesc(e.target.value)}
                                                    autoFocus
                                                    className="h-10 rounded-xl"
                                                />
                                                <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <span>sebesar</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="font-bold text-primary tabular-nums underline underline-offset-4 decoration-primary/30 hover:decoration-primary bg-primary/10 px-1.5 py-0.5 rounded transition-all active:scale-95">
                                            {formatCurrency(parsedData.amount)}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-4 shadow-xl rounded-2xl border-primary/10">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ubah Nominal</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={e => setEditAmount(e.target.value)}
                                                    autoFocus
                                                    className="h-10 rounded-xl tabular-nums"
                                                />
                                                <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <span>?</span>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition-all hover:brightness-95 border shadow-sm",
                                                getCategoryVisuals(parsedData.category).bgColor,
                                                getCategoryVisuals(parsedData.category).color,
                                                getCategoryVisuals(parsedData.category).color.replace('text-', 'border-').split(' ')[0].replace('600', '300').replace('500', '200')
                                            )}
                                        >
                                            <span className="opacity-90 text-[10px]">Kategori:</span>
                                            {parsedData.category}
                                            <Pencil className="h-2.5 w-2.5 ml-0.5 opacity-70" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-2 shadow-2xl rounded-2xl border-primary/10" align="start">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 mt-1 px-2">Ganti Kategori Cepat</p>
                                            <CategoryGrid
                                                categories={parsedData.type === 'income' ? categories.income : categories.expense}
                                                selectedCategory={parsedData.category}
                                                onCategorySelect={(cat) => {
                                                    setParsedData({ ...parsedData, category: cat.name });
                                                    setIsCategoryPopoverOpen(false);
                                                }}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>

                {insightData && (
                    <div className="space-y-3">
                        {insightData.wallet?.isInsufficient && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start">
                                <div className="p-3 bg-destructive/10 text-destructive rounded-2xl text-[11px] font-medium flex flex-col gap-1 max-w-[85%] border border-destructive/20 shadow-sm shadow-destructive/5">
                                    <span className="font-bold uppercase tracking-wider text-[10px]">⚠️ Saldo Tidak Cukup!</span>
                                    <p className="opacity-90">Saldo {insightData.wallet.name} kamu akan menjadi minus ({formatCurrency(insightData.wallet.newBalance)}).</p>
                                </div>
                            </motion.div>
                        )}
                        {insightData.wallet && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-card rounded-2xl max-w-[85%] text-xs leading-relaxed border shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Dompet: {insightData.wallet.name}</span>
                                    <div>
                                        <span className="line-through opacity-40 tabular-nums">{formatCurrency(insightData.wallet.currentBalance)}</span>
                                        <span className="mx-2 text-muted-foreground/30">→</span>
                                        <span className={cn("font-bold tabular-nums", insightData.wallet.isInsufficient ? "text-destructive" : "text-primary")}>
                                            {formatCurrency(insightData.wallet.newBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {insightData.budget && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-card rounded-2xl max-w-[85%] text-xs leading-relaxed border shadow-sm flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Anggaran: {insightData.budget.name}</span>
                                    <div>
                                        <span className="line-through opacity-40 tabular-nums">{formatCurrency(insightData.budget.currentRemaining)}</span>
                                        <span className="mx-2 text-muted-foreground/30">→</span>
                                        <span className={cn("font-bold tabular-nums", insightData.budget.isOverBudget ? "text-destructive" : "text-primary")}>
                                            {formatCurrency(insightData.budget.newRemaining)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
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
                    <div className="p-3 bg-card rounded-2xl text-sm border shadow-sm font-medium">
                        Wah, saya menemukan <span className="font-bold text-primary">{multiParsedData.length} transaksi</span> sekaligus!
                    </div>
                </div>
                <div className="space-y-2">
                    {multiParsedData.map((tx, idx) => (
                        <div key={idx} className="bg-card rounded-2xl p-3 flex justify-between items-center relative overflow-hidden border shadow-sm group hover:border-primary/20 transition-colors">
                            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60 group-hover:scale-y-110 transition-transform", getCategoryVisuals(tx.category).color.replace('text-', 'bg-'))} />

                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", getCategoryVisuals(tx.category).bgColor, getCategoryVisuals(tx.category).color)}>
                                    {(() => {
                                        const Icon = getCategoryVisuals(tx.category).icon;
                                        const IconElement = Icon as React.ElementType;
                                        return IconElement ? <IconElement size={20} /> : null;
                                    })()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-semibold text-foreground tracking-tight truncate">{tx.description}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">{tx.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={cn("font-bold text-sm tabular-nums", tx.type === 'expense' ? "text-destructive" : "text-teal-600 dark:text-teal-500")}>
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
