'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Calendar,
    CaretDown,
    Clock,
    MapPin,
    ShieldCheck,
    Sparkle,
    Wallet as WalletIcon,
    X,
} from '@phosphor-icons/react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { cn, formatCurrency } from '@/lib/utils';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import type { Transaction } from '@/types/models';

interface TransactionDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const DetailRow = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
}) => (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/40 px-4 py-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground shadow-[0_10px_20px_-16px_rgba(15,23,42,0.2)]">
            <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground/45">{label}</p>
            <div className="mt-1 text-sm font-medium leading-relaxed text-foreground">{value}</div>
        </div>
    </div>
);

export const TransactionDetailSheet = ({
    isOpen,
    onClose,
    transaction,
}: TransactionDetailSheetProps) => {
    const { wallets } = useWallets();
    const swipeHandlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    if (!transaction) return null;

    const wallet = wallets.find((item) => item.id === transaction.walletId);
    const category = categoryDetails(transaction.category);
    const CategoryIcon = getCategoryIcon(category.icon);
    const parsedDate = parseISO(transaction.date);
    const isExpense = transaction.type === 'expense';
    const contentTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="bottom"
                hideCloseButton
                className="flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[2.25rem] bg-background p-0 sm:max-h-[88dvh] sm:max-w-xl sm:rounded-t-[2.5rem]"
                {...swipeHandlers}
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={contentTransition}
                    className="flex flex-col items-center gap-1 pt-3"
                >
                    <div className="h-1.5 w-12 rounded-full bg-border/80 transition-colors duration-200" />
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-label font-medium text-muted-foreground/80 transition-colors duration-200">
                        <CaretDown size={14} weight="bold" />
                        Tarik ke bawah untuk tutup
                    </div>
                </motion.div>
                <div className="absolute right-4 top-3 z-50 sm:right-6 sm:top-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9 rounded-full bg-background text-muted-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.22)] transition-all active:scale-95 hover:bg-secondary"
                    >
                        <X size={32} weight="regular" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>

                <SheetHeader className="sr-only">
                    <SheetTitle>Detail transaksi</SheetTitle>
                    <SheetDescription>Ringkasan transaksi dalam mode baca saja.</SheetDescription>
                </SheetHeader>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...contentTransition, delay: 0.04 }}
                    className="overflow-y-auto bg-muted/35 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6 sm:pt-5"
                >
                    <div className="rounded-[30px] bg-background p-5 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.24)]">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...contentTransition, delay: 0.08 }}
                            className="rounded-[26px] bg-muted/45 p-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]", category.bg_color || 'bg-muted')}>
                                    {React.createElement(CategoryIcon, { className: cn("h-6 w-6", category.color) })}
                                </div>
                                <div className="min-w-0 flex-1 pr-10">
                                    <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground/45">
                                        Detail Transaksi
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                                        {transaction.description || transaction.category}
                                    </h2>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-background px-3 py-1 text-label font-semibold text-foreground shadow-[0_8px_18px_-14px_rgba(15,23,42,0.16)]">
                                            {transaction.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...contentTransition, delay: 0.12 }}
                            className="mt-5 rounded-[28px] bg-secondary px-5 py-5 text-center"
                        >
                            <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground/45">
                                Nominal
                            </p>
                            <p className={cn(
                                "mt-2 text-4xl font-semibold tracking-tighter tabular-nums sm:text-5xl",
                                isExpense ? "text-foreground" : "text-emerald-600 dark:text-emerald-400"
                            )}>
                                {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...contentTransition, delay: 0.16 }}
                            className="mt-5 space-y-3"
                        >
                            <DetailRow
                                label="Tanggal & Jam"
                                icon={Calendar}
                                value={
                                    <div className="flex flex-col gap-0.5">
                                        <span>{format(parsedDate, 'EEEE, d MMMM yyyy', { locale: localeId })}</span>
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                            <Clock size={14} weight="bold" />
                                            {format(parsedDate, 'HH:mm', { locale: localeId })}
                                        </span>
                                    </div>
                                }
                            />
                            <DetailRow
                                label="Dompet"
                                icon={WalletIcon}
                                value={wallet?.name || 'Dompet tidak ditemukan'}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...contentTransition, delay: 0.2 }}
                        >
                            <Accordion type="single" collapsible className="mt-5 rounded-[24px] bg-muted/60 px-4">
                                <AccordionItem value="details" className="border-none">
                                    <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline">
                                        Detail Lainnya
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pb-4">
                                        {transaction.subCategory && (
                                            <DetailRow
                                                label="Subkategori"
                                                icon={Sparkle}
                                                value={transaction.subCategory}
                                            />
                                        )}
                                        {isExpense && typeof transaction.isNeed === 'boolean' && (
                                            <DetailRow
                                                label="Tipe Pengeluaran"
                                                icon={transaction.isNeed ? ShieldCheck : Sparkle}
                                                value={transaction.isNeed ? 'Kebutuhan' : 'Keinginan'}
                                            />
                                        )}
                                        {transaction.location && (
                                            <DetailRow
                                                label="Lokasi"
                                                icon={MapPin}
                                                value={transaction.location}
                                            />
                                        )}
                                        <p className="pt-1 text-center text-xs font-medium text-muted-foreground/55">
                                            Geser item ke kanan dari daftar transaksi untuk masuk ke mode edit.
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    </div>
                </motion.div>
            </SheetContent>
        </Sheet>
    );
};
