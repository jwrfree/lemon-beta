import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Category } from '@/lib/categories';
import { Wallet } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, Calendar as CalendarIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/category-utils';
import { UnifiedTransactionInputValues } from '../../schemas/transaction-schema';
import { AmountInput } from './amount-input';
import { SubCategorySheet } from '../sub-category-sheet';

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
    const description = form.watch('description');
    const amount = form.watch('amount');

    const amountNumber = Number((amount || '0').toString().replace(/[^0-9]/g, ''));
    const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;
    const categoryObj = activeCategories.find((category) => category.name === categoryName);
    const walletObj = wallets.find((wallet) => wallet.id === walletId);
    const completionCount = [amountNumber > 0, !!categoryObj, !!description, !!walletObj].filter(Boolean).length;

    const [activeEditor, setActiveEditor] = useState<null | 'category' | 'wallet' | 'amount' | 'description'>(null);
    const [subCatSheetOpen, setSubCatSheetOpen] = useState(false);
    const [selectedCatForSub, setSelectedCatForSub] = useState<Category | null>(null);

    const handleCategorySelect = (category: Category) => {
        triggerHaptic('light');
        form.setValue('category', category.name);
        form.setValue('subCategory', '');

        if (category.sub_categories && category.sub_categories.length > 0) {
            setSelectedCatForSub(category);
            setSubCatSheetOpen(true);
            return;
        }

        setActiveEditor(null);
    };

    return (
        <div className="space-y-5 px-1">
            <div className="rounded-[28px] bg-background/86 p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.32)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="px-1 text-label font-semibold uppercase tracking-widest text-muted-foreground/45">
                            Review Cepat
                        </p>
                        <p className="mt-1 px-1 text-sm text-muted-foreground/70">
                            Ketuk bagian yang ingin disesuaikan sebelum disimpan.
                        </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-label font-semibold uppercase tracking-widest text-primary shadow-[0_10px_22px_-18px_rgba(13,148,136,0.3)]">
                        {completionCount}/4 siap
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg leading-loose">
                    <span className="font-medium text-muted-foreground/60">
                        {type === 'income' ? 'Saya menerima' : 'Saya menghabiskan'}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'amount' ? null : 'amount');
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-base font-bold shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all active:scale-95 hover:scale-[1.03]",
                            activeEditor === 'amount' && "ring-2 ring-primary ring-offset-2",
                            amountNumber > 0
                                ? type === 'income'
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-foreground"
                                : "animate-pulse bg-warning/10 text-warning"
                        )}
                    >
                        {amountNumber > 0 ? formatCurrency(amountNumber) : 'Isi Nominal'}
                    </button>

                    <span className="font-medium text-muted-foreground/60">untuk</span>

                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'category' ? null : 'category');
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-base font-bold shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all active:scale-95 hover:scale-[1.03]",
                            activeEditor === 'category' && "ring-2 ring-primary ring-offset-2",
                            categoryObj
                                ? "bg-secondary text-foreground"
                                : "animate-pulse bg-warning/10 text-warning"
                        )}
                    >
                        {categoryObj ? (
                            <>
                                {(() => {
                                    const Icon = getCategoryIcon(categoryObj.icon);
                                    return <Icon className={cn("h-4 w-4", categoryObj.color)} />;
                                })()}
                                <span>{categoryObj.name}</span>
                            </>
                        ) : (
                            <span>Pilih Kategori</span>
                        )}
                    </button>

                    {subCategoryName && (
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic('light');
                                if (categoryObj) {
                                    handleCategorySelect(categoryObj);
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-secondary/55 px-3.5 py-2 text-base font-bold text-foreground shadow-[0_12px_24px_-20px_rgba(15,23,42,0.16)] transition-all active:scale-95 hover:scale-[1.03]"
                        >
                            <span>{subCategoryName}</span>
                        </button>
                    )}

                    <span className="font-medium text-muted-foreground/60">yaitu</span>

                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'description' ? null : 'description');
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-base font-bold shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all active:scale-95 hover:scale-[1.03]",
                            activeEditor === 'description' && "ring-2 ring-primary ring-offset-2",
                            description
                                ? "bg-secondary text-foreground"
                                : "animate-pulse bg-warning/10 text-warning"
                        )}
                    >
                        {description ? (
                            <span className="max-w-[170px] line-clamp-1">{description}</span>
                        ) : (
                            <span>Tambah Keterangan</span>
                        )}
                    </button>

                    {type === 'expense' && (
                        <>
                            <span className="font-medium text-muted-foreground/60">sebagai</span>
                            <button
                                type="button"
                                onClick={() => {
                                    triggerHaptic('light');
                                    form.setValue('isNeed', !isNeed);
                                }}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-base font-bold shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all active:scale-95 hover:scale-[1.03]",
                                    isNeed
                                        ? "bg-success/10 text-success"
                                        : "bg-violet-500/10 text-violet-600"
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

                    <span className="font-medium text-muted-foreground/60">dari</span>

                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveEditor(activeEditor === 'wallet' ? null : 'wallet');
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-base font-bold shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all active:scale-95 hover:scale-[1.03]",
                            activeEditor === 'wallet' && "ring-2 ring-primary ring-offset-2",
                            walletObj
                                ? "bg-card text-foreground hover:bg-secondary/60"
                                : "animate-pulse bg-warning/10 text-warning"
                        )}
                    >
                        <WalletIcon className="h-4 w-4 text-muted-foreground/60" />
                        <span>{walletObj ? walletObj.name : 'Pilih Dompet'}</span>
                    </button>

                    <span className="font-medium text-muted-foreground/60">pada</span>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2 text-base font-bold text-foreground shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition-all hover:scale-[1.03] hover:bg-secondary/60 active:scale-95"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span>{format(date || new Date(), 'dd MMM', { locale: localeId })}</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(nextDate) => {
                                    triggerHaptic('light');
                                    if (nextDate) {
                                        form.setValue('date', nextDate);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {activeEditor && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mb-4 rounded-[28px] bg-background/92 p-4 pb-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.3)]">
                            {activeEditor === 'amount' && (
                                <div className="space-y-4">
                                    <p className="text-center text-label text-muted-foreground/40">Ubah nominal</p>
                                    <AmountInput control={form.control as any} name="amount" />
                                    <Button className="mt-2 h-12 w-full rounded-xl font-bold" onClick={() => setActiveEditor(null)}>
                                        Simpan Nominal
                                    </Button>
                                </div>
                            )}

                            {activeEditor === 'description' && (
                                <div className="space-y-4">
                                    <p className="text-center text-label text-muted-foreground/40">Tulis keterangan transaksi</p>
                                    <Input
                                        value={description}
                                        onChange={(e) => form.setValue('description', e.target.value)}
                                        placeholder="Misal: makan siang tim, kopi client, bayar parkir"
                                        className="h-14 rounded-xl border-border bg-background text-lg font-medium focus-visible:ring-primary"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && setActiveEditor(null)}
                                    />
                                    <Button className="mt-2 h-12 w-full rounded-xl font-bold" onClick={() => setActiveEditor(null)}>
                                        Selesai
                                    </Button>
                                </div>
                            )}

                            {activeEditor === 'wallet' && (
                                <div className="space-y-3">
                                    <p className="ml-2 text-label text-muted-foreground/40">Pilih dompet</p>
                                    <div className="hide-scrollbar flex snap-x gap-2 overflow-x-auto pb-2">
                                        {wallets.map((wallet) => (
                                            <button
                                                key={wallet.id}
                                                onClick={() => {
                                                    form.setValue('walletId', wallet.id);
                                                    setActiveEditor(null);
                                                }}
                                                className={cn(
                                                        "snap-center flex w-[140px] shrink-0 flex-col items-start gap-1 rounded-xl p-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.18)] transition-all active:scale-[0.98]",
                                                        walletId === wallet.id
                                                            ? "bg-primary/10 ring-2 ring-primary/30"
                                                            : "bg-background hover:bg-secondary"
                                                )}
                                            >
                                                <span className="line-clamp-1 text-sm font-semibold">{wallet.name}</span>
                                                <span className="text-label font-bold text-muted-foreground">
                                                    {formatCurrency(wallet.balance || 0)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeEditor === 'category' && (
                                <div className="space-y-3">
                                    <p className="ml-2 text-label text-muted-foreground/40">Pilih kategori</p>
                                    <div className="hide-scrollbar flex snap-x gap-2.5 overflow-x-auto pb-2">
                                        {activeCategories.map((category) => {
                                            const Icon = getCategoryIcon(category.icon);
                                            return (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategorySelect(category)}
                                                    className={cn(
                                                        "snap-center flex w-[85px] shrink-0 flex-col items-center gap-2 rounded-xl p-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.18)] transition-all active:scale-[0.98]",
                                                        categoryName === category.name
                                                            ? "bg-primary/10 ring-2 ring-primary/30"
                                                            : "bg-background hover:bg-secondary"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center rounded-full p-2.5",
                                                        category.color,
                                                        categoryName === category.name ? "opacity-100" : "opacity-80"
                                                    )}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-label w-full line-clamp-2 text-center font-semibold leading-tight">
                                                        {category.name}
                                                    </span>
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
                        onSelect={(value: string) => {
                            triggerHaptic('light');
                            form.setValue('subCategory', value);
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
