'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import type { Transaction } from '@/types/models';

export const ConfirmDeleteModal = ({ transaction, onClose, onConfirm }: { transaction: Transaction, onClose: () => void, onConfirm: () => Promise<void> }) => {
    const handlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const details = categoryDetails(transaction.category);
    const CategoryIcon = getCategoryIcon(details.icon);
    const bgColor = details.bg_color;
    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-foreground' : 'text-teal-600 dark:text-teal-500';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex h-fit w-full max-w-md flex-col rounded-t-card-premium bg-background shadow-[0_28px_70px_-36px_rgba(15,23,42,0.28)] md:h-auto"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border/80" />
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 pb-2 pt-5">
                    <h2 className="text-xl font-bold text-destructive tracking-tight">Hapus Transaksi?</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full bg-muted">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <div className="bg-muted/35 p-6 pt-0 space-y-6">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-snug">
                        Tindakan ini akan menghapus data transaksi secara permanen dan mengembalikan saldo dompet Anda.
                    </p>

                    <div className="relative flex items-center gap-4 overflow-hidden rounded-card-glass bg-background p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.16)]">
                        <div className={cn("flex-shrink-0 rounded-card p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]", bgColor.replace('bg-', 'bg-').replace('/50', ''))}>
                            {React.createElement(CategoryIcon, { className: "h-5 w-5" })}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-bold text-[15px] leading-tight mb-0.5 tracking-tight text-foreground">
                                {transaction.description || transaction.category}
                            </div>
                            <div className="text-label text-muted-foreground/50 flex items-center gap-1.5 flex-wrap">
                                <span>{transaction.category}</span>
                                <span className="opacity-30">•</span>
                                <span>{format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                            </div>
                        </div>
                        <div className={cn("text-sm font-semibold text-right tabular-nums tracking-tighter", amountColor)}>
                            <span>
                                {transaction.type === 'expense' ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={onConfirm} variant="destructive" className="h-14 w-full rounded-2xl text-base font-bold shadow-[0_18px_34px_-24px_rgba(225,29,72,0.32)] transition-all active:scale-[0.98]">
                            Ya, Hapus Sekarang
                        </Button>
                        <Button onClick={onClose} variant="ghost" className="h-12 w-full rounded-2xl bg-background text-label text-muted-foreground/70 transition-colors hover:text-foreground">
                            Batalkan
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

