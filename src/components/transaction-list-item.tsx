
'use client';
import React, { useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

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
                            <span>{format(parseISO(transaction.date), 'dd/MM/yy', { locale: dateFnsLocaleId })}</span>
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
    
    const x = useMotionValue(0);
    const iconScale = useTransform(x, [-80, 0], [1.2, 0.5]);

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
        const threshold = itemRef.current ? -itemRef.current.offsetWidth / 2 : -100;
        
        if (offset < threshold || velocity < -500) {
            const finalX = -(itemRef.current?.offsetWidth || 0);
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    onDelete(transaction);
                    // After action, reset position for potential re-render/undo
                    setTimeout(() => x.set(0), 500);
                }
            });
        } else {
           animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
        }
    };

    return (
        <div ref={itemRef} className="relative bg-card rounded-lg overflow-hidden">
             <div
                className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-white pr-6"
                 style={{ width: '100%' }}
            >
                <motion.div style={{ scale: iconScale }}>
                    <Trash2 className="h-6 w-6" />
                </motion.div>
            </div>
            
            <motion.div
                drag="x"
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x }}
                className="relative bg-card"
                dragConstraints={{ left: 0, right: 0 }}
            >
                <TransactionListItemContent transaction={transaction} hideDate={hideDate} />
            </motion.div>
        </div>
    );
};
