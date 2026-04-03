'use client';
import { useRef } from 'react';
import { motion, PanInfo, useAnimationControls, animate, useMotionValue, useTransform } from 'framer-motion';
import { PencilSimple, Trash } from '@/lib/icons';
import type { Wallet, Transaction } from '@/types/models';
import type { CategoryVisuals } from '@/types/visuals';
import { cn, formatCurrency } from '@/lib/utils';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';
import { useMerchantIdentity } from '@/hooks/use-merchant-identity';

interface TransactionListItemProps {
    transaction: Transaction & { showDivider?: boolean };
    wallets: Wallet[];
    getCategoryVisuals: (name: string) => CategoryVisuals;
    hideDate?: boolean;
}

const TransactionListItemContent = ({
    transaction,
    wallets,
    getCategoryVisuals,
    hideDate = false,
}: TransactionListItemProps) => {
    const { isBalanceVisible } = useBalanceVisibility();
    const wallet = wallets.find(w => w.id === transaction.walletId);
    const transactionDate = parseISO(transaction.date);

    const {
        logoSource,
        handleLogoError,
        primaryLogo,
        backupLogo,
        googleLogo,
        DefaultIcon,
        iconColor,
        iconBg,
        merchantVisuals,
        categoryVisuals,
    } = useMerchantIdentity({
        merchant: transaction.merchant,
        description: transaction.description,
        category: transaction.category,
        getCategoryVisuals,
    });

    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? 'text-foreground' : 'text-success font-semibold';
    const timeLabel = hideDate
        ? format(transactionDate, 'HH:mm')
        : isToday(transactionDate)
            ? format(transactionDate, 'HH:mm')
            : isYesterday(transactionDate)
                ? 'Kemarin'
                : format(transactionDate, 'dd MMM', { locale: dateFnsLocaleId });

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 transition-colors relative group/item",
            isExpense && transaction.amount >= 1000000 && "bg-accent/5"
        )}>


            <div className={cn(
                "flex-shrink-0 h-11 w-11 rounded-squircle flex items-center justify-center transition-all duration-500 overflow-hidden",
                iconBg
            )}>
                {primaryLogo && logoSource === 'primary' && (
                    <img
                        src={primaryLogo}
                        alt=""
                        className="h-full w-full object-cover animate-in fade-in duration-500"
                        onError={handleLogoError}
                    />
                )}
                {backupLogo && logoSource === 'secondary' && (
                    <img
                        src={backupLogo}
                        alt=""
                        className="h-full w-full object-contain animate-in fade-in duration-500"
                        onError={handleLogoError}
                    />
                )}
                {googleLogo && logoSource === 'tertiary' && (
                    <img
                        src={googleLogo}
                        alt=""
                        className="h-6 w-6 object-contain animate-in zoom-in-50 duration-300"
                        onError={handleLogoError}
                    />
                )}
                {(logoSource === 'icon' || !merchantVisuals?.domain) && (
                    <DefaultIcon size={20} weight="bold" className={iconColor} />
                )}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
                <div className="font-medium text-foreground text-sm leading-snug tracking-tight truncate">
                    {transaction.description || transaction.category}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {/* Need / Want Tag */}
                    {transaction.type === 'expense' && transaction.isNeed === true && (
                        <span className="flex items-center gap-1 rounded-full bg-foreground text-label font-semibold uppercase tracking-widest text-background px-1.5 py-0.5 shadow-sm">
                            Need
                        </span>
                    )}
                    {transaction.type === 'expense' && transaction.isNeed === false && (
                        <span className="flex items-center gap-1 rounded-full bg-muted text-label font-semibold uppercase tracking-widest text-muted-foreground px-1.5 py-0.5 shadow-sm border border-border/10">
                            Want
                        </span>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground/50 truncate max-w-[110px]">
                        {transaction.category}
                    </span>
                    {transaction.subCategory && (
                        <>
                            <span className="text-muted-foreground/30 text-[10px]">·</span>
                            <span className="text-[10px] font-medium text-muted-foreground/40 truncate max-w-[80px]">{transaction.subCategory}</span>
                        </>
                    )}
                    {wallet && (
                        <>
                            <span className="text-muted-foreground/30 text-[10px]">·</span>
                            <span className="text-[10px] font-medium text-muted-foreground/50 truncate max-w-[100px]">{wallet.name}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
                <div
                    className={cn(
                        "text-sm font-medium tracking-tighter tabular-nums",
                        amountColor,
                        !isBalanceVisible && 'blur-sm transition-all duration-300',
                        isExpense && transaction.amount >= 1000000 && "text-base"
                    )}
                    aria-label={isBalanceVisible ? `Jumlah: ${formatCurrency(transaction.amount)}` : 'Jumlah disembunyikan'}
                >
                    <span aria-hidden="true">
                        {isExpense ? '−' : '+'}{isBalanceVisible ? formatCurrency(transaction.amount) : '••••'}
                    </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/30 tabular-nums">
                    {timeLabel}
                </span>
                {isExpense && transaction.amount >= 1000000 && (
                    <span className="text-label font-semibold uppercase tracking-widest bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">High</span>
                )}
            </div>
        </div>
    );
};


export const TransactionListItem = (props: TransactionListItemProps) => {
    const { transaction } = props;
    const itemRef = useRef<HTMLDivElement>(null);
    const { openDeleteModal, openTransactionDetail, openTransactionSheet } = useUI();

    const deleteVibrated = useRef(false);
    const editVibrated = useRef(false);

    const x = useMotionValue(0);
    const deleteIconControls = useAnimationControls();
    const deleteRippleControls = useAnimationControls();
    const editIconControls = useAnimationControls();
    const editRippleControls = useAnimationControls();

    const deleteOpacity = useTransform(x, [-80, 0], [1, 0]);
    const editOpacity = useTransform(x, [0, 80], [0, 1]);


    const onDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const dist = info.offset.x;
        if (!itemRef.current) return;

        const deleteThreshold = -itemRef.current.offsetWidth / 2;
        const editThreshold = itemRef.current.offsetWidth / 2;

        // Swipe left for delete
        if (dist < deleteThreshold && !deleteVibrated.current) {
            navigator.vibrate?.(50);
            deleteIconControls.start({
                scale: [1.2, 1],
                transition: { type: 'spring', stiffness: 400, damping: 10 }
            });
            deleteRippleControls.start({
                scale: [0, 8],
                opacity: [1, 0],
                transition: { duration: 0.4, ease: "easeOut" }
            });
            deleteVibrated.current = true;
            editVibrated.current = false;
        } else if (dist > deleteThreshold && deleteVibrated.current) {
            deleteVibrated.current = false;
        }

        // Swipe right for edit
        if (dist > editThreshold && !editVibrated.current) {
            navigator.vibrate?.(50);
            editIconControls.start({
                scale: [1.2, 1],
                transition: { type: 'spring', stiffness: 400, damping: 10 }
            });
            editRippleControls.start({
                scale: [0, 8],
                opacity: [1, 0],
                transition: { duration: 0.4, ease: "easeOut" }
            });
            editVibrated.current = true;
            deleteVibrated.current = false;
        } else if (dist < editThreshold && editVibrated.current) {
            editVibrated.current = false;
        }
    };

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (!itemRef.current) return;

        const deleteThreshold = -itemRef.current.offsetWidth / 2;
        const editThreshold = itemRef.current.offsetWidth / 2;

        deleteRippleControls.start({ scale: 0, opacity: 0, transition: { duration: 0.1 } });
        editRippleControls.start({ scale: 0, opacity: 0, transition: { duration: 0.1 } });
        deleteVibrated.current = false;
        editVibrated.current = false;

        if (offset < deleteThreshold || velocity < -500) { // Swipe left complete
            const finalX = -itemRef.current.offsetWidth;
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    openDeleteModal(transaction);
                    setTimeout(() => x.set(0), 500);
                }
            });
        } else if (offset > editThreshold || velocity > 500) { // Swipe right complete
            const finalX = itemRef.current.offsetWidth;
            animate(x, finalX, {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                onComplete: () => {
                    openTransactionSheet(transaction);
                    setTimeout(() => x.set(0), 500);
                }
            });
        }
        else { // Cancel swipe
            animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
        }
    };

    return (
        <div ref={itemRef} className="relative overflow-hidden">
            {/* Delete Action BG */}
            <motion.div
                style={{ opacity: deleteOpacity }}
                className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-destructive-foreground pr-6 w-full"
            >
                <motion.div
                    className="absolute right-6 h-10 w-10 bg-destructive-foreground/20 rounded-full z-0"
                    animate={deleteRippleControls}
                    initial={{ scale: 0, opacity: 0 }}
                />
                <motion.div animate={deleteIconControls} className="relative z-10">
                    <Trash size={24} weight="regular" />
                </motion.div>
            </motion.div>
            {/* Edit Action BG */}
            <motion.div
                style={{ opacity: editOpacity }}
                className="absolute inset-y-0 left-0 flex items-center justify-start bg-primary text-primary-foreground pl-6 w-full"
            >
                <motion.div
                    className="absolute left-6 h-10 w-10 bg-primary-foreground/20 rounded-full z-0"
                    animate={editRippleControls}
                    initial={{ scale: 0, opacity: 0 }}
                />
                <motion.div animate={editIconControls} className="relative z-10">
                    <PencilSimple size={24} weight="regular" />
                </motion.div>
            </motion.div>

            <motion.div
                drag="x"
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                style={{ x }}
                className="relative bg-card z-20"
                whileTap={{ scale: 0.99, backgroundColor: "var(--muted)" }}
                onTap={() => {
                    // Tap opens the read-only detail view. Editing stays on swipe right.
                    if (Math.abs(x.get()) < 5) {
                        openTransactionDetail(transaction);
                    }
                }}
            >
                <TransactionListItemContent {...props} />
                {transaction.showDivider && (
                    <div className="absolute bottom-0 right-0 left-[76px] h-px bg-border z-50" />
                )}
            </motion.div>
        </div>
    );
};

