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

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { cn, formatCurrency } from '@/lib/utils';
import { useWallets } from '@/features/wallets';
import type { Transaction } from '@/types/models';

interface TransactionDetailSheetProps {
 isOpen: boolean;
 onClose: () => void;
 transaction: Transaction | null;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
 <div className="flex items-start justify-between gap-4 py-3">
 <p className="text-label text-muted-foreground/50">{label}</p>
 <div className="min-w-0 overflow-hidden text-right">
 <div className="text-body-md text-foreground break-words leading-relaxed">{value}</div>
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
 className="flex items-center justify-center pt-3"
 >
 <div className="h-1.5 w-12 rounded-full bg-border/80 transition-colors duration-200"/>
 </motion.div>

 <SheetHeader className="sr-only">
 <SheetTitle>Detail transaksi</SheetTitle>
 <SheetDescription>Ringkasan transaksi dalam mode baca saja.</SheetDescription>
 </SheetHeader>

 <motion.div
 initial={{ opacity: 0, y: 18 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...contentTransition, delay: 0.04 }}
 className="flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-8"
 >
 <div className="mx-auto w-full max-w-sm space-y-3.5">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...contentTransition, delay: 0.08 }}
 className="rounded-3xl bg-card px-5 py-5 border border-border/40"
 >
 <div className="flex flex-col items-start text-left">
 <div className="mb-4 flex items-center gap-3">
 <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', category.bg_color || 'bg-muted')}>
 {React.createElement(CategoryIcon, { className: cn("h-4 w-4", category.color) })}
 </div>
 <span className="text-label text-muted-foreground/60">{transaction.category}</span>
 </div>

 <h2 className="text-display-sm text-foreground">
 {transaction.description || transaction.category}
 </h2>

 <div className="mt-4">
 <p className={cn(
 'text-display-lg tracking-tighter tabular-nums sm:text-display-lg',
 isExpense ? "text-foreground": "text-emerald-500"
 )}>
 {isExpense ? '-': '+'}{formatCurrency(transaction.amount)}
 </p>
 </div>
 </div>
 </motion.div>

 {/* SURFACE 2: CORE INFO */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...contentTransition, delay: 0.12 }}
 className="rounded-3xl bg-card px-4 py-2 border border-border/40"
 >
 <div className="mb-1 px-1 pt-2">
 <span className="text-label text-muted-foreground/40">Rincian Pembayaran</span>
 </div>
 <div className="space-y-1">
 <DetailRow label="Tanggal"value={format(parsedDate, 'dd MMMM yyyy', { locale: localeId })} />
 <div className="h-px w-full bg-border/35"/>
 <DetailRow label="Waktu"value={format(parsedDate, 'HH:mm', { locale: localeId })} />
 <div className="h-px w-full bg-border/35"/>
 <DetailRow label="Dompet"value={wallet?.name || '-'} />
 </div>
 </motion.div>

 {/* SURFACE 3: EXTRA DETAILS */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...contentTransition, delay: 0.16 }}
 className="overflow-hidden rounded-3xl bg-card px-1 border border-border/40"
 >
 <Accordion type="single"collapsible className="w-full">
 <AccordionItem value="details"className="border-none">
 <AccordionTrigger className="px-5 py-4 text-label text-muted-foreground/45 transition-colors hover:text-muted-foreground/60 hover:no-underline">
 Rincian Lainnya
 </AccordionTrigger>
 <AccordionContent className="px-5 pb-4 pt-1">
 <div className="mb-4 h-px w-full bg-border/35"/>
 <div className="space-y-1">
 {transaction.subCategory && (
 <>
 <DetailRow label="Subkategori"value={transaction.subCategory} />
 <div className="h-px w-full bg-border/35"/>
 </>
 )}
 {isExpense && typeof transaction.isNeed === 'boolean'&& (
 <>
 <DetailRow label="Klasifikasi"value={transaction.isNeed ? 'Kebutuhan': 'Keinginan'} />
 <div className="h-px w-full bg-border/35"/>
 </>
 )}
 {transaction.location && (
 <DetailRow label="Lokasi"value={transaction.location} />
 )}
 </div>
 </AccordionContent>
 </AccordionItem>
 </Accordion>
 </motion.div>
 </div>
 </motion.div>
 <div className="shrink-0 bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 border-t border-border/40 backdrop-blur-sm sm:px-8">
 <div className="mx-auto w-full max-w-sm">
 <Button
 onClick={onClose}
 className="h-12 w-full rounded-full bg-primary text-body-md text-primary-foreground transition-all active:scale-[0.98] hover:opacity-90"
 >
 OK
 </Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 );
};
