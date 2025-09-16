'use client';
import React, { useRef } from 'react';
import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { format, parseISO } from 'date-fns';

const TransactionListItemContent = ({ transaction, hideDate }: { transaction: any; hideDate?: boolean }) => {
    const { wallets } = useApp();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    const { icon: CategoryIcon, color, bgColor } = categoryDetails(transaction.category);
    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-rose-600' : 'text-green-600';

    return (
        <div className="flex items-center gap-3 p-3">
            <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
                <CategoryIcon className={cn("h-5 w-5", color)} />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">{transaction.description}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>{wallet?.name || '...'}</span>
                    {!hideDate && (
                        <>
                            <span>&bull;</span>
                            <span>{format(parseISO(transaction.date), 'dd/MM')}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="text-sm font-semibold text-right">
                <span className={amountColor}>
                    {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
                </span>
            </div>
        </div>
    );
};


export const TransactionListItem = ({ transaction, onDelete, hideDate = false }: { transaction: any; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const vibrated = useRef(false);
    const controls = useAnimation();
    const ACTION_WIDTH = 80;

    const x = useMotionValue(0);
    
    // Animate icon scale and opacity based on drag distance
    const iconContainerOpacity = useTransform(x, [-ACTION_WIDTH, -ACTION_WIDTH / 2], [1, 0]);
    const iconScale = useTransform(x, [-ACTION_WIDTH, 0], [1, 0.5]);


    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dist = info.offset.x;
        if (itemRef.current && dist < -(itemRef.current.offsetWidth / 2) && !vibrated.current) {
          navigator.vibrate?.(50);
          vibrated.current = true;
        }
    };
    
    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        vibrated.current = false;
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const width = itemRef.current?.offsetWidth ?? 0;

        // Swipe left to delete
        if (offset < -width / 2 || velocity < -500) {
            onDelete(transaction);
        }
        
        controls.start({ x: 0 });
    };

    return (
        <div ref={itemRef} className="relative bg-card rounded-lg overflow-hidden">
             <motion.div
                className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-destructive-foreground pr-6"
                style={{ 
                    opacity: iconContainerOpacity,
                    width: '100%',
                }}
            >
                <motion.div
                    className="flex flex-col items-center gap-1"
                    style={{ scale: iconScale }}
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-xs font-medium">Hapus</span>
                </motion.div>
            </motion.div>
            
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.5, right: 0 }}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                animate={controls}
                style={{ x }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="relative bg-card"
            >
                <TransactionListItemContent transaction={transaction} hideDate={hideDate} />
            </motion.div>
        </div>
    );
};
