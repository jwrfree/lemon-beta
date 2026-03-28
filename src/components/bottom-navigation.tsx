'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Sparkles, NotebookPen, User } from 'lucide-react';
import { cn, triggerHaptic } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';
import Link from 'next/link';

export const BottomNavigation = () => {
    const pathname = usePathname();
    const {
        isTxSheetOpen,
        isWalletModalOpen,
        isBudgetModalOpen,
        isDeleteModalOpen,
        isTransferModalOpen,
        isEditWalletModalOpen,
        isGoalModalOpen,
        isReminderModalOpen,
        isDebtModalOpen,
        isDebtPaymentModalOpen,
        openTransactionSheet,
    } = useUI();

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        {
            id: 'add',
            href: '/add-smart', // Keep for fallback or SEO, but onClick will override
            icon: Sparkles,
            name: 'Smart',
            primary: true,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                openTransactionSheet();
            }
        },
        { id: 'rencana', href: '/plan', icon: NotebookPen, name: 'Rencana' },
        { id: 'profil', href: '/settings', icon: User, name: 'Profil' },
    ];

    // Check if any modal is open to hide the bottom nav
    const isModalOpen =
        isTxSheetOpen ||
        isWalletModalOpen ||
        isBudgetModalOpen ||
        isDeleteModalOpen ||
        isTransferModalOpen ||
        isEditWalletModalOpen ||
        isGoalModalOpen ||
        isReminderModalOpen ||
        isDebtModalOpen ||
        isDebtPaymentModalOpen;

    const isVisible = !isModalOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)] pb-safe"
                >
                    <div className="w-full max-w-lg mx-auto grid grid-cols-5 items-center h-16">
                        {navItems.map(item => {
                            const isActive = pathname.startsWith(item.href);

                            if (item.primary) {
                                return (
                                    <div key={item.id} className="flex justify-center items-center relative h-full">
                                        <div className="absolute -top-6 rounded-full shadow-lg h-14 w-14 bg-background p-1 border-t border-border">
                                            <Link
                                                href={item.href}
                                                prefetch={false}
                                                onClick={(e) => {
                                                    triggerHaptic('medium');
                                                    if (item.onClick) item.onClick(e);
                                                }}
                                                className={cn(
                                                    'flex items-center justify-center rounded-full h-full w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden shadow-emerald-500/20 shadow-xl'
                                                )}
                                                aria-label={item.name}
                                            >
                                                <item.icon className="h-6 w-6 relative z-10" />
                                                <span className="sr-only">{item.name}</span>
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    prefetch={false}
                                    onClick={() => triggerHaptic('light')}
                                    className={cn(
                                        'flex flex-col items-center justify-center h-full transition-all active:scale-95 group relative',
                                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    aria-label={item.name}
                                >
                                    <div className="relative flex flex-col items-center gap-1">
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute -inset-x-3 -inset-y-1 rounded-xl bg-primary/10 dark:bg-primary/20 -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={cn("h-5 w-5 transition-transform z-10", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[10px] font-semibold tracking-tight uppercase leading-none opacity-80">{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
