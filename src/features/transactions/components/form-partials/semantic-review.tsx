import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Category } from '@/lib/categories';
import { Wallet } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, Calendar as CalendarIcon, ShieldCheck, Sparkle, PencilSimple, Check } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/category-utils';
import { UnifiedTransactionInputValues } from '../../schemas/transaction-schema';
import { AmountInput } from './amount-input';
import { SubCategorySheet } from '../sub-category-sheet';
import { CategoryPickerSheet } from '../category-picker-sheet';
import { useMonthTransactions } from '../../hooks/use-month-transactions';

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
    const [activeEditor, setActiveEditor] = useState<null | 'wallet' | 'amount' | 'description'>(null);
    const [subCatSheetOpen, setSubCatSheetOpen] = useState(false);
    const [categorySheetOpen, setCategorySheetOpen] = useState(false);
    const [selectedCatForSub, setSelectedCatForSub] = useState<Category | null>(null);
    const { transactions } = useMonthTransactions();
    const dateValue = date || new Date();
    const timeValue = format(dateValue, 'HH:mm');

    const fieldButtonBase =
        "inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-left text-body-lg font-medium transition-all active:scale-[0.98]";

    const sectionCardClass = "rounded-2xl bg-muted px-4 py-4";
    const missingFieldClass = "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";

    const recentCategories = activeCategories.filter((category) =>
        transactions.some((transaction) => transaction.category === category.name && transaction.type === type)
    ).sort((a, b) => {
        const indexA = transactions.findIndex((transaction) => transaction.category === a.name && transaction.type === type);
        const indexB = transactions.findIndex((transaction) => transaction.category === b.name && transaction.type === type);
        return indexA - indexB;
    }).slice(0, 4);

    const handleCategorySelect = (category: Category) => {
        triggerHaptic('light');
        form.setValue('category', category.name);
        form.setValue('subCategory', '');
        setCategorySheetOpen(false);

        if (category.sub_categories && category.sub_categories.length > 0) {
            setSelectedCatForSub(category);
            setSubCatSheetOpen(true);
            return;
        }
    };

    const handleDateSelect = (nextDate: Date) => {
        const updatedDate = new Date(nextDate);
        updatedDate.setHours(dateValue.getHours(), dateValue.getMinutes(), 0, 0);
        form.setValue('date', updatedDate);
    };

    const handleTimeChange = (value: string) => {
        if (!value) return;

        const [hoursString, minutesString] = value.split(':');
        const hours = Number(hoursString);
        const minutes = Number(minutesString);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

        const updatedDate = new Date(dateValue);
        updatedDate.setHours(hours, minutes, 0, 0);
        form.setValue('date', updatedDate);
    };

    return (
        <div className="space-y-4 px-1">
            <div className="space-y-3">
                <div className="rounded-3xl bg-muted px-4 py-4">
                    <div className="flex items-center px-1">
                        <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                            Nominal
                        </span>
                    </div>
                    {activeEditor === 'amount' ? (
                        <div className="mt-2 flex items-center gap-2 rounded-xl bg-muted p-3">
                            <div className="min-w-0 flex-1">
                                <AmountInput
                                    control={form.control}
                                    name="amount"
                                    hideQuickAmounts
                                    hideCalculatorIcon
                                    hideLabel
                                    showCurrencyPrefix
                                />
                            </div>
                            <Button
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-2xl"
                                onClick={() => setActiveEditor(null)}
                                aria-label="Selesai edit nominal"
                            >
                                <Check size={20} weight="regular" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic('light');
                                setActiveEditor('amount');
                            }}
                            className={cn(
                                "mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98] shadow-soft",
                                amountNumber > 0
                                    ? type === 'income'
                                        ? "bg-secondary text-primary"
                                        : "bg-card text-foreground"
                                    : "animate-pulse bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
                            )}
                        >
                            <span className="min-w-0 flex-1 text-2xl font-semibold tracking-tight">
                                {amountNumber > 0 ? formatCurrency(amountNumber) : 'Isi nominal'}
                            </span>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                                <PencilSimple size={16} weight="regular" />
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className={cn(sectionCardClass, "space-y-2")}>
                    <div className="flex items-center px-1">
                        <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                            Kategori
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic('light');
                            setCategorySheetOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left transition-all active:scale-[0.98] shadow-soft"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                    {categoryObj ? (
                                        <>
                                            {(() => {
                                                const Icon = getCategoryIcon(categoryObj.icon);
                                                return (
                                                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", categoryObj.bg_color)}>
                                                        <Icon className={cn("h-4 w-4", categoryObj.color)} />
                                                    </span>
                                                );
                                            })()}
                                            <div className="min-w-0">
                                                <p className="line-clamp-1 text-sm font-semibold text-foreground">{categoryObj.name}</p>
                                        {subCategoryName && (
                                            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">{subCategoryName}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pilih kategori</span>
                            )}
                        </div>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                            <PencilSimple size={14} weight="regular" />
                        </span>
                    </button>
                </div>

                <div className={cn(sectionCardClass, "space-y-2")}>
                    <div className="flex items-center px-1">
                        <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                            Keterangan
                        </span>
                    </div>
                    {activeEditor === 'description' ? (
                        <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
                            <Input
                                value={description}
                                variant="surface"
                                onChange={(e) => form.setValue('description', e.target.value)}
                                placeholder="Tambah keterangan transaksi"
                                className="h-12 flex-1 rounded-2xl text-base font-medium"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && setActiveEditor(null)}
                            />
                            <Button
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-2xl"
                                onClick={() => setActiveEditor(null)}
                                aria-label="Selesai edit keterangan"
                            >
                                <Check size={20} weight="regular" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic('light');
                                setActiveEditor('description');
                            }}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98] shadow-soft",
                                description ? "bg-card text-foreground" : missingFieldClass
                            )}
                        >
                            <span className="line-clamp-1 min-w-0 flex-1 text-sm font-medium">
                                {description || 'Tambah keterangan transaksi'}
                            </span>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                                <PencilSimple size={14} weight="regular" />
                            </span>
                        </button>
                    )}
                </div>

                <div className={cn(sectionCardClass, "space-y-2")}>
                    <div className="flex items-center px-1">
                        <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                            Detail
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {type === 'expense' && (
                            <button
                                type="button"
                                onClick={() => {
                                    triggerHaptic('light');
                                    form.setValue('isNeed', !isNeed);
                                }}
                                className={cn(
                                    fieldButtonBase,
                                    isNeed
                                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                                        : "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100"
                                )}
                            >
                                {isNeed ? (
                                    <>
                                        <ShieldCheck size={16} weight="regular" />
                                        <span>Kebutuhan</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkle size={16} weight="regular" className="text-violet-700" />
                                        <span>Keinginan</span>
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic('light');
                                setActiveEditor(activeEditor === 'wallet' ? null : 'wallet');
                            }}
                            className={cn(
                                fieldButtonBase,
                                activeEditor === 'wallet' && "ring-2 ring-primary/20 ring-offset-2 ring-offset-muted",
                                walletObj ? "bg-card text-foreground shadow-soft" : missingFieldClass
                            )}
                        >
                            <WalletIcon size={16} weight="regular" className="text-muted-foreground/60" />
                            <span>{walletObj ? walletObj.name : 'Pilih dompet'}</span>
                        </button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(fieldButtonBase, "bg-card text-foreground shadow-soft")}
                                >
                                    <CalendarIcon size={16} weight="regular" className="text-muted-foreground/60" />
                                    <span>{format(dateValue, 'dd MMM, HH:mm', { locale: localeId })}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto rounded-3xl p-3" align="start">
                                <div className="space-y-3">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(nextDate) => {
                                            triggerHaptic('light');
                                            if (nextDate) {
                                                handleDateSelect(nextDate);
                                            }
                                        }}
                                        initialFocus
                                    />
                                    <div className="space-y-2 rounded-xl bg-muted p-3">
                                        <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground/55">
                                            Waktu
                                        </p>
                                        <Input
                                            type="time"
                                            variant="secondary"
                                            value={timeValue}
                                            onChange={(event) => handleTimeChange(event.target.value)}
                                            className="h-11 rounded-2xl"
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {activeEditor && activeEditor !== 'description' && activeEditor !== 'amount' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden px-1"
                    >
                        <div className="mb-4 rounded-3xl bg-background p-4 pb-5">
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
                                                        "snap-center flex w-[140px] shrink-0 flex-col items-start gap-1 rounded-xl p-3 transition-all active:scale-[0.98]",
                                                        walletId === wallet.id
                                                            ? "bg-secondary ring-2 ring-primary/25"
                                                            : "bg-muted"
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

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {categorySheetOpen && (
                    <CategoryPickerSheet
                        isOpen={categorySheetOpen}
                        onClose={() => setCategorySheetOpen(false)}
                        categories={activeCategories}
                        recentCategories={recentCategories}
                        selectedCategoryName={categoryName}
                        onSelect={handleCategorySelect}
                    />
                )}
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


