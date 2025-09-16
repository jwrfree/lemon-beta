
'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useSwipeable, EventData } from 'react-swipeable';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2, Edit2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/app-provider';

export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const controls = useAnimation();
    const ACTION_WIDTH = 80;

    const handlers = useSwipeable({
        onSwiping: (eventData: EventData) => {
            if (eventData.dir === "Left" || eventData.dir === "Right") {
                controls.set({ x: eventData.deltaX });

                if (!hapticTriggered && Math.abs(eventData.deltaX) > ACTION_WIDTH / 2) {
                    if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                    }
                    setHapticTriggered(true);
                }
            }
        },
        onSwiped: (eventData) => {
             setHapticTriggered(false);
             if (Math.abs(eventData.deltaX) > ACTION_WIDTH) {
                if (eventData.dir === "Left") {
                    setSwipeState('left');
                    controls.start({ x: -ACTION_WIDTH });
                } else if (eventData.dir === "Right") {
                    setSwipeState('right');
                    controls.start({ x: ACTION_WIDTH });
                }
            } else {
                setSwipeState(null);
                controls.start({ x: 0 });
            }
        },
        onTap: () => {
            if (swipeState !== null) {
                setSwipeState(null);
                controls.start({ x: 0 });
            }
        },
        trackMouse: true,
        preventScrollOnSwipe: true,
    });

    const { icon: CategoryIcon, color, bgColor } = categoryDetails(transaction.category);
    const { wallets } = useApp();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    
    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-rose-600' : 'text-green-600';

    return (
        <div className="relative overflow-hidden rounded-lg bg-card">
            <AnimatePresence>
                {swipeState === 'left' && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: ACTION_WIDTH }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-0 h-full flex items-center justify-end bg-destructive"
                    >
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-full w-20 rounded-none"
                            onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
                {swipeState === 'right' && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: ACTION_WIDTH }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-0 h-full flex items-center justify-start bg-secondary"
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-full w-20 rounded-none"
                            onClick={(e) => { e.stopPropagation(); onEdit(transaction); }}
                        >
                            <Edit2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                {...handlers}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-3 p-3 cursor-pointer relative bg-card"
            >
                <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
                    <CategoryIcon className={cn("h-5 w-5", color)} />
                </div>
                <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                        {wallet?.name}{!hideDate && ` • ${format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}`}
                    </div>
                </div>
                <div className="text-sm font-semibold text-right">
                    <span className={cn(amountColor)}>
                        {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};
