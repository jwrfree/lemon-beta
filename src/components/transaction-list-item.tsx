
'use client';
import React, { useState } from 'react';
import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2, Edit2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { useApp } from '@/components/app-provider';

export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const controls = useAnimation();
    const x = useMotionValue(0);
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
        if (!hapticTriggered && Math.abs(x.get()) > ACTION_WIDTH / 2) {
            if (window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
            setHapticTriggered(true);
        }
    };
    
    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const currentX = x.get();
        const threshold = ACTION_WIDTH * 0.75;

        if (currentX < -threshold) {
             controls.start({ x: -ACTION_WIDTH });
        } else if (currentX > threshold) {
            controls.start({ x: ACTION_WIDTH });
        } else {
            resetSwipe();
        }
    };
    
    const deleteScaleX = useTransform(x, (latestX) => latestX < 0 ? Math.min(Math.abs(latestX) / ACTION_WIDTH, 1) : 0);
    const editScaleX = useTransform(x, (latestX) => latestX > 0 ? Math.min(latestX / ACTION_WIDTH, 1) : 0);


    return (
        <div className="relative overflow-hidden rounded-lg bg-card" onClick={resetSwipe}>
            <motion.div 
                className="absolute inset-y-0 right-0 flex items-center justify-start bg-destructive text-destructive-foreground" 
                style={{ width: ACTION_WIDTH, scaleX: deleteScaleX, transformOrigin: 'right' }}
            >
                <motion.div 
                    className="flex items-center justify-center h-full w-full" 
                    onClick={handleDeleteClick}
                >
                    <Trash2 className="h-5 w-5 ml-auto mr-6" />
                </motion.div>
            </motion.div>

            <motion.div 
                className="absolute inset-y-0 left-0 flex items-center justify-end bg-secondary text-secondary-foreground" 
                style={{ width: ACTION_WIDTH, scaleX: editScaleX, transformOrigin: 'left' }}
            >
                <motion.div 
                    className="flex items-center justify-center h-full w-full" 
                    onClick={handleEditClick}
                >
                    <Edit2 className="h-5 w-5 mr-auto ml-6" />
                </motion.div>
            </motion.div>
            
            <motion.div
                style={{ x }}
                animate={controls}
                drag="x"
                dragConstraints={{ left: -ACTION_WIDTH, right: ACTION_WIDTH }}
                dragElastic={0.2}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                onPanEnd={() => setHapticTriggered(false)}
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
