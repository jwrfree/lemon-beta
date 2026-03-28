import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { getCategoryIcon } from '@/lib/category-utils';
import { Category } from '@/lib/categories';
import { Wallet } from '@/types/models';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CategoryGrid } from '../category-grid';
import { SubCategorySheet } from '../sub-category-sheet';

import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, Calendar as CalendarIcon, Edit3, ShieldCheck, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { UnifiedTransactionInputValues } from '../../schemas/transaction-schema';
import { AmountInput } from './amount-input';

interface SemanticTransactionReviewProps {
    form: UseFormReturn<UnifiedTransactionInputValues>;
    expenseCategories: Category[];
    incomeCategories: Category[];
    wallets: Wallet[];
}

export const SemanticTransactionReview = ({
    form,
    expenseCategories,
    incomeCategories,
    wallets
}: SemanticTransactionReviewProps) => {
    const type = form.watch('type');
    const categoryName = form.watch('category');
    const subCategoryName = form.watch('subCategory');
    const walletId = form.watch('walletId');
    const date = form.watch('date');
    const isNeed = form.watch('isNeed');
    
    const amount = form.watch('amount');
    const amountNumber = Number((amount || '0').toString().replace(/[^0-9]/g, ''));
    
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;
    const categoryObj = activeCategories.find(c => c.name === categoryName);
    const walletObj = wallets.find(w => w.id === walletId);
    
    const [activeEditor, setActiveEditor] = useState<null | 'category' | 'wallet' | 'amount'>(null);
    
    // SubCategory logic mirroring CategorySelector
    const [subCatSheetOpen, setSubCatSheetOpen] = useState(false);
    const [selectedCatForSub, setSelectedCatForSub] = useState<Category | null>(null);

    const handleCategorySelect = (cat: Category) => {
        triggerHaptic('light');
        form.setValue('category', cat.name);
        form.setValue('subCategory', '');
        
        if (cat.sub_categories && cat.sub_categories.length > 0) {
            setSelectedCatForSub(cat);
            setSubCatSheetOpen(true);
        } else {
            setActiveEditor(null);
        }
    };

    return (
        <div className="space-y-6 px-1">
            {/* Mad Libs Sentence */}
            <div className="space-y-3">
                <p className="text-label text-muted-foreground/40 px-1">Ringkasan</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg leading-loose">
                    <span className="text-muted-foreground/60 font-medium">
                        {type === 'income' ? 'Saya menerima' : 'Saya menghabiskan'}
                    </span>

                    {/* Amount Pill */}
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'amount' ? null : 'amount');
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-base font-bold border-2 shadow-sm transition-all active:scale-95 hover:scale-105",
                            activeEditor === 'amount' && "ring-2 ring-primary ring-offset-2",
                            amountNumber > 0
                                ? type === 'income'
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : "bg-secondary text-foreground border-border/10"
                                : "bg-warning/10 border-warning/30 text-warning animate-pulse"
                        )}
                    >
                        {amountNumber > 0
                            ? formatCurrency(amountNumber)
                            : '❓ Nominal'}
                    </button>

                    <span className="text-muted-foreground/60 font-medium">untuk</span>

                    {/* Category Pill */}
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'category' ? null : 'category');
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-base font-bold border-2 shadow-sm transition-all active:scale-95 hover:scale-105",
                            activeEditor === 'category' && "ring-2 ring-primary ring-offset-2",
                            categoryObj
                                ? "bg-secondary text-foreground border-border/10"
                                : "bg-warning/10 border-warning/30 text-warning animate-pulse"
                        )}
                    >
                        {categoryObj ? (
                            <>
                                {(() => {
                                    const Icon = getCategoryIcon(categoryObj.icon);
                                    return <Icon className={cn("h-4 w-4", categoryObj.color)} />;
                                })()}
                                <span>{categoryObj.name}{subCategoryName ? ` · ${subCategoryName}` : ''}</span>
                            </>
                        ) : (
                            <span>❓ Kategori</span>
                        )}
                    </button>

                    {/* Need/Want Toggle (expense only) */}
                    {type === 'expense' && (
                        <>
                            <span className="text-muted-foreground/60 font-medium">sebagai</span>
                            <button
                                type="button"
                                onClick={() => {
                                    triggerHaptic('light');
                                    form.setValue('isNeed', !isNeed);
                                }}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-base font-bold border-2 shadow-sm transition-all active:scale-95 hover:scale-105",
                                    isNeed
                                        ? "text-success bg-success/10 border-success/20"
                                        : "text-violet-600 bg-violet-500/10 border-violet-500/20"
                                )}
                            >
                                {isNeed ? (
                                    <>
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Kebutuhan</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 text-violet-600" />
                                        <span>Keinginan</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    <span className="text-muted-foreground/60 font-medium">dari</span>

                    {/* Wallet Pill */}
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'wallet' ? null : 'wallet');
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-base font-bold border-2 shadow-sm transition-all active:scale-95 hover:scale-105",
                            activeEditor === 'wallet' && "ring-2 ring-primary ring-offset-2",
                            walletObj
                                ? "bg-card border-border hover:bg-secondary/60 text-foreground"
                                : "bg-warning/10 border-warning/30 text-warning animate-pulse"
                        )}
                    >
                        <WalletIcon className="h-4 w-4 text-muted-foreground/60" />
                        <span>{walletObj ? walletObj.name : '❓ Dompet'}</span>
                    </button>

                    <span className="text-muted-foreground/60 font-medium">pada</span>

                    {/* Date Pill */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button type="button" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-base font-bold border-2 border-border bg-card shadow-sm hover:bg-secondary/60 hover:scale-105 transition-all active:scale-95 text-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{format(date || new Date(), 'dd MMM', { locale: localeId })}</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                    triggerHaptic('light');
                                    d && form.setValue('date', d);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Inline Quick Editors */}
            <AnimatePresence mode="popLayout">
                {activeEditor && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-secondary/20 rounded-card border border-border pb-5 mb-4 shadow-inner">
                            {activeEditor === 'amount' && (
                                <div className="space-y-4">
                                    <p className="text-label text-muted-foreground/40 text-center">Ubah nominal</p>
                                    <AmountInput control={form.control as any} name="amount" />
                                    <Button className="w-full mt-2 rounded-xl" onClick={() => setActiveEditor(null)}>Selesai</Button>
                                </div>
                            )}

                            {activeEditor === 'wallet' && (
                                <div className="space-y-3">
                                    <p className="text-label text-muted-foreground/40 ml-2">Pilih dompet</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                        {wallets.map(w => (
                                            <button
                                                key={w.id}
                                                onClick={() => { form.setValue('walletId', w.id); setActiveEditor(null); }}
                                                className={cn(
                                                    "snap-center shrink-0 w-[140px] flex flex-col items-start gap-1 p-3 rounded-xl border transition-all active:scale-[0.98]",
                                                    walletId === w.id 
                                                        ? "ring-2 ring-primary border-transparent bg-primary/10 shadow-sm" 
                                                        : "bg-background border-border hover:bg-secondary"
                                                )}
                                            >
                                                <span className="font-semibold text-sm line-clamp-1">{w.name}</span>
                                                <span className="text-[11px] font-bold text-muted-foreground">{formatCurrency(w.balance || 0)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeEditor === 'category' && (
                                <div className="space-y-3">
                                    <p className="text-label text-muted-foreground/40 ml-2">Pilih kategori</p>
                                    <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                        {activeCategories.map(c => {
                                            const Icon = getCategoryIcon(c.icon);
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleCategorySelect(c)}
                                                    className={cn(
                                                        "snap-center shrink-0 w-[85px] flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-[0.98]",
                                                        categoryName === c.name 
                                                            ? "ring-2 ring-primary border-transparent bg-primary/10 shadow-sm" 
                                                            : "bg-background border-border hover:bg-secondary"
                                                    )}
                                                >
                                                    <div className={cn("p-2.5 rounded-full flex items-center justify-center", c.color, categoryName === c.name ? "opacity-100" : "opacity-80")}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-semibold text-[10px] leading-tight text-center line-clamp-2 w-full">{c.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {subCatSheetOpen && selectedCatForSub && (
                    <SubCategorySheet
                        category={selectedCatForSub}
                        selectedValue={subCategoryName || ''}
                        onSelect={(val: string) => {
                            triggerHaptic('light');
                            form.setValue('subCategory', val);
                            setSubCatSheetOpen(false);
                            setActiveEditor(null);
                        }}
                        onClose={() => setSubCatSheetOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
