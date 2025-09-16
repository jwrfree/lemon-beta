
'use client';
import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2, Edit2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/app-provider';

export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const controls = useAnimation();
    const ACTION_WIDTH = 80;

    const resetSwipe = () => {
        controls.start({ x: 0 });
        setHapticTriggered(false);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(transaction);
        resetSwipe();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(transaction);
        resetSwipe();
    };

    const { icon: CategoryIcon, color, bgColor } = categoryDetails(transaction.category);
    const { wallets } = useApp();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    
    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-rose-600' : 'text-green-600';

    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!hapticTriggered && Math.abs(info.offset.x) > ACTION_WIDTH / 2) {
            if (window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
            setHapticTriggered(true);
        }
    };
    
    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const x = info.offset.x;
        const threshold = ACTION_WIDTH * 0.75;

        if (x < -threshold) {
             controls.start({ x: -ACTION_WIDTH });
        } else if (x > threshold) {
            controls.start({ x: ACTION_WIDTH });
        } else {
            resetSwipe();
        }
    };

    return (
        <div className="relative overflow-hidden rounded-lg bg-card" onClick={resetSwipe}>
            <div className="absolute inset-y-0 left-0 flex items-center bg-secondary" style={{width: ACTION_WIDTH}}>
                 <Button
                    variant="secondary"
                    size="icon"
                    className="h-full w-full rounded-none"
                    onClick={handleEditClick}
                >
                    <motion.div animate={controls} transition={{type: 'spring', stiffness: 500, damping: 30}} style={{scale: 1}} whileHover={{scale: 1.1}}>
                        <Edit2 className="h-5 w-5" />
                    </motion.div>
                </Button>
            </div>
             <div className="absolute inset-y-0 right-0 flex items-center bg-destructive" style={{width: ACTION_WIDTH}}>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-full w-full rounded-none"
                    onClick={handleDeleteClick}
                >
                    <motion.div animate={controls} transition={{type: 'spring', stiffness: 500, damping: 30}} style={{scale: 1}} whileHover={{scale: 1.1}}>
                        <Trash2 className="h-5 w-5" />
                    </motion.div>
                </Button>
            </div>
            
            <motion.div
                animate={controls}
                drag="x"
                dragConstraints={{ left: -ACTION_WIDTH, right: ACTION_WIDTH }}
                dragElastic={0.2}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                onPanEnd={() => setHapticTriggered(false)}
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
