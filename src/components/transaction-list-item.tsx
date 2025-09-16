'use client';
import React, { useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { useApp } from '@/components/app-provider';

export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const controls = useAnimation();
    const x = useMotionValue(0);
    const ACTION_WIDTH = 100;

    const backgroundOpacity = useTransform(x, [-ACTION_WIDTH, 0], [1, 0]);
    const iconScale = useTransform(x, [-ACTION_WIDTH, -ACTION_WIDTH / 2, 0], [1, 0.5, 0]);

    const { wallets } = useApp();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    
    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-rose-600' : 'text-green-600';
    
    const { icon: CategoryIcon, color, bgColor } = categoryDetails(transaction.category);

    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Prevent dragging right
        if (info.offset.x > 0) {
            x.set(0);
            return;
        }

        const offset = Math.abs(info.offset.x);
        if (!hapticTriggered && offset > ACTION_WIDTH / 2) {
            if (window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
            setHapticTriggered(true);
        } else if (hapticTriggered && offset <= ACTION_WIDTH / 2) {
            setHapticTriggered(false);
        }
    };

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = Math.abs(info.offset.x);
        const velocity = Math.abs(info.velocity.x);

        // Animate back to origin
        controls.start({ x: 0 }); 

        // Trigger delete if swiped enough
        if (offset > ACTION_WIDTH / 2 || velocity > 200) {
           onDelete(transaction);
        }
        
        // Reset haptic trigger for next swipe
        setHapticTriggered(false);
    };

    return (
        <div className="relative overflow-hidden rounded-lg bg-card">
            <motion.div 
                className="absolute inset-y-0 right-0 flex items-center justify-start bg-destructive text-destructive-foreground"
                style={{ width: ACTION_WIDTH, opacity: backgroundOpacity }}
            >
                <motion.div 
                    className="flex items-center gap-2 pl-6"
                    style={{ scale: iconScale }}
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Hapus</span>
                </motion.div>
            </motion.div>
            
            <motion.div
                className="flex items-center gap-3 p-3 cursor-pointer relative bg-card"
                drag="x"
                dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
                dragElastic={0.1}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x }}
                animate={controls}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
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
