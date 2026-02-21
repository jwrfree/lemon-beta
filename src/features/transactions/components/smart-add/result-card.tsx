'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Pencil, ChevronRight, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryGrid } from '@/features/transactions/components/category-grid';
import { Category } from '@/lib/categories';
import { getMerchantVisuals, getMerchantLogoUrl } from '@/lib/merchant-utils';

interface ResultCardProps {
    parsedData: any;
    setParsedData: (data: any) => void;
    getCategoryVisuals: (cat: string) => any;
    incomeCategories: Category[];
    expenseCategories: Category[];
}

import { getVisualDNA, extractBaseColor } from '@/lib/visual-dna';

interface ResultCardProps {
    parsedData: any;
    setParsedData: (data: any) => void;
    getCategoryVisuals: (cat: string) => any;
    incomeCategories: Category[];
    expenseCategories: Category[];
}

export const ResultCard = ({ parsedData, setParsedData, getCategoryVisuals, incomeCategories, expenseCategories }: ResultCardProps) => {
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
    const merchantVisuals = getMerchantVisuals(parsedData.merchant || parsedData.description);
    const dna = getVisualDNA(extractBaseColor(visuals.color));
    
    // Logic: Use Merchant Logo -> Merchant Icon -> Category Icon
    const logoUrl = merchantVisuals?.domain ? getMerchantLogoUrl(merchantVisuals.domain) : null;
    const DisplayIcon = merchantVisuals?.icon || visuals.icon;
    const displayColor = merchantVisuals?.color || visuals.color;
    const displayBg = merchantVisuals?.bgColor || visuals.bgColor;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full"
        >
            {/* Apple-style Card Container with Aurora Mesh */}
            <div 
                className="bg-white/95 dark:bg-black/60 backdrop-blur-2xl rounded-[32px] p-7 shadow-2xl relative overflow-hidden group border border-white/20 dark:border-white/5"
                style={{ boxShadow: `0 30px 60px -12px ${dna.ambient.replace('0.2', '0.4')}` }}
            >
                {/* Dynamic DNA Ornament */}
                <div 
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] opacity-20"
                    style={{ background: dna.primary }}
                ></div>
                
                {/* 1. HERO AMOUNT (Apple Wallet Style) */}
                <div className="flex flex-col items-center justify-center mb-10 pt-4 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">Verified Transaction</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-5xl md:text-6xl font-black tracking-tighter text-foreground hover:scale-[1.02] active:scale-95 transition-transform cursor-text tabular-nums">
                                {formatCurrency(parsedData.amount)}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-4 rounded-[24px] shadow-2xl border-none bg-popover/90 backdrop-blur-xl" side="bottom" sideOffset={10}>
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Edit Amount</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        autoFocus
                                        className="h-11 rounded-xl bg-secondary/50 border-none shadow-inner text-lg font-bold tabular-nums"
                                    />
                                    <Button size="icon" className="h-11 w-11 rounded-xl shadow-lg" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 2. iOS SEGMENTED CONTROL (Need vs Want) */}
                <div className="bg-muted/50 p-1 rounded-full grid grid-cols-2 relative mb-8 border border-border/10">
                    {/* Active Indicator Background */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-card shadow-sm rounded-full z-0 border border-border/5"
                        initial={false}
                        animate={{
                            x: parsedData.isNeed !== false ? 4 : 'calc(100% - 4px)',
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                    
                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: true })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors duration-200",
                            parsedData.isNeed !== false ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground/70"
                        )}
                    >
                        <Heart className={cn("w-3.5 h-3.5 transition-all", parsedData.isNeed !== false ? "fill-rose-500 text-rose-500 scale-110" : "opacity-40")} />
                        Need
                    </button>
                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: false })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors duration-200",
                            parsedData.isNeed === false ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground/70"
                        )}
                    >
                        <ShoppingBag className={cn("w-3.5 h-3.5 transition-all", parsedData.isNeed === false ? "fill-primary text-primary scale-110" : "opacity-40")} />
                        Want
                    </button>
                </div>

                {/* 3. INSET GROUPED LIST (iOS Settings Style) */}
                <div className="bg-muted/30 rounded-[24px] overflow-hidden border border-border/20 shadow-inner">
                    
                    {/* Row 1: Category */}
                    <Popover open={isCatOpen} onOpenChange={setIsCatOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-white overflow-hidden border border-white/10")}
                                        style={{ background: dna.gradient }}
                                    >
                                        {logoUrl ? (
                                            <img 
                                                src={logoUrl} 
                                                alt="Merchant" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <DisplayIcon className="w-5 h-5" strokeWidth={2.5} />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start space-y-0.5">
                                        <span className="text-sm font-bold tracking-tight">{parsedData.merchant || parsedData.category}</span>
                                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                            {parsedData.merchant ? parsedData.category : (parsedData.subCategory || 'General')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground/40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Adjust</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-[28px] shadow-2xl border-none overflow-hidden" align="center">
                            <div className="p-5 bg-popover/95 backdrop-blur-xl max-h-[320px] overflow-y-auto">
                                <p className="text-[10px] font-black text-muted-foreground/40 mb-4 px-1 uppercase tracking-[0.3em]">Select Identity</p>
                                <CategoryGrid
                                    categories={parsedData.type === 'income' ? incomeCategories : expenseCategories}
                                    selectedCategory={parsedData.category}
                                    onCategorySelect={(cat) => {
                                        setParsedData({ ...parsedData, category: cat.name, subCategory: '' });
                                        setIsCatOpen(false);
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-px bg-border/10 mx-5" />

                    {/* Row 2: Description */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex items-start justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0 shadow-inner">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground/80 italic truncate pr-4">
                                        "{parsedData.description}"
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/20 mt-3 shrink-0" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 rounded-[24px] shadow-2xl border-none bg-popover/90 backdrop-blur-xl" side="top" sideOffset={10}>
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Keterangan</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        autoFocus
                                        className="h-11 rounded-xl bg-secondary/50 border-none shadow-inner text-sm font-medium"
                                        placeholder="Tulis keterangan..."
                                    />
                                    <Button size="icon" className="h-11 w-11 rounded-xl shadow-lg" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>
            </div>
        </motion.div>
    );
};

