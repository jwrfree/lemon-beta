'use client';
import React, { useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
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


export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const vibrated = useRef(false);
    const controls = useAnimation();
    const itemRef = useRef<HTMLDivElement>(null);
    const ACTION_WIDTH = 80;

    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dist = info.offset.x;
        if (itemRef.current && dist < -(itemRef.current.offsetWidth / 2) && !vibrated.current) {
          navigator.vibrate?.(50);
          vibrated.current = true;
        }
    };
    
    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = Math.abs(info.offset.x);
        const velocity = Math.abs(info.velocity.x);

        if (info.offset.x < 0 && (offset > ACTION_WIDTH / 2 || velocity > 200)) {
            onDelete(transaction);
        }
        
        controls.start({ x: 0 });
        vibrated.current = false;
    };

    return (
        <div className="relative bg-card rounded-lg overflow-hidden">
            <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive text-destructive-foreground" style={{ width: ACTION_WIDTH }}>
                <div className="flex flex-col items-center gap-1">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-xs font-medium">Hapus</span>
                </div>
            </div>
            
            <motion.div
                ref={itemRef}
                drag="x"
                dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
                dragElastic={0.2}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                animate={controls}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="relative bg-card"
            >
                <TransactionListItemContent transaction={transaction} hideDate={hideDate} />
            </motion.div>
        </div>
    );
};
