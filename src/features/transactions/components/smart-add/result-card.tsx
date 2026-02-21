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
            <div className="bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/20 dark:border-white/10">
                
                {/* 1. HERO AMOUNT (Apple Wallet Style) */}
                <div className="flex flex-col items-center justify-center mb-8 pt-2 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Transaksi</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-4xl md:text-5xl font-semibold tracking-tighter text-foreground hover:scale-[1.02] active:scale-95 transition-transform cursor-text decoration-dotted decoration-border/50 underline-offset-8">
                                {formatCurrency(parsedData.amount)}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-4 rounded-2xl shadow-xl border-none bg-popover/90 backdrop-blur-xl" side="bottom">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Edit Nominal</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        autoFocus
                                        className="h-10 rounded-xl bg-secondary/50 border-transparent text-lg font-semibold tabular-nums"
                                    />
                                    <Button size="icon" className="h-10 w-10 rounded-xl shadow-none" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 2. iOS SEGMENTED CONTROL (Need vs Want) */}
                <div className="bg-secondary/50 p-1 rounded-full grid grid-cols-2 relative mb-6">
                    {/* Active Indicator Background */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] rounded-full z-0"
                        initial={false}
                        animate={{
                            x: parsedData.isNeed !== false ? 4 : '100%',
                            // left: parsedData.isNeed !== false ? 4 : 'auto',
                            // right: parsedData.isNeed === false ? 4 : 'auto'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ x: parsedData.isNeed !== false ? 4 : 'calc(100% + 4px)' }} 
                    />
                    
                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: true })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-full transition-colors duration-200",
                            parsedData.isNeed !== false ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                        )}
                    >
                        <Heart className={cn("w-3.5 h-3.5", parsedData.isNeed !== false ? "fill-red-500 text-red-500" : "opacity-50")} />
                        Kebutuhan
                    </button>
                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: false })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-full transition-colors duration-200",
                            parsedData.isNeed === false ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                        )}
                    >
                        <ShoppingBag className={cn("w-3.5 h-3.5", parsedData.isNeed === false ? "fill-blue-500 text-blue-500" : "opacity-50")} />
                        Keinginan
                    </button>
                </div>

                {/* 3. INSET GROUPED LIST (iOS Settings Style) */}
                <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-border/20">
                    
                    {/* Row 1: Category */}
                    <Popover open={isCatOpen} onOpenChange={setIsCatOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors active:bg-secondary/80 group">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-white overflow-hidden", displayBg.replace('bg-', 'bg-').replace('/10', ''))}>
                                        {logoUrl ? (
                                            <img 
                                                src={logoUrl} 
                                                alt="Merchant" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to icon on error
                                                    e.currentTarget.style.display = 'none';
                                                    // We can't easily swap to component here without state, but CSS hiding works to show background.
                                                    // For a robust solution, we'd need local state, but this is a decent "graceful degradation" 
                                                    // preserving the colored circle.
                                                }}
                                            />
                                        ) : (
                                            <DisplayIcon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-semibold">{parsedData.merchant || parsedData.category}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {parsedData.merchant ? parsedData.category : (parsedData.subCategory || 'Umum')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="text-xs">Ubah</span>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl border-none overflow-hidden" align="center">
                            <div className="p-4 bg-popover/95 backdrop-blur-xl max-h-[320px] overflow-y-auto">
                                <p className="text-xs font-bold text-muted-foreground mb-3 px-1 uppercase tracking-widest">Pilih Kategori</p>
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

                    <div className="h-px bg-border/40 mx-4" />

                    {/* Row 2: Description */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors active:bg-secondary/80">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate pr-2">
                                        {parsedData.description}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 mt-1 shrink-0" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 rounded-2xl shadow-xl border-none bg-popover/90 backdrop-blur-xl" side="top">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Edit Keterangan</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        autoFocus
                                        className="h-10 rounded-xl bg-secondary/50 border-transparent text-sm"
                                        placeholder="Tulis keterangan..."
                                    />
                                    <Button size="icon" className="h-10 w-10 rounded-xl shadow-none" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                        <Check className="h-4 w-4" />
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

