'use client';
import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { TransactionListItemContent } from './transaction-list-item-content';

export const TransactionListItem = ({ transaction, onEdit, onDelete, hideDate = false }: { transaction: any; onEdit: (t: any) => void; onDelete: (t: any) => void; hideDate?: boolean; }) => {
    const [hapticTriggered, setHapticTriggered] = useState(false);
    const controls = useAnimation();
    const ACTION_WIDTH = 80;

    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Prevent dragging right
        if (info.offset.x > 0) {
           controls.set({ x: 0 });
           return;
        }

        const offset = Math.abs(info.offset.x);
        
        // Trigger haptic feedback at 50%
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

        if (offset > ACTION_WIDTH / 2 || velocity > 200) {
            onDelete(transaction);
        }
        
        controls.start({ x: 0 });
        setHapticTriggered(false);
    };

    return (
        <div className="relative overflow-hidden rounded-lg bg-card">
            <div className="absolute inset-y-0 right-0 flex items-center justify-start bg-destructive text-destructive-foreground" style={{ width: ACTION_WIDTH }}>
                <div className="flex items-center gap-2 pl-6">
                    <Trash2 className="h-5 w-5" />
                </div>
            </div>
            
            <motion.div
                drag="x"
                dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
                dragElastic={0.1}
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
