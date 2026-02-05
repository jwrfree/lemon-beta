'use client';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import type { Transaction } from '@/types/models';

export const ConfirmDeleteModal = ({ transaction, onClose, onConfirm } : { transaction: Transaction, onClose: () => void, onConfirm: () => Promise<void> }) => {
    const handlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    
    const { icon: CategoryIcon, color, bgColor } = categoryDetails(transaction.category);
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
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
                    <h2 className="text-xl font-bold text-destructive">Konfirmasi Hapus</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">Yakin mau menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
                             <CategoryIcon className={cn("h-5 w-5", color)} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.location ? `${transaction.location} • ` : ''}{transaction.category} &bull; {format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</div>
                        </div>
                        <div className={cn("text-sm font-semibold text-right", amountColor)}>
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
