'use client';
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
    const amountColor = isExpense ? 'text-destructive' : 'text-teal-600 dark:text-teal-500';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-md bg-background rounded-t-xl shadow-lg flex flex-col h-fit md:h-auto"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-xl">
                    <h2 className="text-xl font-bold text-destructive tracking-tight">Konfirmasi Hapus</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">Yakin mau menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex items-center gap-3 rounded-xl border-none bg-muted/30 p-3.5">
                        <div className={cn("flex-shrink-0 p-2.5 rounded-xl shadow-sm", bgColor)}>
                            <CategoryIcon className={cn("h-5 w-5", details.color)} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-semibold text-sm leading-tight mb-0.5">{transaction.description || transaction.category}</div>
                            <div className="text-[11px] font-medium text-muted-foreground/70 flex items-center gap-1.5 flex-wrap">
                                <span>{transaction.subCategory || transaction.category}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>{format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                            </div>
                        </div>
                        <div className={cn("text-sm font-semibold text-right tabular-nums tracking-tight", amountColor)}>
                            <span>
                                {transaction.type === 'expense' ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onConfirm} variant="destructive" className="w-full">
                        Ya, Hapus Transaksi
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
