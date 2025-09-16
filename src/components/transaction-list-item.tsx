
'use client';
import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable, EventData } from 'react-swipeable';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2, Edit2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/app-provider';

export const TransactionListItem = ({ transaction, onEdit, onDelete }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; }) => {
    const [swipeState, setSwipeState] = useState(0);
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const ACTION_WIDTH = 80;

    const resetSwipe = () => {
        setSwipeState(0);
        setHapticTriggered(false);
        if (itemRef.current) itemRef.current.style.transform = `translateX(0px)`;
    };

    const handlers = useSwipeable({
        onSwiped: resetSwipe,
        onSwiping: (eventData: EventData) => {
            if (!hapticTriggered) {
                if ((eventData.dir === "Left" && eventData.absX > ACTION_WIDTH / 2) || (eventData.dir === "Right" && eventData.absX > ACTION_WIDTH / 2)) {
                    if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                    }
                    setHapticTriggered(true);
                }
            }
        },
        onSwipedLeft: () => {
            setSwipeState(-1);
            setHapticTriggered(false);
            if (itemRef.current) itemRef.current.style.transform = `translateX(-${ACTION_WIDTH}px)`;
        },
        onSwipedRight: () => {
            setSwipeState(1);
            setHapticTriggered(false);
            if (itemRef.current) itemRef.current.style.transform = `translateX(${ACTION_WIDTH}px)`;
        },
        onTap: resetSwipe,
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
                {swipeState === -1 && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: ACTION_WIDTH }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-0 h-full flex items-center justify-end"
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
                {swipeState === 1 && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: ACTION_WIDTH }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-0 h-full flex items-center justify-start"
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
            <div
                ref={itemRef}
                {...handlers}
                className={cn(
                    "flex items-center gap-3 p-3 transition-transform duration-300 ease-in-out cursor-pointer relative bg-card"
                )}
                onClick={(e) => {
                    if (swipeState !== 0) {
                        e.stopPropagation();
                        resetSwipe();
                    }
                }}
            >
                <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
                    <CategoryIcon className={cn("h-5 w-5", color)} />
                </div>
                <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{wallet?.name} &bull; {format(parseISO(transaction.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}</div>
                </div>
                <div className="text-sm font-semibold text-right">
                    <span className={cn(amountColor)}>
                        {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                    </span>
                </div>
            </div>
        </div>
    );
};
