'use client';
import React, { useRef } from 'react';
import { motion, PanInfo, useMotionValue, useAnimationControls, animate } from 'framer-motion';
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
    const iconControls = useAnimationControls();
    const rippleControls = useAnimationControls();


    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dist = info.offset.x;
        if (itemRef.current && dist < -(itemRef.current.offsetWidth / 2) && !vibrated.current) {
          navigator.vibrate?.(50);
          iconControls.start({
            scale: [1.2, 1],
            transition: { type: 'spring', stiffness: 400, damping: 10 }
          });
          rippleControls.start({
            scale: [0, 8],
            opacity: [1, 1],
            transition: { duration: 0.4, ease: "easeOut" }
          });
          vibrated.current = true;
        } else if (itemRef.current && dist > -(itemRef.current.offsetWidth / 2) && vibrated.current) {
            vibrated.current = false;
        }
    };
    
    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const threshold = itemRef.current ? -itemRef.current.offsetWidth / 2 : -100;
        
        rippleControls.start({ scale: 0, opacity: 0, transition: { duration: 0.1 } });
        vibrated.current = false;
        
        if (offset < threshold || velocity < -500) {
            const finalX = -(itemRef.current?.offsetWidth || 0);
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    onDelete(transaction);
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
                className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-white pr-6 w-full"
            >
                <motion.div
                    className="absolute right-6 h-10 w-10 bg-destructive/80 rounded-full"
                    animate={rippleControls}
                    initial={{ scale: 0, opacity: 0 }}
                />
                <motion.div animate={iconControls}>
                    <Trash2 className="h-6 w-6 text-white relative z-10" />
                </motion.div>
            </div>
            
            <motion.div
                drag="x"
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x }}
                className="relative bg-card"
                dragConstraints={{ right: 0 }}
            >
                <TransactionListItemContent transaction={transaction} hideDate={hideDate} />
            </motion.div>
        </div>
    );
};
