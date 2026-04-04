'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import type { Transaction } from '@/types/models';

interface ConfirmDeleteModalProps {
 transaction: Transaction;
 onClose: () => void;
 onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal = ({ transaction, onClose, onConfirm }: ConfirmDeleteModalProps) => {
 const [isDeleting, setIsDeleting] = useState(false);

 const details = categoryDetails(transaction.category);
 const CategoryIcon = getCategoryIcon(details.icon);
 const isExpense = transaction.type === 'expense';
 const amountColor = isExpense ? 'text-foreground': 'text-emerald-500';
 const transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

 const handleConfirm = async () => {
 if (isDeleting) return;

 setIsDeleting(true);
 try {
 await onConfirm();
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <Sheet open onOpenChange={(open) => !open && !isDeleting && onClose()}>
 <SheetContent
 side="bottom"
 hideCloseButton
 className="flex max-h-[72dvh] flex-col overflow-hidden rounded-t-[2.25rem] bg-background p-0 sm:max-h-[78dvh] sm:max-w-xl sm:rounded-t-[2.5rem]"
 >
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={transition}
 className="flex items-center justify-center pt-3"
 >
 <div className="h-1.5 w-12 rounded-full bg-border/80 transition-colors duration-200"/>
 </motion.div>

 <SheetHeader className="sr-only">
 <SheetTitle>Hapus transaksi</SheetTitle>
 <SheetDescription>Konfirmasi penghapusan transaksi.</SheetDescription>
 </SheetHeader>

 <motion.div
 initial={{ opacity: 0, y: 18 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...transition, delay: 0.04 }}
 className="flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-8"
 >
 <div className="mx-auto w-full max-w-sm space-y-3.5">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...transition, delay: 0.08 }}
 className="rounded-3xl bg-card p-5 shadow-elevation-3"
 >
 <div className="space-y-3">
 <span className="text-label text-destructive/70">
 Konfirmasi
 </span>
 <h2 className="text-display-sm text-foreground">
 Hapus transaksi?
 </h2>
 <p className="text-body-md leading-relaxed text-muted-foreground/80">
 Transaksi ini akan dihapus dan saldo dompet disesuaikan otomatis.
 </p>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ ...transition, delay: 0.12 }}
 className="rounded-3xl bg-muted/35 p-4 border border-border/15 dark:bg-card/80"
 >
 <div className="flex items-center gap-4 overflow-hidden">
 <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', details.bg_color || 'bg-muted')}>
 {CategoryIcon ? <CategoryIcon className={cn('h-5 w-5', details.color)} /> : null}
 </div>
 <div className="min-w-0 flex-1">
 <div className="truncate text-body-md tracking-tight text-foreground">
 {transaction.description || transaction.category}
 </div>
 <div className="mt-1 flex flex-wrap items-center gap-1.5 text-label text-muted-foreground/50">
 <span>{transaction.category}</span>
 <span>/</span>
 <span>{format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
 </div>
 </div>
 <div className={cn('shrink-0 text-right text-body-md tracking-tight tabular-nums', amountColor)}>
 {transaction.type === 'expense'? '- ': '+ '}
 {formatCurrency(transaction.amount)}
 </div>
 </div>
 </motion.div>
 </div>
 </motion.div>

 <div className="shrink-0 bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 border-t border-border/15 backdrop-blur-sm sm:px-8">
 <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
 <Button
 onClick={handleConfirm}
 disabled={isDeleting}
 variant="destructive"
 className="h-12 w-full rounded-full text-body-md transition-all active:scale-[0.98]"
 >
 {isDeleting ? 'Menghapus...': 'Hapus'}
 </Button>
 <Button
 onClick={onClose}
 disabled={isDeleting}
 variant="ghost"
 className="h-12 w-full rounded-full bg-background text-body-md text-muted-foreground transition-colors hover:text-foreground"
 >
 Batal
 </Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 );
};
