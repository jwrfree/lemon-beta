'use client';
import React, { useRef } from 'react';
import { motion, PanInfo, useAnimationControls, animate, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Pencil } from 'lucide-react';
import type { Wallet, Transaction } from '@/types/models';
import type { CategoryVisuals } from '@/types/visuals';
import { cn, formatCurrency } from '@/lib/utils';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';

interface TransactionListItemProps {
    transaction: Transaction;
    wallets: Wallet[];
    getCategoryVisuals: (name: string) => CategoryVisuals;
    hideDate?: boolean;
}

const TransactionListItemContent = ({
    transaction,
    wallets,
    getCategoryVisuals,
    hideDate
}: TransactionListItemProps) => {
    const { isBalanceVisible } = useBalanceVisibility();
    const wallet = wallets.find(w => w.id === transaction.walletId);

    const { icon: CategoryIcon, color, bgColor } = getCategoryVisuals(transaction.category);

    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-destructive' : 'text-teal-600 dark:text-teal-500';

    return (
        <div className="flex items-center gap-4 p-3.5">
            <div className={cn("flex-shrink-0 p-2.5 rounded-xl shadow-sm", bgColor)}>
                <CategoryIcon className={cn("h-5 w-5", color)} />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="font-semibold text-foreground text-sm leading-tight mb-0.5">{transaction.description || transaction.category}</div>
                <div className="text-[11px] font-medium text-muted-foreground/70 flex items-center gap-1.5 flex-wrap">
                    <span>{transaction.subCategory || transaction.category}</span>
                    {transaction.location && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                    {transaction.location && <span className="truncate">{transaction.location}</span>}
                    {wallet && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                    {wallet && <span>{wallet?.name || '-'}</span>}
                    {!hideDate && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{format(parseISO(transaction.date), 'EEE, d MMM', { locale: dateFnsLocaleId })}</span>
                        </>
                    )}
                </div>
            </div>
            <div
                className={cn("text-sm font-semibold tracking-tight tabular-nums", amountColor, !isBalanceVisible && 'blur-sm transition-all duration-300')}
                aria-label={isBalanceVisible ? `Jumlah: ${formatCurrency(transaction.amount)}` : 'Jumlah disembunyikan'}
            >
                <span aria-hidden="true">
                    {isExpense ? '- ' : '+ '}
                    {isBalanceVisible ? formatCurrency(transaction.amount) : '••••'}
                </span>
            </div>
        </div>
    );
};


export const TransactionListItem = (props: TransactionListItemProps) => {
    const { transaction, hideDate = false } = props;
    const itemRef = useRef<HTMLDivElement>(null);
    const { openDeleteModal, openEditTransactionModal } = useUI();

    const deleteVibrated = useRef(false);
    const editVibrated = useRef(false);

    const x = useMotionValue(0);
    const deleteIconControls = useAnimationControls();
    const deleteRippleControls = useAnimationControls();
    const editIconControls = useAnimationControls();
    const editRippleControls = useAnimationControls();

    const deleteOpacity = useTransform(x, [-80, 0], [1, 0]);
    const editOpacity = useTransform(x, [0, 80], [0, 1]);


    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dist = info.offset.x;
        if (!itemRef.current) return;

        const deleteThreshold = -itemRef.current.offsetWidth / 2;
        const editThreshold = itemRef.current.offsetWidth / 2;

        // Swipe left for delete
        if (dist < deleteThreshold && !deleteVibrated.current) {
            navigator.vibrate?.(50);
            deleteIconControls.start({
                scale: [1.2, 1],
                transition: { type: 'spring', stiffness: 400, damping: 10 }
            });
            deleteRippleControls.start({
                scale: [0, 8],
                opacity: [1, 0],
                transition: { duration: 0.4, ease: "easeOut" }
            });
            deleteVibrated.current = true;
            editVibrated.current = false;
        } else if (dist > deleteThreshold && deleteVibrated.current) {
            deleteVibrated.current = false;
        }

        // Swipe right for edit
        if (dist > editThreshold && !editVibrated.current) {
            navigator.vibrate?.(50);
            editIconControls.start({
                scale: [1.2, 1],
                transition: { type: 'spring', stiffness: 400, damping: 10 }
            });
            editRippleControls.start({
                scale: [0, 8],
                opacity: [1, 0],
                transition: { duration: 0.4, ease: "easeOut" }
            });
            editVibrated.current = true;
            deleteVibrated.current = false;
        } else if (dist < editThreshold && editVibrated.current) {
            editVibrated.current = false;
        }
    };

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (!itemRef.current) return;

        const deleteThreshold = -itemRef.current.offsetWidth / 2;
        const editThreshold = itemRef.current.offsetWidth / 2;

        deleteRippleControls.start({ scale: 0, opacity: 0, transition: { duration: 0.1 } });
        editRippleControls.start({ scale: 0, opacity: 0, transition: { duration: 0.1 } });
        deleteVibrated.current = false;
        editVibrated.current = false;

        if (offset < deleteThreshold || velocity < -500) { // Swipe left complete
            const finalX = -itemRef.current.offsetWidth;
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    openDeleteModal(transaction);
                    setTimeout(() => x.set(0), 500);
                }
            });
        } else if (offset > editThreshold || velocity > 500) { // Swipe right complete
            const finalX = itemRef.current.offsetWidth;
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    openEditTransactionModal(transaction);
                    setTimeout(() => x.set(0), 500);
                }
            });
        }
        else { // Cancel swipe
            animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
        }
    };

    return (
        <div ref={itemRef} className="relative bg-card rounded-lg overflow-hidden">
            {/* Delete Action BG */}
            <motion.div
                style={{ opacity: deleteOpacity }}
                className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-white pr-6 w-full"
            >
                <motion.div
                    className="absolute right-6 h-10 w-10 bg-pink-800/80 rounded-full z-0"
                    animate={deleteRippleControls}
                    initial={{ scale: 0, opacity: 0 }}
                />
                <motion.div animate={deleteIconControls} className="relative z-10">
                    <Trash2 className="h-6 w-6 text-white" />
                </motion.div>
            </motion.div>
            {/* Edit Action BG */}
            <motion.div
                style={{ opacity: editOpacity }}
                className="absolute inset-y-0 left-0 flex items-center justify-start bg-primary text-primary-foreground pl-6 w-full"
            >
                <motion.div
                    className="absolute left-6 h-10 w-10 bg-primary-foreground/20 rounded-full z-0"
                    animate={editRippleControls}
                    initial={{ scale: 0, opacity: 0 }}
                />
                <motion.div animate={editIconControls} className="relative z-10">
                    <Pencil className="h-6 w-6 text-primary-foreground" />
                </motion.div>
            </motion.div>

            <motion.div
                drag="x"
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x }}
                className="relative bg-card z-20"
                whileTap={{ scale: 0.98 }}
                onTap={() => {
                    // Only open edit modal if we haven't dragged significantly
                    if (Math.abs(x.get()) < 5) {
                        openEditTransactionModal(transaction);
                    }
                }}
            >
                <TransactionListItemContent {...props} />
            </motion.div>
        </div>
    );
};
