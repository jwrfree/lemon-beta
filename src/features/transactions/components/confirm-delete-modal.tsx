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
                className="w-full max-w-md bg-background/95 backdrop-blur-xl rounded-t-card-premium shadow-2xl flex flex-col h-fit md:h-auto border-none"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="p-6 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-destructive tracking-tighter">Konfirmasi Hapus</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full h-10 w-10">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <div className="p-6 pt-0 space-y-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
                    
                    <div className="flex items-center gap-4 rounded-card-glass bg-secondary/30 p-4 border border-border/20 shadow-sm relative overflow-hidden">
                        <div className={cn("flex-shrink-0 p-3 rounded-card shadow-sm text-white", bgColor.replace('bg-', 'bg-').replace('/50', ''))}>
                            <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-semibold text-sm leading-tight mb-1 tracking-tight">{transaction.description || transaction.category}</div>
                            <div className="text-xs font-semibold text-muted-foreground/60 flex items-center gap-1.5 flex-wrap uppercase tracking-widest">
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
                        <Button onClick={onConfirm} variant="destructive" className="w-full h-14 rounded-full font-semibold shadow-xl shadow-destructive/20">
                            Ya, Hapus Transaksi
                        </Button>
                        <Button onClick={onClose} variant="ghost" className="w-full h-12 rounded-full font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                            Batalkan
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

