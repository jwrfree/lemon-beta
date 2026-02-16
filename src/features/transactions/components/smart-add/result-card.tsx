'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryGrid } from '@/features/transactions/components/category-grid'; // Reuse existing
import { categories } from '@/lib/categories'; // Reuse existing

interface ResultCardProps {
    parsedData: any;
    setParsedData: (data: any) => void;
    getCategoryVisuals: (cat: string) => any;
}

export const ResultCard = ({ parsedData, setParsedData, getCategoryVisuals }: ResultCardProps) => {
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [isCatOpen, setIsCatOpen] = useState(false);

    useEffect(() => {
        if (parsedData) {
            setEditDesc(parsedData.description || '');
            setEditAmount(String(parsedData.amount || ''));
        }
    }, [parsedData]);

    if (!parsedData) return null;

    const visuals = getCategoryVisuals(parsedData.category);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
        >
            <div className="bg-card rounded-3xl p-4 shadow-lg border border-border/60 relative overflow-hidden group">
                {/* Decorative Gradient Bar */}
                <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-80", visuals.color.replace('text-', 'bg-'))} />

                <div className="pl-3 space-y-4">
                    {/* Header: Amount & Category */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="text-2xl font-bold tabular-nums text-foreground tracking-tight hover:opacity-70 transition-opacity text-left">
                                        {formatCurrency(parsedData.amount)}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 p-3" side="bottom" align="start">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Ubah Nominal</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={editAmount}
                                                onChange={e => setEditAmount(e.target.value)}
                                                autoFocus
                                                className="h-8 text-sm"
                                            />
                                            <Button size="sm" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Popover open={isCatOpen} onOpenChange={setIsCatOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn("mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit transition-colors hover:brightness-90", visuals.bgColor, visuals.color)}>
                                        {parsedData.category}
                                        <Pencil className="h-2 w-2 opacity-50" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="start">
                                    <div className="p-3 max-h-[300px] overflow-y-auto">
                                        <p className="text-xs font-semibold mb-2 px-1 text-muted-foreground">Pilih Kategori</p>
                                        <CategoryGrid
                                            categories={parsedData.type === 'income' ? categories.income : categories.expense}
                                            selectedCategory={parsedData.category}
                                            onCategorySelect={(cat) => {
                                                setParsedData({ ...parsedData, category: cat.name });
                                                setIsCatOpen(false);
                                            }}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-muted/30 rounded-xl p-3 flex items-start justify-between gap-2 group/desc hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">Keterangan</p>
                                    <p className="text-sm font-medium leading-snug text-foreground/90 line-clamp-2">
                                        {parsedData.description}
                                    </p>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" side="top">
                                <div className="space-y-2">
                                    <Label className="text-xs">Ubah Keterangan</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={editDesc}
                                            onChange={e => setEditDesc(e.target.value)}
                                            autoFocus
                                            className="h-8 text-sm"
                                        />
                                        <Button size="sm" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/desc:opacity-100 transition-opacity absolute right-3 top-3" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
